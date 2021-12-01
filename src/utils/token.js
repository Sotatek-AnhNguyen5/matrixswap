import PairABI from "../abi/QuickSwapPair.json";
import { getTokenInfo } from "./index";

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
