import { useCallback, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import { useFarmContract } from "./useContract";
import { FARM_TYPE, PROTOCOL_FUNCTION } from "../const";

const useUnStakeCallBack = (farmAddress, value, onFinish, type, pId) => {
  const { account } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const farmContract = useFarmContract(farmAddress, type);

  return [
    useCallback(() => {
      setLoading(true);
      const amount = new BigNumber(value)
        .times(new BigNumber(10).pow(18))
        .toFixed();
      try {
        let params;
        if (type === FARM_TYPE.apeswap) {
          params = [pId, amount, account];
        } else if (type === FARM_TYPE.sushiswap) {
          params = [];
        } else {
          params = [amount];
        }
        const methods = PROTOCOL_FUNCTION[type].unStake;
        farmContract.methods[methods](...params)
          .send({ from: account })
          .on("confirmation", async function (number) {
            if (number === 5) {
              await onFinish();
              setLoading(false);
            }
          })
          .once("error", () => {
            setLoading(false);
          });
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }, [farmContract, value, type]),
    loading,
  ];
};

export default useUnStakeCallBack;
