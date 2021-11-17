import {useState, useEffect} from "react";
import {useWeb3React} from "@web3-react/core";
import FarmABI from "../abi/FarmABI.json";
import SushiFarm from "../abi/sushiFarmABI.json";
import BigNumber from "bignumber.js";
import {find} from "lodash";

const useFarmUserInfo = (farmAddress, type, pId) => {
  const [reward, setReward] = useState(0);
  const [balance, setBalance] = useState(0);
  const {library, account} = useWeb3React();
  const [startDate, setStartDate] = useState("");

  const getData = async () => {
    let rewardAmount, balanceAmount;
    if (type === "sushi") {
      const farmContract = new library.eth.Contract(SushiFarm, farmAddress);
      const [pendingSushi, resBalance] = await Promise.all([farmContract.methods.getPendingReward(account).call(), farmContract.methods.getTokensStaked(account).call()])
      rewardAmount = pendingSushi;
      balanceAmount = resBalance;
    } else {
      const farmContract = new library.eth.Contract(FarmABI, farmAddress);
      const [resReward, resBalance] = await Promise.all([
        farmContract.methods.earned(account).call(),
        farmContract.methods.balanceOf(account).call(),
      ]);
      rewardAmount = resReward;
      balanceAmount = resBalance;
    }
    setReward(new BigNumber(rewardAmount).div(new BigNumber(10).pow(18)).toFixed());
    setBalance(new BigNumber(balanceAmount).div(new BigNumber(10).pow(18)).toFixed());
    const stakeInfo = JSON.parse(localStorage.getItem("stakeInfo")) || [];
    const farmInfo = find(stakeInfo, {farmAddress});
    farmInfo && setStartDate(farmInfo.startDate);
  };


  useEffect(() => {
    if (library && farmAddress) {
      getData()
    }
  }, [library, farmAddress]);

  return [reward, balance, getData, startDate];
};

export default useFarmUserInfo;
