import {useWeb3React} from "@web3-react/core";
import {useCallback, useState} from "react";
import useFarmContract from "./useFarmContract";
import {PROTOCOL_FUNCTION} from "../const";


const useGetRewardCallback = (farmAddress, type, onFinish) => {
  const {account} = useWeb3React();
  const [loading, setLoading] = useState(false);
  const farmContract = useFarmContract(farmAddress, type);

  return [useCallback(() => {
    setLoading(true);
    const methods = PROTOCOL_FUNCTION[type].getReward;
    try {
      farmContract.methods[methods]()
        .send({from: account})
        .on("confirmation", async function (number) {
          if (number === 5) {
            setLoading(false);
            onFinish();
          }
        })
        .once("error", () => {
          setLoading(false);
        })
    } catch (e) {
      console.log(e)
      setLoading(false);
    }

  }, [farmContract, type]), loading]
}

export default useGetRewardCallback;