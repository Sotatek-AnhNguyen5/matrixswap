import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import { find } from "lodash";
import { FARM_TYPE } from "../const";
import { useFarmContract } from "./useContract";
import RewarderABI from "../abi/RewarderABI.json";
import PairABI from "../abi/QuickSwapPair.json";

const useFarmUserInfo = (farmAddress, type, pId, lpTokenAddress) => {
  const { library, account } = useWeb3React();
  const [reward, setReward] = useState([0, 0]);
  const [balance, setBalance] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [startDate, setStartDate] = useState("");
  const farmContract = useFarmContract(farmAddress, type);

  const getData = async () => {
    let rewardAmount,
      balanceAmount,
      secondRewardAmount = 0;
    if (type === FARM_TYPE.apeswap) {
      const [pendingBanana, resBalance] = await Promise.all([
        farmContract.methods.pendingBanana(pId, account).call(),
        farmContract.methods.userInfo(pId, account).call(),
      ]);
      rewardAmount = pendingBanana;
      balanceAmount = resBalance.amount;
    } else if (type === FARM_TYPE.sushiswap) {
      const REWARDER_ADDRESS = "0xa3378ca78633b3b9b2255eaa26748770211163ae";
      const rewarderContract = new library.eth.Contract(RewarderABI, REWARDER_ADDRESS);
      const lpTokenContract = new library.eth.Contract(PairABI, lpTokenAddress);
      const [pendingSushi, resBalance, rewardMatic, totalLpHold] = await Promise.all([
        farmContract.methods.pendingSushi(pId, account).call(),
        farmContract.methods.userInfo(pId, account).call(),
        rewarderContract.methods.pendingTokens(pId, account, 0).call(),
        lpTokenContract.methods.balanceOf(farmAddress).call(),
      ]);
      rewardAmount = pendingSushi;
      balanceAmount = resBalance.amount;
      secondRewardAmount = rewardMatic.rewardAmounts;
      setTotalSupply(totalLpHold);
    } else {
      const [resReward, resBalance, resTotalSupply] = await Promise.all([
        farmContract.methods.earned(account).call(),
        farmContract.methods.balanceOf(account).call(),
        farmContract.methods.totalSupply().call(),
      ]);
      rewardAmount = resReward;
      balanceAmount = resBalance;
      setTotalSupply(resTotalSupply);
    }
    setReward([
      new BigNumber(rewardAmount).div(new BigNumber(10).pow(18)).toFixed(),
      new BigNumber(secondRewardAmount).div(new BigNumber(10).pow(18)).toFixed(),
    ]);
    setBalance(
      new BigNumber(balanceAmount).div(new BigNumber(10).pow(18)).toFixed()
    );
    const stakeInfo = JSON.parse(localStorage.getItem("stakeInfo")) || [];
    const farmInfo = find(stakeInfo, { farmAddress });
    if (!new BigNumber(balanceAmount).isZero() && farmInfo) {
      setStartDate(farmInfo.startDate);
    }
  };

  useEffect(() => {
    if (library && farmAddress) {
      getData();
    }
  }, [library, farmAddress]);

  return [reward, balance, totalSupply, getData, startDate];
};

export default useFarmUserInfo;
