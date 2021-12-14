import {useCallback, useEffect, useState} from "react";
import {useWeb3React} from "@web3-react/core";
import BigNumber from "bignumber.js";
import StakingTokenABI from "../abi/stakingRewardABi.json";

const useApproveCallBack = (token, toAddress) => {
  const {account, library} = useWeb3React();
  const [loading, setLoading] = useState(false);
  const [alowance, setAllowance] = useState(0);

  const getAlowance = async () => {
    const stakingTokenContract = new library.eth.Contract(
      StakingTokenABI,
      token
    );
    const allowance = await stakingTokenContract.methods.allowance(account, toAddress).call();
    setAllowance(allowance);
  }

  useEffect(() => {
    if (token && account) {
      getAlowance();
    }
  }, [token, account])

  return [useCallback(() => {
    setLoading(true)
    const value = new BigNumber(99999999)
      .times(new BigNumber(10).pow(18))
      .toFixed();
    try {
      const stakingTokenContract = new library.eth.Contract(
        StakingTokenABI,
        token
      );
      stakingTokenContract.methods.approve(toAddress, value)
        .send({from: account})
        .on("confirmation", async function (number) {
          if (number === 1) {
            setLoading(false);
            setAllowance(value);
          }
        })
        .once("error", () => {
          setLoading(false);
        })
    } catch (e) {
      console.log(e)
      setLoading(false);
    }

  }, [token, toAddress]), loading, alowance]

}


export default useApproveCallBack;