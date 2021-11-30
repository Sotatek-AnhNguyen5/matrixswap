import BigNumber from "bignumber.js";
import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import { BANANA_TOKEN, FARM_TYPE, SUSHI_TOKEN } from "../const";
import { useFactoryContract, useFarmContract } from "./useContract";
import { convertToUSD } from "../utils/apr";

const useCalculateApr = (farmAddress, tvl, type) => {
  const [value, setValue] = useState("NaN");
  const { library } = useWeb3React();
  const farmContract = useFarmContract(farmAddress, type);
  const factoryContract = useFactoryContract(type);
  const rewardFunctionMap = {
    sushi: "sushiPerSecond",
    apes: "bananaPerSecond",
  };

  const getData = async () => {
    if (type === FARM_TYPE.sushiswap || type === FARM_TYPE.apeswap) {
      const rewardToken =
        FARM_TYPE.sushiswap === type ? SUSHI_TOKEN : BANANA_TOKEN;
      const method = rewardFunctionMap[type];
      const rewardRate = await farmContract.methods[method]().call();
      const rewardRatePerYear = new BigNumber(rewardRate)
        .div(new BigNumber(10).pow(18))
        .times(86400)
        .times(365);
      const rewardToUSD = await convertToUSD(
        rewardRatePerYear,
        18,
        library,
        rewardToken.address,
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

  useEffect(() => {
    if (farmAddress && tvl && type) {
      getData();
    }
  }, [farmAddress, tvl, type]);
  return value;
};
export default useCalculateApr;
