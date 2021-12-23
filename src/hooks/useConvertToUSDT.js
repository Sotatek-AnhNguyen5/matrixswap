import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { convertToUSD } from "../utils/apr";
import { useFactoryContract, useLibrary } from "./useContract";
import { USDT_TOKEN } from "../const";
import { convertLPtoUSDT } from "../utils/deposited";
import BigNumber from "bignumber.js";

const useConvertToUSDT = (amount, token, farmType, isZapIn, lpToken) => {
  const library = useLibrary();
  const [uSDTValue, setUSDTValue] = useState(0);
  const factoryContract = useFactoryContract(farmType);

  const getUSDTValue = useCallback(
    debounce(async (amountToken, tokenFrom) => {
      const value = await convertToUSD(
        amountToken,
        tokenFrom.decimals,
        library,
        tokenFrom.address,
        factoryContract
      );
      value && setUSDTValue(value.toFixed(8));
    }, 500),
    []
  );

  const getUSDTfromLP = useCallback(
    debounce(async (amountToken, tokenFrom) => {
      const value = await convertLPtoUSDT(
        factoryContract,
        tokenFrom,
        new BigNumber(amountToken).times(new BigNumber(10).pow(18)).toFixed(),
        library
      );
      value && setUSDTValue(value);
    }, 500),
    []
  );

  useEffect(() => {
    if (!amount) {
      setUSDTValue(0);
    } else if (
      token.address &&
      token.address.toLowerCase() === USDT_TOKEN.address.toLowerCase()
    ) {
      setUSDTValue(amount);
    } else if (amount && token.address) {
      if (isZapIn) {
        getUSDTValue(amount, token);
      } else if (lpToken) {
        getUSDTfromLP(amount, lpToken);
      }
    }
  }, [amount, token, lpToken]);

  return uSDTValue;
};

export default useConvertToUSDT;
