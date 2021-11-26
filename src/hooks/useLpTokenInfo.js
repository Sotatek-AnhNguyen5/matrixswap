import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from "react";
import PairABI from "../abi/QuickSwapPair.json";
import { getTokenInfo } from "./useGetPairToken";

const useLpTokenInfo = (lpAddress) => {
  const { library } = useWeb3React();
  const [lpToken, setLpToken] = useState({
    token0: { symbol: "" },
    token1: { symbol: "" },
  });

  useEffect(() => {
    const getDataToken = async () => {
      const lpContract = new library.eth.Contract(PairABI, lpAddress);
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
      setLpToken({
        token0,
        token1,
        totalSupply,
        reserves,
        address: lpAddress,
      });
    };

    if (lpAddress) {
      getDataToken();
    }
  }, [lpAddress]);

  return lpToken;
};
export default useLpTokenInfo;