import PairABI from "../abi/QuickSwapPair.json";
import { getTokenInfo } from "./index";
import BigNumber from "bignumber.js";

export const getDataToken = async (address, library) => {
  try {
    const lpContract = new library.eth.Contract(PairABI, address);
    const [token0Address, token1Address, totalSupply, reserves] =
      await Promise.all([
        lpContract.methods.token0().call(),
        lpContract.methods.token1().call(),
        lpContract.methods.totalSupply().call(),
        lpContract.methods.getReserves().call(),
      ]);
    const [token0, token1] = await Promise.all([
      getTokenInfo(token0Address, library),
      getTokenInfo(token1Address, library),
    ]);
    return {
      token0,
      token1,
      totalSupply,
      reserves,
      address,
    };
  } catch (e) {
    return {};
  }
};

export const getLPBalance = async (address, library, account) => {
  const lpContract = new library.eth.Contract(PairABI, address);
  const balance = await lpContract.methods.balanceOf(account).call();
  return new BigNumber(balance).div(new BigNumber(10).pow(18)).toFixed();
};
