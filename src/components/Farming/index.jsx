import styled from "styled-components";
import React, { useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import moment from "moment";
import { isEmpty, find } from "lodash";
import useStakeCallback from "../../hooks/useStakeCallback";
import useApproveCallBack from "../../hooks/useApproveCallBack";
import useUnStakeCallBack from "../../hooks/useUnstakeCallBack";
import { removeStakeInfoFromStorage } from "../../utils";
import StakeCard from "./StakeCard";
import { ActiveButton } from "../../theme/components";
import UnstakeCard from "./UnstakeCard";
import { useWeb3React } from "@web3-react/core";
import {FARM_TYPE} from "../../const";

const ButtonWrapper = styled.div`
  margin-top: 20px;
  display: ${(props) => (props.isHide ? "none" : "flex")};
  position: relative;
  z-index: 0;
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

const ApproveButton = styled(ActiveButton)`
  width: 60%;
  font-size: 16px;
  border-radius: 26px;
  padding: 20px;
  z-index: 1;
  position: relative;
`;

const StakeButton = styled(ActiveButton)`
  border-radius: 26px;
  padding: 20px;
  width: ${(props) => (props.isApproveFirst ? "50%" : "100%")};
  z-index: 0;
  margin-left: ${(props) => props.isApproveFirst && "-40px"};
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
  usdtRate,
  symbol0,
  symbol1,
}) => {
  const { account } = useWeb3React();
  const [amountStake, setAmountStake] = useState("");
  const [amountUnstake, setAmountUnStake] = useState("");
  const [isWithdrawAll, setIsWithdrawAll] = useState(false);
  const [approve, loadingApprove, allowance] = useApproveCallBack(
    lpToken.address,
    farmAddress
  );

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

  const labelLP = useMemo(() => {
    return `LP ${symbol0} - ${symbol1}`;
  }, [symbol0, symbol1]);

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

  const isHaveToWithdrawAll = useMemo(() => {
    return type === FARM_TYPE.quickswap && !isWithdrawAll
  }, [type, isWithdrawAll])

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

  const isHaveToApprove = useMemo(() => {
    return new BigNumber(allowance).isZero();
  }, [allowance]);

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
        labelLP={labelLP}
      />
      <ButtonWrapper>
        {isHaveToApprove && (
          <ApproveButton
            label={!account ? "No wallet connected" : "approve"}
            loading={loadingApprove}
            labelLoading={"approving"}
            onClick={approve}
            disabled={!account}
          />
        )}
        {account && (
          <StakeButton
            isApproveFirst={isHaveToApprove}
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
        labelLP={labelLP}
        setIsWithdrawAll={setIsWithdrawAll}
      />
      <ButtonWrapper isHide={!isActiveUnstake}>
        <ActiveButton
          label={
            inSufficientUnStakeBalance ? "Insufficient balance" : "Unstake"
          }
          title={"Selecting unstake will withdraw your LP deposited and all reward"}
          loading={loadingUnstake}
          labelLoading={"Unstaking"}
          onClick={unStakeCallBack}
          disabled={
            isHaveToWithdrawAll ||
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
