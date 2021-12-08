import styled from "styled-components";
import InputNumber from "../InputNumber";
import React, { useMemo, useRef, useState } from "react";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import moment from "moment";
import { isEmpty, find } from "lodash";
import InputRange from "react-input-range";
import useStakeCallback from "../../hooks/useStakeCallback";
import useApproveCallBack from "../../hooks/useApproveCallBack";
import SubmitButton from "../SubmitButton";
import useUnStakeCallBack from "../../hooks/useUnstakeCallBack";
import { removeStakeInfoFromStorage } from "../../utils";
import StakeCard from "./StakeCard";
import { ActiveButton } from "../../theme/components";
import UnstakeCard from "./UnstakeCard";

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
  margin-top: 20px;
`;

const BlackLine = styled.div`
  margin-left: auto;
  margin-right: auto;
  border: 2px solid #010304;
  width: 90%;
  margin-top: 40px;
  border-radius: 2px;
`;

const FarmingTab = ({
  farmAddress,
  lpToken,
  stakedBalance,
  refreshStakedBalance,
  type,
  lpBalance,
  getLpBalance,
  pId,
}) => {
  const inputRef = useRef();
  const inputRefUnstake = useRef();
  const [approve, loadingApprove, allowance] = useApproveCallBack(
    lpToken.address,
    farmAddress
  );

  const onFinishStake = async () => {
    saveToStorage();
    await Promise.all([refreshStakedBalance(), getLpBalance()]);
    inputRef.current.value = "";
    toast("Stake successfully!");
  };
  const onFinishUnStake = async () => {
    if (new BigNumber(stakedBalance).isZero()) {
      removeStakeInfoFromStorage();
    }
    await Promise.all([getLpBalance(), refreshStakedBalance()]);
    toast("Withdraw successfully!");
    inputRefUnstake.current.value = "";
  };

  const [stake, loadingStake] = useStakeCallback(
    farmAddress,
    inputRef,
    onFinishStake,
    type,
    pId
  );
  const [unStakeCallBack, loadingUnstake] = useUnStakeCallBack(
    farmAddress,
    inputRefUnstake.current && inputRefUnstake.current.value,
    onFinishUnStake,
    type,
    pId
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

  const lpLabel = useMemo(() => {
    return `${lpToken.token0.symbol}-${lpToken.token1.symbol}`;
  }, [lpToken]);

  const isActiveStake = useMemo(() => {
    return !new BigNumber(lpBalance).isZero();
  }, [lpBalance]);

  const isActiveUnstake = useMemo(() => {
    return !new BigNumber(lpBalance).isZero();
  }, [stakedBalance]);

  return (
    <div>
      <StakeCard
        isActive={isActiveStake}
        inputRef={inputRef}
        lpBalance={lpBalance}
        lpLabel={lpLabel}
      />
      <ButtonWrapper>
        {new BigNumber(allowance).isZero() ? (
          <ActiveButton
            label={"approve"}
            loading={loadingApprove}
            labelLoading={"approving"}
            onClick={approve}
            disabled={!isActiveStake}
          />
        ) : (
          <ActiveButton
            label={"stake"}
            loading={loadingStake}
            labelLoading={"staking"}
            onClick={stake}
            disabled={!isActiveStake}
          />
        )}
      </ButtonWrapper>
      <BlackLine />
      <UnstakeCard
        isActive={isActiveUnstake}
        inputRef={inputRefUnstake}
        stakedBalance={stakedBalance}
      />
      <ButtonWrapper>
        <ActiveButton
          label={"Unstake"}
          loading={loadingUnstake}
          labelLoading={"Unstaking"}
          onClick={unStakeCallBack}
          disabled={!isActiveUnstake}
        />
      </ButtonWrapper>
    </div>
  );
};

export default FarmingTab;
