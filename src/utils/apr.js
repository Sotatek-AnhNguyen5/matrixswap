import QuickSwapPair from "../abi/QuickSwapPair.json";
import BigNumber from "bignumber.js";
import {
  BANANA_TOKEN,
  FARM_TYPE,
  PROTOCOL_FUNCTION,
  SUSHI_TOKEN,
} from "../const";
import { USDT_ADDRESS } from "../const";

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

export const calculateAPR = async (farmAddress, type, tvl, factoryContract, library) => {
  const farmContract = new library.eth.Contract(
    PROTOCOL_FUNCTION[type].abi,
    farmAddress
  );
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
    return rewardToUSD.div(tvl).times(100).toFixed(2);
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
};