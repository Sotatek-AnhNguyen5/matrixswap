import BigNumber from "bignumber.js";
import { useState, useEffect } from "react";
import QuickSwapPair from "../abi/QuickSwapPair.json";
import { useWeb3React } from "@web3-react/core";
import QuickSwapFactoryABI from "../abi/quickswapFactoryABI.json";
import { FARM_TYPE } from "../const";
import { useFarmContract } from "./useContract";

const QUICKSWAP_FACTORY_ADDRESS = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
const SUSHI_FACTORY_ADDRESS = "0xc35dadb65012ec5796536bd9864ed8773abc74c4";
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

const useCalculateApr = (farmAddress, tvl, type, rewardToken) => {
  const [value, setValue] = useState("NaN");
  const { library } = useWeb3React();
  const farmContract = useFarmContract(farmAddress, type);

  useEffect(() => {
    const getData = async () => {
      if (type === FARM_TYPE.apeswap) {
        const rewardRate = await farmContract.methods
          .bananaPerSecond()
          .call();
        const rewardRatePerYear = new BigNumber(rewardRate)
          .div(new BigNumber(10).pow(rewardToken.decimals))
          .times(86400)
          .times(365)
          .times(rewardToken.price)
          .div(tvl)
          .times(100)
          .toFixed(2);
        setValue(rewardRatePerYear);
      } else if (type === FARM_TYPE.sushiswap) {
        const [rewardRate] = await Promise.all([
          farmContract.methods.accRewardPerShare().call(),
        ]);
        const rewardRatePerYear = new BigNumber(rewardRate)
          .div(new BigNumber(10).pow(rewardToken.decimals))
          .times(86400)
          .times(365)
          .times(rewardToken.price)
          .div(tvl)
          .times(100)
          .toFixed(2);
        setValue(rewardRatePerYear);
      } else {
        const [rewardsToken, rewardRate] = await Promise.all([
          farmContract.methods.rewardsToken().call(),
          farmContract.methods.rewardRate().call(),
        ]);
        const rewardRatePerYear = new BigNumber(rewardRate)
          .div(new BigNumber(10).pow(18))
          .times(86400)
          .times(365);
        const rewardToUSD = await convertToUSD(
          rewardRatePerYear,
          library,
          rewardsToken
        );
        setValue(rewardToUSD.div(tvl).times(100).toFixed(2));
      }
    };

    if (farmAddress && tvl) {
      getData();
    }
  }, [farmAddress, tvl]);
  return value;
};

const convertToUSD = async (amount, library, address, type) => {
  const factoryContract = new library.eth.Contract(
    QuickSwapFactoryABI,
    type === "sushi" ? SUSHI_FACTORY_ADDRESS : QUICKSWAP_FACTORY_ADDRESS
  );
  const pairUSDT = await factoryContract.methods
    .getPair(USDT_ADDRESS, address)
    .call();

  const pairUsdtContract = new library.eth.Contract(QuickSwapPair, pairUSDT);

  const [token0, reserves] = await Promise.all([
    pairUsdtContract.methods.token0().call(),
    pairUsdtContract.methods.getReserves().call(),
  ]);

  const isToken0Usdt = token0.toLowerCase() === USDT_ADDRESS.toLowerCase();
  const tokenRate = isToken0Usdt
    ? new BigNumber(reserves._reserve0).div(reserves._reserve1)
    : new BigNumber(reserves._reserve1).div(reserves._reserve0);

  return new BigNumber(amount)
    .times(tokenRate)
    .times(new BigNumber(10).pow(12));
};

export default useCalculateApr;
