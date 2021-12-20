import {
  FARM_TYPE,
  PROTOCOL_FUNCTION,
  USDT_ADDRESS,
  WETH_ADDRESS,
} from "../const";
import FarmABI from "../abi/SushiFarmABI.json";
import BigNumber from "bignumber.js";
import { isValidAddress } from "./index";
import QuickSwapPair from "../abi/QuickSwapPair.json";
import { tokenToWeth, WETHtoUSDT } from "./tvl";

export const getDeposited = async (
  library,
  farmAddress,
  pId,
  account,
  factoryContract,
  lpToken
) => {
  const farmContract = new library.eth.Contract(FarmABI, farmAddress);
  const stakedBalance = await farmContract.methods
    .userInfo(pId, account)
    .call();

  const amount = new BigNumber(stakedBalance.amount)
    .div(new BigNumber(10).pow(18))
    .toFixed();
  return convertLPtoUSDT(factoryContract, lpToken, amount, library);
};

export const getDepositedQuickSwap = async (
  library,
  farmAddress,
  account,
  factoryContract,
  lpToken
) => {
  const farmContract = new library.eth.Contract(
    PROTOCOL_FUNCTION[FARM_TYPE.quickswap].abi,
    farmAddress
  );
  const stakedBalance = await farmContract.methods.balanceOf(account).call();

  return convertLPtoUSDT(factoryContract, lpToken, stakedBalance, library);
};

export const convertLPtoUSDT = async (
  factoryContract,
  lpToken,
  amount,
  library
) => {
  if (new BigNumber(amount).isZero()) {
    return 0;
  }
  let [pairAddress1, pairAddress2] = await Promise.all([
    factoryContract.methods
      .getPair(lpToken.token0.address, USDT_ADDRESS)
      .call(),
    factoryContract.methods
      .getPair(lpToken.token1.address, USDT_ADDRESS)
      .call(),
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
    const tokenHold = new BigNumber(amount)
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
    const tokenHold = new BigNumber(amount)
      .times(new BigNumber(10).pow(18))
      .div(lpToken.totalSupply)
      .times(
        isUsedToken0 ? lpToken.reserves._reserve0 : lpToken.reserves._reserve1
      );
    const totalSupplyToETH = await tokenToWeth(tokenHold, library, usedToken);
    const totalSupplyToUSDT = await WETHtoUSDT(
      totalSupplyToETH,
      library,
      usedToken
    );
    return totalSupplyToUSDT.times(2).div(new BigNumber(10).pow(6)).toFixed(6);
  }
};
