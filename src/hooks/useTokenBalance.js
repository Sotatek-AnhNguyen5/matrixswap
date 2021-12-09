import { useCallback, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import LpABI from "../abi/stakingRewardABi.json";
import BigNumber from "bignumber.js";

const useTokenBalance = (tokenAddress, decimals = 18) => {
  const [balance, setBalance] = useState(0);
  const { library, account } = useWeb3React();

  const getBalance = useCallback(async () => {
    console.log('get balance')
    const lpContract = new library.eth.Contract(LpABI, tokenAddress);
    const balanceAmount = await lpContract.methods.balanceOf(account).call();
    const balanceToNumber = new BigNumber(balanceAmount)
      .div(new BigNumber(10).pow(decimals))
      .toFixed();
    setBalance(balanceToNumber);
  }, [tokenAddress, decimals, library, account]);

  useEffect(() => {
    if (tokenAddress) {
      getBalance();
    }
  }, [tokenAddress]);

  return [balance, getBalance];
};

export default useTokenBalance;
