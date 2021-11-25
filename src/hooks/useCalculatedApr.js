import BigNumber from "bignumber.js";
import { useState, useEffect } from "react";
import QuickSwapPair from "../abi/QuickSwapPair.json";
import { useWeb3React } from "@web3-react/core";
import { FARM_TYPE, SUSHI_TOKEN } from "../const";
import { useFactoryContract, useFarmContract } from "./useContract";

const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

const useCalculateApr = (farmAddress, tvl, type, rewardToken) => {
  const [value, setValue] = useState("NaN");
  const { library } = useWeb3React();
  const farmContract = useFarmContract(farmAddress, type);
  const factoryContract = useFactoryContract(type);

  useEffect(() => {
    const getData = async () => {
      if (type === FARM_TYPE.apeswap) {
        const rewardRate = await farmContract.methods.bananaPerSecond().call();
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
          farmContract.methods.sushiPerSecond().call(),
        ]);
        const rewardRatePerYear = new BigNumber(rewardRate)
          .div(new BigNumber(10).pow(18))
          .times(86400)
          .times(365)
        const rewardToUSD = await convertToUSD(
          rewardRatePerYear,
          18,
          library,
          SUSHI_TOKEN.address,
          factoryContract
        );
        setValue(rewardToUSD.div(tvl).times(100).toFixed(2));
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
          18,
          library,
          rewardsToken,
          factoryContract
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

export const convertToUSD = async (
  amount,
  decimals,
  library,
  address,
  factoryContract
) => {
  try {
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
      .times(new BigNumber(10).pow(decimals - 6));
  } catch (e) {
    console.log(e);
    console.log(address);
  }
};

export default useCalculateApr;
