import {useCallback, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import useFarmContract from "./useFarmContract";
import BigNumber from "bignumber.js";

const useStakeCallback = (farmAddress, inputRef, onFinish, type) => {
  const {account} = useWeb3React();
  const [loading, setLoading] = useState(false);
  const farmContract = useFarmContract(farmAddress, type);
  return [useCallback(() => {
    setLoading(true)
    const amount = new BigNumber(inputRef.current.value)
      .times(new BigNumber(10).pow(18))
      .toFixed();
    const methods = type === "sushi" ? "deposit" : "stake";
    try {
      farmContract.methods[methods](amount)
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

  }, [farmContract, inputRef, type]), loading]

}


export default useStakeCallback;