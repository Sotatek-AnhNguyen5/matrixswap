import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import FarmABI from "../abi/FarmABI.json";
import IERC20 from "../abi/IERC20ABI.json";
import BigNumber from "bignumber.js";
import { find } from "lodash";

const useFarmUserInfo = (farmAddress, index) => {
  const [reward, setReward] = useState(0);
  const [balance, setBalance] = useState(0);
  const { library, account } = useWeb3React();
  const [startDate, setStartDate] = useState("");

  const getData = async () => {
    const farmContract = new library.eth.Contract(FarmABI, farmAddress);
    const stakeInfo = JSON.parse(localStorage.getItem("stakeInfo")) || [];
    const farmInfo = find(stakeInfo, { farmAddress });
    farmInfo && setStartDate(farmInfo.startDate);
    const [rewards, balance] = await Promise.all([
      farmContract.methods.earned(account).call(),
      farmContract.methods.balanceOf(account).call(),
    ]);
    // const rewardTokenContract = new library.eth.Contract(IERC20, rewardToken);
    // const rewardSymbol = await rewardTokenContract.methods.symbol().call();
    // console.log(rewardSymbol)
    setReward(new BigNumber(rewards).div(new BigNumber(10).pow(18)).toFixed());
    setBalance(new BigNumber(balance).div(new BigNumber(10).pow(18)).toFixed());
  };

  useEffect(() => {
    getData(farmAddress);
  }, []);

  return [reward, balance, getData, startDate];
};

export default useFarmUserInfo;
