import { useState, useEffect, useCallback } from "react";
import { useWeb3React } from "@web3-react/core";
import QuickSwapPair from "../abi/QuickSwapPair.json";
import BigNumber from "bignumber.js";
import { useFactoryContract, useLibrary } from "./useContract";
import { isValidAddress } from "../utils";
import { debounce } from "lodash";

const WETH_ADDRESS = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619";

const useEstimateOutput = (amountToken, token, lpToken, type) => {
  const library = useLibrary();

  const [value, setValue] = useState(0);
  const factoryContract = useFactoryContract(type);

  const estimateOutput = useCallback(
    debounce(async (stakingToken, amount, selectedToken) => {
      const { token0, token1, totalSupply, reserves } = stakingToken;
      const [pairToken0, pairToken1] = await Promise.all([
        factoryContract.methods
          .getPair(selectedToken.address, token0.address)
          .call(),
        factoryContract.methods
          .getPair(selectedToken.address, token1.address)
          .call(),
      ]);

      if (
        selectedToken.address.toLowerCase() === token0.address.toLowerCase() ||
        selectedToken.address.toLowerCase() === token1.address.toLowerCase()
      ) {
        const isToken0 =
          selectedToken.address.toLowerCase() === token0.address.toLowerCase();
        const amountToHex = new BigNumber(amount)
          .times(new BigNumber(10).pow(selectedToken.decimals))
          .div(2);

        const convertedValue = new BigNumber(totalSupply)
          .times(amountToHex)
          .div(isToken0 ? reserves._reserve0 : reserves._reserve1)
          .div(new BigNumber(10).pow(18))
          .toFixed();
        setValue(convertedValue);
      } else if (isValidAddress(pairToken0) || isValidAddress(pairToken1)) {
        const tokenConvert = isValidAddress(pairToken0) ? token0 : token1;
        const tokenPair = isValidAddress(pairToken0) ? pairToken0 : pairToken1;

        const pairContract = new library.eth.Contract(QuickSwapPair, tokenPair);

        const [token0Pair, reserversPair] = await Promise.all([
          pairContract.methods.token0().call(),
          pairContract.methods.getReserves().call(),
        ]);

        const tokenRate =
          token0Pair.toLowerCase() === selectedToken.address.toLowerCase()
            ? new BigNumber(
                new BigNumber(reserversPair._reserve1).div(
                  new BigNumber(10).pow(tokenConvert.decimals)
                )
              ).div(
                new BigNumber(reserversPair._reserve0).div(
                  new BigNumber(10).pow(selectedToken.decimals)
                )
              )
            : new BigNumber(
                new BigNumber(reserversPair._reserve0).div(
                  new BigNumber(10).pow(tokenConvert.decimals)
                )
              ).div(
                new BigNumber(reserversPair._reserve1).div(
                  new BigNumber(10).pow(selectedToken.decimals)
                )
              );

        const amountToHex = new BigNumber(amount)
          .times(tokenRate)
          .times(new BigNumber(10).pow(tokenConvert.decimals))
          .div(2);
        const convertedValue = new BigNumber(totalSupply)
          .times(amountToHex)
          .div(
            isValidAddress(pairToken0) ? reserves._reserve0 : reserves._reserve1
          )
          .div(new BigNumber(10).pow(18))
          .toFixed();
        setValue(convertedValue);
      } else {
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
        ] = await Promise.all([
          pairWETHSelectTokenContract.methods.token0().call(),
          pairWETHSelectTokenContract.methods.getReserves().call(),
          pairWETH0tokenContract.methods.token0().call(),
          pairWETH0tokenContract.methods.getReserves().call(),
        ]);

        const isSelectToken0Eth =
          selectToken0Address.toLowerCase() === WETH_ADDRESS.toLowerCase();
        const selectTokenRate = isSelectToken0Eth
          ? new BigNumber(
              new BigNumber(selectTokenReverse._reserve0).div(
                new BigNumber(10).pow(18)
              )
            ).div(
              new BigNumber(selectTokenReverse._reserve1).div(
                new BigNumber(10).pow(selectedToken.decimals)
              )
            )
          : new BigNumber(
              new BigNumber(selectTokenReverse._reserve1).div(
                new BigNumber(10).pow(18)
              )
            ).div(
              new BigNumber(selectTokenReverse._reserve0).div(
                new BigNumber(10).pow(selectedToken.decimals)
              )
            );
        const amountETH = new BigNumber(amount)
          .times(selectTokenRate)
          .times(new BigNumber(10).pow(18));

        const isToken0Eth =
          token0Address.toLowerCase() === WETH_ADDRESS.toLowerCase();
        const token0Rate = isToken0Eth
          ? new BigNumber(token0Reserve._reserve1).div(token0Reserve._reserve0)
          : new BigNumber(token0Reserve._reserve0).div(token0Reserve._reserve1);

        const amountToken0 = new BigNumber(amountETH).times(token0Rate).div(2);
        const convertedValue = new BigNumber(totalSupply)
          .times(amountToken0)
          .div(reserves._reserve0)
          .div(new BigNumber(10).pow(18))
          .toFixed();
        setValue(convertedValue);
      }
    }, 500),
    []
  );

  useEffect(() => {
    if (amountToken && token.address) {
      estimateOutput(lpToken, amountToken, token);
    } else {
      setValue(0);
    }
  }, [lpToken, amountToken, token]);

  return value;
};

export default useEstimateOutput;
