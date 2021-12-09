import { FARM_TYPE, PROTOCOL_FUNCTION } from "../const";
import RewarderABI from "../abi/RewarderABI.json";
import BigNumber from "bignumber.js";

export const getDeposited = async (library, rewarderAddress, pId, account) => {
  const rewarderContract = new library.eth.Contract(
    RewarderABI,
    rewarderAddress
  );
  const reward = await rewarderContract.methods
    .pendingToken(pId, account)
    .call();

  return new BigNumber(reward).div(new BigNumber(10).pow(18)).toFixed();
};

export const getDepositedQuickSwap = async (library, farmAddress, account) => {
  const farmContract = new library.eth.Contract(
    PROTOCOL_FUNCTION[FARM_TYPE.quickswap].abi,
    farmAddress
  );
  const stakedBalance = await farmContract.methods.balanceOf(account).call();

  return new BigNumber(stakedBalance).div(new BigNumber(10).pow(18)).toFixed();
};
