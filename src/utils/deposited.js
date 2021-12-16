import { FARM_TYPE, PROTOCOL_FUNCTION } from "../const";
import FarmABI from "../abi/SushiFarmABI.json";
import BigNumber from "bignumber.js";

export const getDeposited = async (library, farmAddress, pId, account) => {
  const farmContract = new library.eth.Contract(FarmABI, farmAddress);
  const stakedBalance = await farmContract.methods
    .userInfo(pId, account)
    .call();

  return new BigNumber(stakedBalance.amount)
    .div(new BigNumber(10).pow(18))
    .toFixed();
};

export const getDepositedQuickSwap = async (library, farmAddress, account) => {
  const farmContract = new library.eth.Contract(
    PROTOCOL_FUNCTION[FARM_TYPE.quickswap].abi,
    farmAddress
  );
  const stakedBalance = await farmContract.methods.balanceOf(account).call();

  return new BigNumber(stakedBalance).div(new BigNumber(10).pow(18)).toFixed();
};
