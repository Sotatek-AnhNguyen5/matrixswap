import QuickSwapPair from "../abi/QuickSwapPair.json";
import BigNumber from "bignumber.js";
import {
  BANANA_TOKEN,
  FARM_TYPE,
  PROTOCOL_FUNCTION,
  SUSHI_TOKEN,
  USDT_TOKEN,
} from "../const";
import { USDT_ADDRESS } from "../const";
import { isValidAddress } from "./index";

const rewardFunctionMap = {
  sushi: "sushiPerSecond",
  apes: "bananaPerSecond",
};

export const convertToUSD = async (
  amount,
  decimals,
  library,
  address,
  factoryContract
) => {
  if (address.toLowerCase() === USDT_TOKEN.address.toLowerCase()) {
    return new BigNumber(amount);
  }
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
  }
};

export const calculateAPR = async (
  farmAddress,
  type,
  tvl,
  factoryContract,
  library,
  miniChefts,
  allocPoint,
  rewarder
) => {
  try {
    if (new BigNumber(tvl).isZero()) {
      return 0;
    }
    const farmContract = new library.eth.Contract(
      PROTOCOL_FUNCTION[type].abi,
      farmAddress
    );
    if (type === FARM_TYPE.sushiswap || type === FARM_TYPE.apeswap) {
      const rewardToken =
        FARM_TYPE.sushiswap === type ? SUSHI_TOKEN : BANANA_TOKEN;
      const rewardRate =
        FARM_TYPE.sushiswap === type
          ? miniChefts.sushiPerSecond
          : miniChefts.bananaPerSecond;
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
      let reward2ToUSD = 0;
      if (
        new BigNumber(rewarder.rewardPerSecond).gt(0) &&
        isValidAddress(rewarder.rewardToken)
      ) {
        const reward2PerYear = new BigNumber(rewarder.rewardPerSecond)
          .div(new BigNumber(10).pow(18))
          .times(86400)
          .times(365);
        reward2ToUSD = await convertToUSD(
          reward2PerYear,
          18,
          library,
          rewarder.rewardToken,
          factoryContract
        );
      }
      return rewardToUSD
        .plus(reward2ToUSD)
        .div(tvl)
        .times(100)
        .times(new BigNumber(allocPoint).div(miniChefts.totalAllocPoint))
        .toFixed(2);
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
      return rewardToUSD.div(tvl).times(100).toFixed(2);
    }
  } catch (e) {
    return 0;
  }
};
