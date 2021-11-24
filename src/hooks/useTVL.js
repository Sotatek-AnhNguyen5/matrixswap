import { useState, useEffect } from "react";
import QuickSwapFactoryABI from "../abi/quickswapFactoryABI.json";
import QuickSwapPair from "../abi/QuickSwapPair.json";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import { isValidAddress } from "../utils";
import {
  QUICKSWAP_FACTORY_ADDRESS,
  USDT_ADDRESS,
  WETH_ADDRESS,
} from "../const";

const useTVL = (lpToken, totalSupply, defaultValue) => {
  const { library } = useWeb3React();
  const [value, setValue] = useState(0);

  useEffect(() => {
    const getData = async () => {
      const factoryContract = new library.eth.Contract(
        QuickSwapFactoryABI,
        QUICKSWAP_FACTORY_ADDRESS
      );

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
        const tokenRate = new BigNumber(reverse._reserve1).div(
          reverse._reserve0
        );
        const tokenHold = new BigNumber(totalSupply)
          .div(lpToken.totalSupply)
          .times(
            isUsedToken0
              ? lpToken.reserves._reserve0
              : lpToken.reserves._reserve1
          );
        const totalSupplyUsdt = new BigNumber(tokenHold)
          .div(new BigNumber(10).pow(6))
          .times(tokenRate)
          .times(2);

        setValue(totalSupplyUsdt.toFixed(6));
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
        const tokenHold = new BigNumber(totalSupply)
          .div(lpToken.totalSupply)
          .times(
            isUsedToken0
              ? lpToken.reserves._reserve0
              : lpToken.reserves._reserve1
          );
        const totalSupplyToETH = await tokenToWeth(
          tokenHold,
          library,
          usedToken
        );
        const totalSupplyToUSDT = await WETHtoUSDT(
          totalSupplyToETH,
          library,
          usedToken
        );
        setValue(
          totalSupplyToUSDT.times(2).div(new BigNumber(10).pow(6)).toFixed(6)
        );
      }
    };
    if (defaultValue) {
      setValue(defaultValue);
    } else if (
      lpToken.token0.address &&
      lpToken.token1.address &&
      totalSupply
    ) {
      getData();
    }
  }, [lpToken.token0.address, totalSupply, defaultValue]);
  return value;
};

const tokenToWeth = async (amount, library, token) => {
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

const WETHtoUSDT = async (amount, library) => {
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
export default useTVL;
