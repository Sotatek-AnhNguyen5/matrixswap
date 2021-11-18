import styled from "styled-components";
import InputNumber from "../../InputNumber";
import FarmABI from "../../../abi/FarmABI.json";
import { useWeb3React } from "@web3-react/core";
import React, { useEffect, useRef, useState } from "react";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import StakingTokenABI from "../../../abi/stakingRewardABi.json";
import moment from "moment";
import { isEmpty, find, findIndex } from "lodash";
import InputRange from "react-input-range";
import useStakeCallback from "../../../hooks/useStakeCallback";
import useApproveCallBack from "../../../hooks/useApproveCallBack";
import SubmitButton from "../../SubmitButton";
import useUnStakeCallBack from "../../../hooks/useUnstakeCallBack";

const BalanceRow = styled.div`
  display: flex;
  margin-top: 10px;
  justify-content: space-between;
`;

const InputWrapper = styled.div`
  width: 100%;
  margin-right: 30px;

  .input-wrapper {
    margin-bottom: 20px;
  }
`;

const ButtonWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: center;
`;

const ButtonAction = styled.div`
  width: 100px;
  text-align: center;
  background-color: #fff;
  background-color: #3ee046;
  border: 0;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 6px;
`;

const FarmingTab = ({
  farmAddress,
  stakingToken,
  token0,
  token1,
  stakedBalance,
  refreshStakedBalance,
  type,
  lpBalance,
  getLpBalance,
}) => {
  const [stakeRange, setStakeRange] = useState(0);
  const [unStakeRange, setUnStakeRange] = useState(0);
  const inputRef = useRef();
  const inputRefUnstake = useRef();
  const [approve, loadingApprove, allowance] = useApproveCallBack(
    stakingToken,
    farmAddress
  );

  const onFinishStake = async () => {
    saveToStorage();
    await Promise.all([refreshStakedBalance(), getLpBalance()]);
    inputRef.current.value = "";
    toast("Stake successfully!");
  };
  const onFinishUnStake = async () => {
    if(type === 'sushi' || new BigNumber(stakeRange).eq(100) || new BigNumber(stakedBalance).isZero()) {
      removeFromStorage();
    }
    await Promise.all([getLpBalance(), refreshStakedBalance()]);
    toast("Withdraw successfully!");
    inputRefUnstake.current.value = "";
  };

  const [stake, loadingStake] = useStakeCallback(
    farmAddress,
    inputRef,
    onFinishStake,
    type
  );
  const [unStakeCallBack, loadingUnstake] = useUnStakeCallBack(
    farmAddress,
    inputRefUnstake.current && inputRefUnstake.current.value,
    onFinishUnStake,
    type
  );

  const saveToStorage = () => {
    const stakeInfo = JSON.parse(localStorage.getItem("stakeInfo")) || [];
    const farmInfo = find(stakeInfo, { farmAddress });
    if (isEmpty(farmInfo)) {
      const farm = {
        farmAddress,
        startDate: moment().format(),
      };
      stakeInfo.push(farm);
      localStorage.setItem("stakeInfo", JSON.stringify(stakeInfo));
    }
  };

  const removeFromStorage = () => {
    const stakeInfo = JSON.parse(localStorage.getItem("stakeInfo")) || [];
    const farmIndex = findIndex(stakeInfo, { farmAddress });
    if (farmIndex !== -1) {
      stakeInfo.splice(farmIndex, 1)
      localStorage.setItem(
        "stakeInfo",
        JSON.stringify(stakeInfo)
      );
    }
  };

  const onChangeRangeStake = (percent) => {
    setStakeRange(percent);
    inputRef.current.value = new BigNumber(lpBalance)
      .times(percent)
      .div(100)
      .toFixed();
  };

  const onChangeRangeWithDraw = (percent) => {
    setUnStakeRange(percent);
    inputRefUnstake.current.value = new BigNumber(stakedBalance)
      .times(percent)
      .div(100)
      .toFixed();
  };

  const onChangeUnStake = (value) => {
    const percent = new BigNumber(value).div(stakedBalance).times(100);
    value &&
      setUnStakeRange(percent.gt(100) ? 100 : parseInt(percent.toFixed(2)));
  };

  const onChangeStake = (value) => {
    const percent = new BigNumber(value).div(lpBalance).times(100);
    value &&
      setStakeRange(percent.gt(100) ? 100 : parseInt(percent.toFixed(2)));
  };

  return (
    <div>
      <BalanceRow>
        <span>
          LP {token0.symbol}-{token1.symbol} balance:
        </span>
        <span>{lpBalance}</span>
      </BalanceRow>
      <div style={{ display: "flex", marginTop: "20px" }}>
        <InputWrapper>
          <InputNumber
            disabled={new BigNumber(allowance).isZero()}
            inputRef={inputRef}
            onChange={onChangeStake}
          />
          <InputRange
            onChange={(e) => onChangeRangeStake(e)}
            maxValue={100}
            minValue={0}
            value={stakeRange}
            formatLabel={(value) => `${value}%`}
          />
        </InputWrapper>
        <ButtonWrapper>
          {new BigNumber(allowance).isZero() ? (
            <SubmitButton
              label={"approve"}
              loading={loadingApprove}
              labelLoading={"approving"}
              onClick={approve}
            />
          ) : (
            <SubmitButton
              label={"stake"}
              loading={loadingStake}
              labelLoading={"staking"}
              onClick={stake}
            />
          )}
        </ButtonWrapper>
      </div>
      <BalanceRow style={{ marginTop: 30 }}>
        <span>Your Staked</span>
        <span>{stakedBalance}</span>
      </BalanceRow>
      <div style={{ display: "flex", marginTop: "20px" }}>
        <InputWrapper>
          <InputNumber
            inputRef={inputRefUnstake}
            onChange={onChangeUnStake}
            disabled={new BigNumber(stakedBalance).isZero()}
          />
          <InputRange
            onChange={(e) => onChangeRangeWithDraw(e)}
            maxValue={100}
            minValue={0}
            value={unStakeRange}
            formatLabel={(value) => `${value}%`}
          />
        </InputWrapper>
        <ButtonWrapper>
          <SubmitButton
            label={"Unstake"}
            loading={loadingUnstake}
            labelLoading={"Unstaking"}
            onClick={unStakeCallBack}
            disabled={new BigNumber(stakedBalance).isZero()}
          />
        </ButtonWrapper>
      </div>
    </div>
  );
};

export default FarmingTab;
