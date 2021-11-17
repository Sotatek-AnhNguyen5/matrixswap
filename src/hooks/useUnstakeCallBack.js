import {useCallback, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import useFarmContract from "./useFarmContract";
import BigNumber from "bignumber.js";

const useUnStakeCallBack = (farmAddress, value, onFinish, type) => {
  const {account} = useWeb3React();
  const [loading, setLoading] = useState(false);
  const farmContract = useFarmContract(farmAddress, type);

  return [useCallback(() => {
    setLoading(true)
    const amount = new BigNumber(value)
      .times(new BigNumber(10).pow(18))
      .toFixed();
    try {
      if (type === "sushi") {
        farmContract.methods
          .withdrawAll()
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
      } else {
        farmContract.methods
          .withdraw(amount)
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
      }

    } catch (e) {
      console.log(e)
      setLoading(false);
    }

  }, [farmContract, value, type]), loading]

}


export default useUnStakeCallBack;