import { useState, useEffect } from "react";
import QuickSwapPair from "../abi/QuickSwapPair.json";
import BigNumber from "bignumber.js";
import { isValidAddress } from "../utils";
import {
  USDT_ADDRESS,
  WETH_ADDRESS,
} from "../const";
import {useFactoryContract, useLibrary} from "./useContract";
import { tokenToWeth, WETHtoUSDT } from "../utils/tvl";

const useLPtoUSDT = (lpToken, amount, type) => {
  const library = useLibrary();
  const [value, setValue] = useState(0);
  const factoryContract = useFactoryContract(type);

  const getData = async () => {
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
        .times(new BigNumber(10).pow(18))
        .div(lpToken.totalSupply)
        .times(
          isUsedToken0 ? lpToken.reserves._reserve0 : lpToken.reserves._reserve1
        );
      const totalSupplyUsdt = new BigNumber(tokenHold)
        .div(new BigNumber(10).pow(6))
        .times(tokenRate)
        .times(2);

      setValue(totalSupplyUsdt.toFixed());
      return;
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
      setValue(
        totalSupplyToUSDT.times(2).div(new BigNumber(10).pow(6)).toFixed()
      );
    }
  };

  useEffect(() => {
    if (lpToken.token0.address && lpToken.token1.address && amount) {
      getData();
    }
  }, [lpToken.token0.address, amount]);
  return value;
};

export default useLPtoUSDT;
