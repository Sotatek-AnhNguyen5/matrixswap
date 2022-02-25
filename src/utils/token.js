import PairABI from "../abi/QuickSwapPair.json";
import { getTokenAddressFromLp, getTokenInfo } from "./index";
import BigNumber from "bignumber.js";

export const getDataToken = async (address, library) => {
  try {
    const lpContract = new library.eth.Contract(PairABI, address);
    const [lpTokenAddress, totalSupply, reserves] = await Promise.all([
      getTokenAddressFromLp(address, library),
      lpContract.methods.totalSupply().call(),
      lpContract.methods.getReserves().call(),
    ]);
    const [token0, token1] = await Promise.all([
      getTokenInfo(lpTokenAddress.token0Address, library),
      getTokenInfo(lpTokenAddress.token1Address, library),
    ]);
    return {
      token0,
      token1,
      totalSupply,
      reserves,
      address,
    };
  } catch (e) {
    throw e
  }
};

export const getLPBalance = async (address, library, account) => {
  const lpContract = new library.eth.Contract(PairABI, address);
  const balance = await lpContract.methods.balanceOf(account).call();
  return new BigNumber(balance).div(new BigNumber(10).pow(18)).toFixed();
};
