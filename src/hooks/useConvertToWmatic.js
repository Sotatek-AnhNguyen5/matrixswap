import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { useFactoryContract, useLibrary } from "./useContract";
import { USDT_TOKEN, WMATIC_TOKEN } from "../const";
import { tokenToWMATIC } from "../utils/tvl";
import BigNumber from "bignumber.js";

const TX_COST_FEE = 0.03;
const useConvertToWMATIC = (amount, token, farmType) => {
  const library = useLibrary();
  const [wmaticValue, setWmaticValue] = useState(0);
  const factoryContract = useFactoryContract(farmType);

  const getUSDTValue = useCallback(
    debounce(async (amountToken) => {
      const value = await tokenToWMATIC(
        new BigNumber(amountToken).times(TX_COST_FEE).toFixed(),
        library,
        USDT_TOKEN,
        factoryContract
      );
      setWmaticValue(value.toFixed(8));
    }, 500),
    []
  );

  useEffect(() => {
    if (!amount) {
      setWmaticValue(0);
    } else if (
      token.address &&
      token.address.toLowerCase() === WMATIC_TOKEN.address.toLowerCase()
    ) {
      setWmaticValue(amount);
    } else if (amount && token.address) {
      getUSDTValue(amount);
    }
  }, [amount, token]);

  return wmaticValue;
};

export default useConvertToWMATIC;
