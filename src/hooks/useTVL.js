import { useState, useEffect } from "react";
import QuickSwapFactoryABI from "../abi/quickswapFactoryABI.json";
import QuickSwapPair from "../abi/QuickSwapPair.json";
import { useWeb3React } from "@web3-react/core";
import web3 from "web3";
import BigNumber from "bignumber.js";
import { isValidAddress } from "../utils";

const QUICKSWAP_FACTORY_ADDRESS = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
const WETH_ADDRESS = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

const useTVL = (token0, token1, totalSupply, totalSupplyStakingToken) => {
  const { library } = useWeb3React();
  const [value, setValue] = useState(0);

  useEffect(() => {
    const getData = async () => {
      const factoryContract = new library.eth.Contract(
        QuickSwapFactoryABI,
        QUICKSWAP_FACTORY_ADDRESS
      );

      let [pairAddress1, pairAddress2] = await Promise.all([
        factoryContract.methods.getPair(token0.address, USDT_ADDRESS).call(),
        factoryContract.methods.getPair(token1.address, USDT_ADDRESS).call(),
      ]);

      if (
        isValidAddress(pairAddress2) ||
        isValidAddress(pairAddress1)
      ) {
        const isUsedToken0 = isValidAddress(pairAddress1);
        const pairContract = new library.eth.Contract(
          QuickSwapPair,
          isUsedToken0 ? pairAddress1 : pairAddress2
        );

        const [token0Address, reverse] = await Promise.all([
          pairContract.methods.token0().call(),
          pairContract.methods.getReserves().call(),
        ]);
        const tokenRate = new BigNumber(reverse._reserve1).div(
          reverse._reserve0
        );
        const tokenHold = new BigNumber(totalSupply)
          .div(totalSupplyStakingToken)
          .times(isUsedToken0 ? token0.reserves : token1.reserves);
        const totalSupplyUsdt = new BigNumber(tokenHold)
          .div(new BigNumber(10).pow(6))
          .times(tokenRate)
          .times(2);

        setValue(totalSupplyUsdt.toFixed(6));
      }
      // if (!pairAddress1) {
      //   [pairAddress1, pairAddress2] = await Promise.all([
      //     factoryContract.methods.getPair(tokenAddress0, WETH_ADDRESS).call(),
      //     factoryContract.methods.getPair(tokenAddress1, WETH_ADDRESS).call(),
      //   ]);
      // }

      // if (
      //   web3.utils.isAddress(pairAddress2) ||
      //   web3.utils.isAddress(pairAddress1)
      // ) {
      //   const pairContract = new library.eth.Contract(
      //     QuickSwapPair,
      //     web3.utils.isAddress(pairAddress2) ?? web3.utils.isAddress(pairAddress1)
      //   );
      //   const [token0, reverse] = await Promise.all([
      //     pairContract.methods.token0().call(),
      //     pairContract.methods.getReserves().call(),
      //   ]);
      //   console.log(token0, reverse);
      // }
    };
    if (token0.address && token1.address && totalSupply) {
      getData();
    }
  }, [token0.address, token1.address, totalSupply]);
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

  const [reserves] = await Promise.all([
    pairContract.methods.getReserves().call(),
  ]);
  const tokenRate = new BigNumber(reserves._reserve0).div(reserves._reserve1);
  return new BigNumber(amount).times(tokenRate).times(new BigNumber(10).pow(12));
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
  const tokenRate = new BigNumber(reserves._reserve0).div(reserves._reserve1);
  return new BigNumber(amount).times(tokenRate).times(new BigNumber(10).pow(12));
};
export default useTVL;
