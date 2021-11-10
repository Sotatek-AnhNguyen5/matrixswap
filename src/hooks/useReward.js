import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import FarmABI from "../abi/FarmABI.json";
import BigNumber from "bignumber.js";

const useFarmUserInfo = (farmAddress, index) => {
  const [tvl, setTvl] = useState(0);
  const [reward, setReward] = useState(0);
  const [balance, setBalance] = useState(0);
  const { library, account } = useWeb3React();

  useEffect(() => {
    const getData = async () => {
      const farmContract = new library.eth.Contract(FarmABI, farmAddress);
      const [rewards, balance] = await Promise.all([
        farmContract.methods.rewards(account).call(),
        farmContract.methods.balanceOf(account).call(),
      ]);
      setReward(
        new BigNumber(rewards).div(new BigNumber(10).pow(18)).toFixed()
      );
      setBalance(
        new BigNumber(balance).div(new BigNumber(10).pow(18)).toFixed()
      );
    };

    getData(farmAddress);
  }, [index]);
  return [reward, balance];
};

export default useFarmUserInfo;
