import BigNumber from "bignumber.js";
import { useState, useEffect } from "react";
import FarmABI from "../abi/FarmABI.json";
import QuickSwapPair from "../abi/QuickSwapPair.json";
import useTVL from "./useTVL";
import { useWeb3React } from "@web3-react/core";
import QuickSwapFactoryABI from "../abi/quickswapFactoryABI.json";

const QUICKSWAP_FACTORY_ADDRESS = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";

const useCalculateApr = (farmAddress, tvl, index) => {
  const [value, setValue] = useState();
  const { library } = useWeb3React();

  useEffect(() => {
    const getData = async () => {
      const farmContract = new library.eth.Contract(FarmABI, farmAddress);
      const [rewardsToken, rewardRate] = await Promise.all([
        farmContract.methods.rewardsToken().call(),
        farmContract.methods.rewardRate().call(),
      ]);
      const rewardRatePerYear = new BigNumber(rewardRate)
        .times(86400)
        .times(365);
      console.log('reward rate',rewardRate);
      console.log(rewardRatePerYear.toFixed());
      const rewardToUSD = await convertToUsdt(
        rewardRatePerYear,
        library,
        rewardsToken
      );
      console.log(rewardToUSD.toFixed());
      console.log(tvl);
      setValue(rewardToUSD.div(tvl).toFixed());
    };
    if (farmAddress && tvl) {
      getData();
    }
  }, [farmAddress, tvl, index]);
  return value;
};

const convertToUsdt = async (amount, library, address) => {
  const factoryContract = new library.eth.Contract(
    QuickSwapFactoryABI,
    QUICKSWAP_FACTORY_ADDRESS
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

  return new BigNumber(amount).times(tokenRate);
};

export default useCalculateApr;
