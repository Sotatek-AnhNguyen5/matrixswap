import { useCallback, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import { FARM_TYPE, PROTOCOL_FUNCTION } from "../const";
import { useFarmContract } from "./useContract";

const useStakeCallback = (farmAddress, inputRef, onFinish, type, pId) => {
  const { account } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const farmContract = useFarmContract(farmAddress, type);

  return [
    useCallback(() => {
      setLoading(true);
      const amount = new BigNumber(inputRef.current.value)
        .times(new BigNumber(10).pow(18))
        .toFixed(0);
      let params;
      if (type === FARM_TYPE.apeswap) {
        params = [pId, amount, account];
      } else {
        params = [amount];
      }
      const methods = PROTOCOL_FUNCTION[type].stake;
      try {
        farmContract.methods[methods](...params)
          .send({ from: account })
          .on("confirmation", async function (number) {
            if (number === 5) {
              setLoading(false);
              onFinish();
            }
          })
          .once("error", () => {
            setLoading(false);
          });
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }, [farmContract, inputRef, type]),
    loading,
  ];
};


export default useStakeCallback;