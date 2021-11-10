import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import QuickSwapFactoryABI from "../abi/quickswapFactoryABI.json";
import QuickSwapPair from "../abi/QuickSwapPair.json";
import BigNumber from "bignumber.js";

const WETH_ADDRESS = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";
const QUICKSWAP_FACTORY_ADDRESS = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";

const useEstimateOutput = (
  amount,
  token0,
  selectedToken,
  reservers,
  totalSupplyStakingToken,
  totalSupply
) => {
  const { library } = useWeb3React();

  const [value, setValue] = useState(0);

  useEffect(() => {
    const esitmateOutput = async () => {
      const factoryContract = new library.eth.Contract(
        QuickSwapFactoryABI,
        QUICKSWAP_FACTORY_ADDRESS
      );

      let [pairWETHSelectToken, pairWETH0token] = await Promise.all([
        factoryContract.methods
          .getPair(selectedToken.address, WETH_ADDRESS)
          .call(),
        factoryContract.methods.getPair(token0.address, WETH_ADDRESS).call(),
      ]);

      const pairWETHSelectTokenContract = new library.eth.Contract(
        QuickSwapPair,
        pairWETHSelectToken
      );

      const pairWETH0tokenContract = new library.eth.Contract(
        QuickSwapPair,
        pairWETH0token
      );

      const [
        selectToken0Address,
        selectTokenReverse,
        token0Address,
        token0Reserve,
        token0decimals,
      ] = await Promise.all([
        pairWETHSelectTokenContract.methods.token0().call(),
        pairWETHSelectTokenContract.methods.getReserves().call(),
        pairWETH0tokenContract.methods.token0().call(),
        pairWETH0tokenContract.methods.getReserves().call(),
        pairWETH0tokenContract.methods.decimals().call(),
      ]);

      const isSelectToken0Eth =
        selectToken0Address.toLowerCase() === WETH_ADDRESS.toLowerCase();
      const selectTokenRate = isSelectToken0Eth
        ? new BigNumber(selectTokenReverse._reserve0).div(
            selectTokenReverse._reserve1
          )
        : new BigNumber(selectTokenReverse._reserve1).div(
            selectTokenReverse._reserve0
          );
      const amountETH = new BigNumber(amount)
        .times(new BigNumber(10).pow(selectedToken.decimals))
        .times(selectTokenRate)
        .div(new BigNumber(10).pow(18))

      const isToken0Eth =
        token0Address.toLowerCase() === WETH_ADDRESS.toLowerCase();
      const token0Rate = isToken0Eth
        ? new BigNumber(token0Reserve._reserve0).div(
            selectTokenReverse._reserve1
          )
        : new BigNumber(token0Reserve._reserve1).div(
            selectTokenReverse._reserve0
          );

      const amountToken0 = new BigNumber(amountETH).times(token0Rate);

      const convertedValue = new BigNumber(totalSupply)
          .div(totalSupplyStakingToken)
          .times(amountToken0.times(new BigNumber(10).pow(token0decimals)))
          .div(new BigNumber(10).pow(18))
          .toFixed();
      setValue(convertedValue);
    };

    if (amount && selectedToken.address) {
      esitmateOutput();
    }
  }, [amount, selectedToken.address]);

  return value;
};

export default useEstimateOutput;
