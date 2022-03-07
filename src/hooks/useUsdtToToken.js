import { useFactoryContract, useLibrary } from "./useContract";
import { useEffect, useState } from "react";
import { USDT_ADDRESS, WETH_ADDRESS } from "../const";
import QuickSwapPair from "../abi/QuickSwapPair.json";
import BigNumber from "bignumber.js";
import { isValidAddress } from "../utils";
import { usdtToWETH } from "../utils/tvl";

const useUsdtToToken = (usdtAmount, toToken, type) => {
  const library = useLibrary();
  const [value, setValue] = useState("0");
  const factoryContract = useFactoryContract(type);

  const fetchValue = async () => {
    const pairTokenUSDT = await factoryContract.methods
      .getPair(toToken.address, USDT_ADDRESS)
      .call();
    if (isValidAddress(pairTokenUSDT)) {
      const pairUsdtContract = new library.eth.Contract(
        QuickSwapPair,
        pairTokenUSDT
      );
      const [token0, reserves] = await Promise.all([
        pairUsdtContract.methods.token0().call(),
        pairUsdtContract.methods.getReserves().call(),
      ]);
      const tokenRate =
        token0.toLowerCase() === toToken.address.toLowerCase()
          ? new BigNumber(reserves._reserve0).div(reserves._reserve1)
          : new BigNumber(reserves._reserve1).div(reserves._reserve0);
      const tokenAmount = new BigNumber(usdtAmount)
        .times(tokenRate)
        .times(new BigNumber(10).pow(6 - toToken.decimals))
        .toFixed();
      setValue(tokenAmount);
    } else {
      const pairTokenWETH = await factoryContract.methods
        .getPair(toToken.address, WETH_ADDRESS)
        .call();
      if (isValidAddress(pairTokenWETH)) {
        const wethAmount = await usdtToWETH(usdtAmount, library);
        const pairtTokenWETHContract = new library.eth.Contract(
          QuickSwapPair,
          pairTokenWETH
        );
        const [token0, reserves] = await Promise.all([
          pairtTokenWETHContract.methods.token0().call(),
          pairtTokenWETHContract.methods.getReserves().call(),
        ]);
        const tokenRate =
          token0.toLowerCase() === toToken.address.toLowerCase()
            ? new BigNumber(reserves._reserve0).div(reserves._reserve1)
            : new BigNumber(reserves._reserve1).div(reserves._reserve0);
        const tokenAmount = new BigNumber(wethAmount)
          .times(tokenRate)
          .times(new BigNumber(10).pow(18 - toToken.decimals))
          .toFixed();
        setValue(tokenAmount);
      }
    }
  };

  useEffect(() => {
    if (usdtAmount && toToken) {
      fetchValue();
    }
  }, [usdtAmount, toToken]);

  return value;
};
export default useUsdtToToken;
