import { useCallback, useEffect, useState } from "react";
import { debounce } from "lodash";
import { useFactoryContract, useLibrary } from "./useContract";
import { tokenToWMATIC } from "../utils/tvl";
import BigNumber from "bignumber.js";

const TX_COST_FEE = 0.03;
const useConvertToWMATIC = (amount, token, farmType) => {
  const library = useLibrary();
  const [wmaticValue, setWmaticValue] = useState(0);
  const factoryContract = useFactoryContract(farmType);

  const getWmaticValue = useCallback(
    debounce(async (amountToken, tokenUse) => {
      const value = await tokenToWMATIC(
        new BigNumber(amountToken).times(TX_COST_FEE).toFixed(),
        library,
        tokenUse,
        factoryContract
      );
      setWmaticValue(new BigNumber(value).toFixed(8));
    }, 500),
    []
  );

  useEffect(() => {
    if (!amount) {
      setWmaticValue(0);
    } else if (amount && token.address) {
      getWmaticValue(amount, token);
    }
  }, [amount, token]);

  return wmaticValue;
};

export default useConvertToWMATIC;
