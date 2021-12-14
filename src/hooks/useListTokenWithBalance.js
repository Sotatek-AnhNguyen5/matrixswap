import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import IERC20ABI from "../abi/IERC20ABI.json";
import BigNumber from "bignumber.js";

const useTokensWithBalance = (lstToken = []) => {
  const [tokens, setTokens] = useState(lstToken);
  const { library, account } = useWeb3React();

  const getData = async () => {
    const jobGetBalance = [];
    for (let e of lstToken) {
      const tokenContract = new library.eth.Contract(IERC20ABI, e.address);
      jobGetBalance.push(tokenContract.methods.balanceOf(account).call());
    }
    const dataBalance = await Promise.all(jobGetBalance);
    const cloneTokens = [...tokens];
    for (let i = 0; i < dataBalance.length; i++) {
      cloneTokens[i].balance = new BigNumber(dataBalance[i])
        .div(new BigNumber(10).pow(cloneTokens[i].decimals))
        .toFixed();
    }
    setTokens(cloneTokens.sort((a, b) => b.balance - a.balance));
  };

  useEffect(() => {
    if (account) {
      getData();
    }
  }, [lstToken, account]);

  return tokens;
};

export default useTokensWithBalance;
