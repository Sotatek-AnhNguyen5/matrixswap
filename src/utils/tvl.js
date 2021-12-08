import QuickSwapFactoryABI from "../abi/quickswapFactoryABI.json";
import {
  PROTOCOL_FUNCTION,
  QUICKSWAP_FACTORY_ADDRESS,
  USDT_ADDRESS,
  WETH_ADDRESS,
} from "../const";
import QuickSwapPair from "../abi/QuickSwapPair.json";
import BigNumber from "bignumber.js";
import { isValidAddress } from "./index";
import PairABI from "../abi/QuickSwapPair.json";

export const tokenToWeth = async (amount, library, token) => {
  const factoryContract = new library.eth.Contract(
    QuickSwapFactoryABI,
    QUICKSWAP_FACTORY_ADDRESS
  );

  const pairWETH = await factoryContract.methods
    .getPair(WETH_ADDRESS, token.address)
    .call();

  const pairContract = new library.eth.Contract(QuickSwapPair, pairWETH);

  const [token0, reserves] = await Promise.all([
    pairContract.methods.token0().call(),
    pairContract.methods.getReserves().call(),
  ]);

  const tokenRate =
    token0.toLowerCase() === WETH_ADDRESS.toLowerCase()
      ? new BigNumber(reserves._reserve0).div(reserves._reserve1)
      : new BigNumber(reserves._reserve1).div(reserves._reserve0);
  return new BigNumber(amount).times(tokenRate);
};

export const WETHtoUSDT = async (amount, library) => {
  const factoryContract = new library.eth.Contract(
    QuickSwapFactoryABI,
    QUICKSWAP_FACTORY_ADDRESS
  );

  const pairWETH = await factoryContract.methods
    .getPair(WETH_ADDRESS, USDT_ADDRESS)
    .call();

  const pairContract = new library.eth.Contract(QuickSwapPair, pairWETH);

  const [reserves] = await Promise.all([
    pairContract.methods.getReserves().call(),
  ]);
  const tokenRate = new BigNumber(reserves._reserve1).div(reserves._reserve0);
  return new BigNumber(amount).times(tokenRate);
};

export const calculateTVL = async (
  lpToken,
  farmAddress,
  factoryContract,
  library
) => {
  try {
    const lpTokenContract = new library.eth.Contract(PairABI, lpToken.address);
    let [pairAddress1, pairAddress2, totalSupply] = await Promise.all([
      factoryContract.methods
        .getPair(lpToken.token0.address, USDT_ADDRESS)
        .call(),
      factoryContract.methods
        .getPair(lpToken.token1.address, USDT_ADDRESS)
        .call(),
      lpTokenContract.methods.balanceOf(farmAddress).call(),
    ]);
    if (isValidAddress(pairAddress2) || isValidAddress(pairAddress1)) {
      const isUsedToken0 = isValidAddress(pairAddress1);
      const pairContract = new library.eth.Contract(
        QuickSwapPair,
        isUsedToken0 ? pairAddress1 : pairAddress2
      );

      const [reverse] = await Promise.all([
        pairContract.methods.getReserves().call(),
      ]);
      const tokenRate = new BigNumber(reverse._reserve1).div(reverse._reserve0);
      const tokenHold = new BigNumber(totalSupply)
        .div(lpToken.totalSupply)
        .times(
          isUsedToken0 ? lpToken.reserves._reserve0 : lpToken.reserves._reserve1
        );
      const totalSupplyUsdt = new BigNumber(tokenHold)
        .div(new BigNumber(10).pow(6))
        .times(tokenRate)
        .times(2);

      return totalSupplyUsdt.toFixed(6);
    }

    let [pair0, pair1] = await Promise.all([
      factoryContract.methods
        .getPair(lpToken.token0.address, WETH_ADDRESS)
        .call(),
      factoryContract.methods
        .getPair(lpToken.token1.address, WETH_ADDRESS)
        .call(),
    ]);

    if (isValidAddress(pair0) || isValidAddress(pair1)) {
      const isUsedToken0 = isValidAddress(pair0);
      const usedToken = isUsedToken0 ? lpToken.token0 : lpToken.token1;
      const tokenHold = new BigNumber(totalSupply)
        .div(lpToken.totalSupply)
        .times(
          isUsedToken0 ? lpToken.reserves._reserve0 : lpToken.reserves._reserve1
        );
      const totalSupplyToETH = await tokenToWeth(tokenHold, library, usedToken);
      const totalSupplyToUSDT = await WETHtoUSDT(totalSupplyToETH, library);
      return totalSupplyToUSDT
        .times(2)
        .div(new BigNumber(10).pow(6))
        .toFixed(6);
    }
  } catch (e) {
    console.log(e);
    return 0;
  }
};