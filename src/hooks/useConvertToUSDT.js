import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { convertToUSD } from "../utils/apr";
import { useFactoryContract, useLibrary } from "./useContract";
import { FARM_TYPE, USDT_TOKEN } from "../const";

const useConvertToUSDT = (amount, token) => {
  const library = useLibrary();
  const [uSDTValue, setUSDTValue] = useState(0);
  const factoryContract = useFactoryContract(FARM_TYPE.quickswap);

  const getUSDTValue = useCallback(
    debounce(async (amountToken, tokenFrom) => {
      const value = await convertToUSD(
        amountToken,
        tokenFrom.decimals,
        library,
        tokenFrom.address,
        factoryContract
      );
      setUSDTValue(value.toFixed(8));
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
      getUSDTValue(amount, token);
    }
  }, [amount, token]);

  return uSDTValue;
};

export default useConvertToUSDT;
