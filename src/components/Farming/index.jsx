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
import { useWeb3React } from "@web3-react/core";
import useLPtoUSDT from "../../hooks/useTVL";

const ButtonWrapper = styled.div`
  margin-top: 20px;
  display: ${(props) => (props.isHide ? "none" : "block")};
`;

const BlackLine = styled.div`
  margin-left: auto;
  margin-right: auto;
  border: 2px solid #010304;
  width: 90%;
  margin-top: 40px;
  border-radius: 2px;
  display: ${(props) => (props.isActive ? "block" : "none")};
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
  refreshList,
}) => {
  const { account } = useWeb3React();
  const [amountStake, setAmountStake] = useState("");
  const [amountUnstake, setAmountUnStake] = useState("");
  const [approve, loadingApprove, allowance] = useApproveCallBack(
    lpToken.address,
    farmAddress
  );

  const usdtRate = useLPtoUSDT(lpToken, 1, type);

  const stakeUsdtAmount = useMemo(() => {
    return new BigNumber(amountStake || 0).times(usdtRate).toFixed();
  }, [amountStake, usdtRate]);

  const unStakeUsdtAmount = useMemo(() => {
    return new BigNumber(amountUnstake || 0).times(usdtRate).toFixed();
  }, [amountUnstake, usdtRate]);

  const onFinishStake = async () => {
    saveToStorage();
    await Promise.all([refreshStakedBalance(), getLpBalance()]);
    setAmountStake("");
    toast("Stake successfully!");
  };
  const onFinishUnStake = async () => {
    await Promise.all([getLpBalance(), refreshStakedBalance()]);
    if (new BigNumber(stakedBalance).isZero()) {
      removeStakeInfoFromStorage();
    }
    toast("Withdraw successfully!");
    setAmountUnStake("");
  };

  const [stake, loadingStake] = useStakeCallback(
    farmAddress,
    amountStake,
    onFinishStake,
    type,
    pId
  );
  const [unStakeCallBack, loadingUnstake] = useUnStakeCallBack(
    farmAddress,
    amountUnstake,
    onFinishUnStake,
    type,
    pId
  );

  const saveToStorage = () => {
    const stakeInfo = JSON.parse(localStorage.getItem("stakeInfo")) || [];
    const farmInfo = find(stakeInfo, { farmAddress, pId });
    if (isEmpty(farmInfo)) {
      const farm = {
        farmAddress,
        pId,
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
    return !new BigNumber(stakedBalance).isZero();
  }, [stakedBalance]);

  const isInsufficientBalanceStake = useMemo(() => {
    return amountStake && new BigNumber(lpBalance).lt(amountStake);
  }, [lpBalance, amountStake]);

  const inSufficientUnStakeBalance = useMemo(() => {
    return amountUnstake && new BigNumber(stakedBalance).lt(amountUnstake);
  }, [amountUnstake, stakedBalance]);

  return (
    <div>
      <StakeCard
        isActive={isActiveStake}
        amountStake={amountStake}
        setAmountStake={setAmountStake}
        lpBalance={lpBalance}
        lpLabel={lpLabel}
        insuffBalance={isInsufficientBalanceStake}
        usdtValue={stakeUsdtAmount}
      />
      <ButtonWrapper>
        {new BigNumber(allowance).isZero() ? (
          <ActiveButton
            label={!account ? "No wallet connected" : "approve"}
            loading={loadingApprove}
            labelLoading={"approving"}
            onClick={approve}
            disabled={!isActiveStake}
          />
        ) : (
          <ActiveButton
            label={
              isInsufficientBalanceStake ? "Insufficient balance" : "stake"
            }
            loading={loadingStake}
            labelLoading={"staking"}
            onClick={stake}
            disabled={
              !isActiveStake ||
              isInsufficientBalanceStake ||
              new BigNumber(amountStake).isZero() ||
              !amountStake
            }
          />
        )}
      </ButtonWrapper>
      <BlackLine isActive={isActiveUnstake} />
      <UnstakeCard
        isActive={isActiveUnstake}
        stakedBalance={stakedBalance}
        amountUnstake={amountUnstake}
        setAmountUnstake={setAmountUnStake}
        insuffBalance={inSufficientUnStakeBalance}
        usdtValue={unStakeUsdtAmount}
      />
      <ButtonWrapper isHide={!isActiveUnstake}>
        <ActiveButton
          label={
            inSufficientUnStakeBalance ? "Insufficient balance" : "Unstake"
          }
          loading={loadingUnstake}
          labelLoading={"Unstaking"}
          onClick={unStakeCallBack}
          disabled={
            inSufficientUnStakeBalance ||
            new BigNumber(amountUnstake).isZero() ||
            !amountUnstake
          }
        />
      </ButtonWrapper>
    </div>
  );
};

export default FarmingTab;
