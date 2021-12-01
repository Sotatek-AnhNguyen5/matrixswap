import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import { find } from "lodash";
import { FARM_TYPE } from "../const";
import { useFarmContract } from "./useContract";
import RewarderABI from "../abi/RewarderABI.json";

const useFarmUserInfo = (
  farmAddress,
  type,
  pId,
  lpTokenAddress,
  rewarderAddress
) => {
  const { library, account } = useWeb3React();
  const [reward, setReward] = useState([0, 0]);
  const [balance, setBalance] = useState(0);
  const [startDate, setStartDate] = useState("");
  const farmContract = useFarmContract(farmAddress, type);

  const getData = async () => {
    let rewardAmount,
      balanceAmount,
      secondRewardAmount = 0;
    if (type === FARM_TYPE.apeswap) {
      const rewarderContract = new library.eth.Contract(
        RewarderABI,
        rewarderAddress
      );
      const [pendingBanana, resBalance, rewardMatic] = await Promise.all([
        farmContract.methods.pendingBanana(pId, account).call(),
        farmContract.methods.userInfo(pId, account).call(),
        rewarderContract.methods.pendingToken(pId, account).call(),
      ]);
      rewardAmount = pendingBanana;
      balanceAmount = resBalance.amount;
      secondRewardAmount = rewardMatic;
    } else if (type === FARM_TYPE.sushiswap) {
      const rewarderContract = new library.eth.Contract(
        RewarderABI,
        rewarderAddress
      );
      const [pendingSushi, resBalance, rewardMatic] = await Promise.all([
        farmContract.methods.pendingSushi(pId, account).call(),
        farmContract.methods.userInfo(pId, account).call(),
        rewarderContract.methods.pendingTokens(pId, account, 0).call(),
      ]);
      rewardAmount = pendingSushi;
      balanceAmount = resBalance.amount;
      secondRewardAmount = rewardMatic.rewardAmounts;
    } else {
      const [resReward, resBalance] = await Promise.all([
        farmContract.methods.earned(account).call(),
        farmContract.methods.balanceOf(account).call(),
      ]);
      rewardAmount = resReward;
      balanceAmount = resBalance;
    }
    setReward([
      new BigNumber(rewardAmount).div(new BigNumber(10).pow(18)).toFixed(),
      new BigNumber(secondRewardAmount)
        .div(new BigNumber(10).pow(18))
        .toFixed(),
    ]);
    setBalance(
      new BigNumber(balanceAmount).div(new BigNumber(10).pow(18)).toFixed()
    );
    const stakeInfo = JSON.parse(localStorage.getItem("stakeInfo")) || [];
    const farmInfo = find(
      stakeInfo,
      (e) => e.farmAddress.toLowerCase() === farmAddress.toLowerCase()
    );

    if (farmInfo) {
      setStartDate(farmInfo.startDate);
    }
  };

  useEffect(() => {
    if (library && farmAddress) {
      getData();
    }
  }, [library, farmAddress]);

  return [reward, balance, getData, startDate];
};

export default useFarmUserInfo;
