import { useWeb3React } from "@web3-react/core";
import { useCallback, useState } from "react";
import { FARM_TYPE, PROTOCOL_FUNCTION } from "../const";
import { useFarmContract } from "./useContract";

const useGetRewardCallback = (farmAddress, type, onFinish, pId) => {
  const { account } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const farmContract = useFarmContract(farmAddress, type);

  return [
    useCallback(() => {
      setLoading(true);
      const methods = PROTOCOL_FUNCTION[type].getReward;
      let params = [];
      if (FARM_TYPE.apeswap === type || type === FARM_TYPE.sushiswap) {
        params = [pId, account];
      }
      try {
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
    }, [farmContract, type]),
    loading,
  ];
};

export default useGetRewardCallback;