import styled from "styled-components";
import InputNumber from "../../InputNumber";
import FarmABI from "../../../abi/FarmABI.json";
import { useWeb3React } from "@web3-react/core";
import React, { useEffect, useRef, useState } from "react";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import StakingTokenABI from "../../../abi/stakingRewardABi.json";
import moment from "moment";
import { isEmpty, find } from "lodash";

const BalanceRow = styled.div`
  display: flex;
  margin-top: 10px;
  justify-content: space-between;
`;

const InputRange = styled.input`
  width: 100%;
  margin-top: 10px;
`;

const InputWrapper = styled.div`
  width: 100%;
  margin-right: 30px;
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
}) => {
  const { library, account } = useWeb3React();
  const [allowance, setAllowance] = useState(0);
  const [balance, setBalance] = useState(0);
  const inputRef = useRef();
  const inputRefUnstake = useRef();

  const getBalance = async () => {
    const stakingTokenContract = new library.eth.Contract(
      StakingTokenABI,
      stakingToken
    );
    const balance = await stakingTokenContract.methods
      .balanceOf(account)
      .call();
    const balanceToNumber = new BigNumber(balance)
      .div(new BigNumber(10).pow(18))
      .toFixed();
    setBalance(balanceToNumber);
  };

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

  const onStake = () => {
    const farmContract = new library.eth.Contract(FarmABI, farmAddress);
    const value = new BigNumber(inputRef.current.value)
      .times(new BigNumber(10).pow(18))
      .toFixed();
    try {
      farmContract.methods
        .stake(value)
        .send({ from: account })
        .once("receipt", function (e) {
          toast("Stake successfully!");
        })
        .once("confirmation", function (e) {
          saveToStorage();
          setAllowance(value);
          getBalance();
          refreshStakedBalance();
        });
    } catch (e) {
      console.log(e);
      toast("Stake failed!");
    }
  };

  const onWithdraw = () => {
    const farmContract = new library.eth.Contract(FarmABI, farmAddress);
    const valueUnstake = new BigNumber(inputRefUnstake.current.value)
      .times(new BigNumber(10).pow(18))
      .toFixed();
    console.log(valueUnstake);
    try {
      farmContract.methods
        .withdraw(valueUnstake)
        .send({ from: account })
        .once("receipt", function (e) {
          console.log(e);
          toast("Withdraw successfully!");
        })
        .once("confirmation", function (e) {
          toast("Withdraw successfully!");
          getBalance();
          refreshStakedBalance();
        });
    } catch (e) {
      console.log(e);
      toast("Withdraw failed!");
    }
  };

  const onChangeRangeStake = (e) => {
    const percent = e.target.value;
    inputRef.current.value = new BigNumber(balance)
      .times(percent)
      .div(100)
      .toFixed();
  };

  const onChangeRangeWithDraw = (e) => {
    const percent = e.target.value;
    inputRefUnstake.current.value = new BigNumber(stakedBalance)
      .times(percent)
      .div(100)
      .toFixed();
  };

  useEffect(() => {
    const getAllowance = async () => {
      const stakingTokenContract = new library.eth.Contract(
        StakingTokenABI,
        stakingToken
      );

      const [allowance] = await Promise.all([
        stakingTokenContract.methods.allowance(account, farmAddress).call(),
        getBalance(),
      ]);
      setAllowance(allowance);
    };
    getAllowance();
  }, []);

  const onApprove = () => {
    const stakingTokenContract = new library.eth.Contract(
      StakingTokenABI,
      stakingToken
    );
    const value = new BigNumber(99999999)
      .times(new BigNumber(10).pow(18))
      .toFixed();
    try {
      stakingTokenContract.methods
        .approve(farmAddress, value)
        .send({ from: account })
        .once("receipt", function (e) {
          console.log(e);
          toast("Send approve tx successfully");
        })
        .once("confirmation", function (e) {
          setAllowance(value);
        });
    } catch (e) {
      console.log(e);
      toast("Approve failed");
    }
  };

  return (
    <div>
      <BalanceRow>
        <span>
          LP {token0.symbol}-{token1.symbol} balance:
        </span>
        <span>{balance}</span>
      </BalanceRow>
      <div style={{ display: "flex", marginTop: "20px" }}>
        <InputWrapper>
          <InputNumber inputRef={inputRef} />
          <InputRange
            onChange={(e) => onChangeRangeStake(e)}
            min="1"
            max="100"
            type="range"
          />
        </InputWrapper>
        <ButtonWrapper>
          {new BigNumber(allowance).isZero() ? (
            <ButtonAction onClick={() => onApprove()}>Approve</ButtonAction>
          ) : (
            <ButtonAction onClick={() => onStake()}>Stake</ButtonAction>
          )}
        </ButtonWrapper>
      </div>
      <BalanceRow>
        <span>Your Staked</span>
        <span>{stakedBalance}</span>
      </BalanceRow>
      <div style={{ display: "flex", marginTop: "20px" }}>
        <InputWrapper>
          <InputNumber inputRef={inputRefUnstake} />
          <InputRange
            onChange={(e) => onChangeRangeWithDraw(e)}
            min="1"
            max="100"
            type="range"
          />
        </InputWrapper>
        <ButtonWrapper>
          <ButtonAction onClick={() => onWithdraw()}>Unstake</ButtonAction>
        </ButtonWrapper>
      </div>
    </div>
  );
};

export default FarmingTab;
