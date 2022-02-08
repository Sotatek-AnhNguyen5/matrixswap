import { useCallback, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import StakingTokenABI from "../abi/stakingRewardABi.json";
import { ethers } from "ethers";

const useApproveCallBack = (token, toAddress, decimals = 18) => {
  const { account } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const [allowance, setAllowance] = useState(0);

  const getAllowance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const contract = new ethers.Contract(token, StakingTokenABI, provider);
    const allowanceAmount = await contract.allowance(account, toAddress);
    setAllowance(
      new BigNumber(allowanceAmount._hex)
        .div(new BigNumber(10).pow(decimals))
        .toFixed()
    );
  };

  useEffect(() => {
    if (token && account) {
      getAllowance();
    }
  }, [token, account]);

  return [
    useCallback(async () => {
      setLoading(true);
      const value = new BigNumber(99999999)
        .times(new BigNumber(10).pow(18))
        .toFixed();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(token, StakingTokenABI, signer);
      try {
        const tx = await contract.approve(toAddress, value);
        await tx.wait(2);
        await getAllowance();
        setLoading(false);
      } catch (e) {
        console.log(e);
        setLoading(false);
      }
    }, [token, toAddress]),
    loading,
    allowance,
    getAllowance,
  ];
};

export default useApproveCallBack;
