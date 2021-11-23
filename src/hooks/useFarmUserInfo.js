import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import FarmABI from "../abi/QuickSwapFarmABI.json";
import BigNumber from "bignumber.js";
import { find } from "lodash";
import { removeStakeInfoFromStorage } from "../utils";
import { FARM_TYPE } from "../const";
import {useFarmContract} from "./useContract";

const useFarmUserInfo = (farmAddress, type, pId) => {
  const { library, account } = useWeb3React();
  const [reward, setReward] = useState(0);
  const [balance, setBalance] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [startDate, setStartDate] = useState("");
  const farmContract = useFarmContract(farmAddress, type);

  const getData = async () => {
    let rewardAmount, balanceAmount;
    if (type === FARM_TYPE.apeswap) {
      const [pendingBanana, resBalance] = await Promise.all([
        farmContract.methods.pendingBanana(pId, account).call(),
        farmContract.methods.userInfo(pId, account).call(),
      ]);
      rewardAmount = pendingBanana;
      balanceAmount = resBalance.amount
    } else if (type === FARM_TYPE.sushiswap) {
      const [pendingSushi, resBalance] = await Promise.all([
        farmContract.methods.getPendingReward(account).call(),
        farmContract.methods.getTokensStaked(account).call(),
      ]);
      rewardAmount = pendingSushi;
      balanceAmount = resBalance;
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
    setReward(
      new BigNumber(rewardAmount).div(new BigNumber(10).pow(18)).toFixed()
    );
    setBalance(
      new BigNumber(balanceAmount).div(new BigNumber(10).pow(18)).toFixed()
    );
    const stakeInfo = JSON.parse(localStorage.getItem("stakeInfo")) || [];
    const farmInfo = find(stakeInfo, { farmAddress });
    if (!(new BigNumber(balanceAmount).isZero()) && farmInfo) {
      setStartDate(farmInfo.startDate);
    } else if (farmInfo) {
      setStartDate("");
      removeStakeInfoFromStorage(farmAddress);
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
