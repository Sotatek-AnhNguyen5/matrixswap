import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import BigNumber from "bignumber.js";
import { useFactoryContract, useLibrary } from "./useContract";
import { tokenToWMATIC } from "../utils/tvl";
import { isValidAddress } from "../utils";
import { USDT_TOKEN } from "../const";
import { convertLPtoUSDT } from "../utils/deposited";

const TRANSACTION_COST_FEE = 0.03;
const useTransactionCost = (token, lpToken, isZapIn, amount, farmType) => {
  const [txFee, setTxFee] = useState();
  const factoryContract = useFactoryContract(farmType);
  const library = useLibrary();

  const getTxFee = useCallback(
    debounce(async (amountToken, lpToken, usedToken) => {
      let txWMATIC = new BigNumber(0);
      const [txCost1, txCost2] = await Promise.all([
        calculateCost(usedToken, lpToken.token0, amountToken),
        calculateCost(usedToken, lpToken.token1, amountToken),
      ]);
      txWMATIC = txWMATIC.plus(txCost1).plus(txCost2);
      setTxFee(txWMATIC.toFixed());
    }, 500),
    []
  );

  const getTxZapOut = useCallback(
    debounce(async (amountToken, lpToken) => {
      const txCost = new BigNumber(amount).times(TRANSACTION_COST_FEE);
      if (!amountToken || new BigNumber(amountToken).isZero()) {
        setTxFee(0);
      }
      const value = await convertLPtoUSDT(
        factoryContract,
        lpToken,
        txCost.times(new BigNumber(10).pow(18)).toFixed(),
        library
      );
      const valueInWmatic = await tokenToWMATIC(
        value,
        library,
        USDT_TOKEN,
        factoryContract
      );
      setTxFee(valueInWmatic.toFixed());
    }, 500),
    []
  );

  const calculateCost = async (tokenCost, singleLpToken, amountToken) => {
    if (
      tokenCost.address.toLowerCase() !== singleLpToken.address.toLowerCase()
    ) {
      //split amount to 2 part
      let tokenCostAmount = new BigNumber(amountToken).div(2);
      const pairToken = await factoryContract.methods
        .getPair(tokenCost.address, singleLpToken.address)
        .call();
      tokenCostAmount = tokenCostAmount.times(TRANSACTION_COST_FEE);
      if (!isValidAddress(pairToken)) {
        tokenCostAmount = tokenCostAmount.add(
          new BigNumber(amountToken)
            .div(2)
            .minus(tokenCostAmount)
            .times(TRANSACTION_COST_FEE)
        );
      }
      return tokenToWMATIC(
        tokenCostAmount,
        library,
        tokenCost,
        factoryContract
      );
    }
    return 0;
  };

  useEffect(() => {
    if (isZapIn && token.address && lpToken) {
      getTxFee(amount, lpToken, token);
    } else if (!isZapIn && token.address && lpToken) {
      getTxZapOut(amount, lpToken);
    }
  }, [token, amount, isZapIn, lpToken]);

  return txFee;
};

export default useTransactionCost;
