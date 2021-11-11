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
import InputRange from 'react-input-range';


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
}) => {
  const { library, account } = useWeb3React();
  const [allowance, setAllowance] = useState(0);
  const [balance, setBalance] = useState(0);
  const [stakeRange, setStakeRange] = useState(0);
  const [unStakeRange, setUnStakeRange] = useState(0);
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
        .on("confirmation", async function (number) {
          if (number === 5) {
            saveToStorage();
            await Promise.all([refreshStakedBalance(), getBalance()])
            inputRef.current.value = '';
            toast("Stake successfully!");
          }
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
        .on("confirmation", async function (number) {
          if (number === 5) {
            await Promise.all([getBalance(), refreshStakedBalance()])
            toast("Withdraw successfully!");
            inputRefUnstake.current.value = "";
          }
        });
    } catch (e) {
      console.log(e);
      toast("Withdraw failed!");
    }
  };

  const onChangeRangeStake = (percent) => {
    setStakeRange(percent);
    inputRef.current.value = new BigNumber(balance)
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
            maxValue={100}
            minValue={0}
            value={stakeRange}
            formatLabel={value => `${value}%`}
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
      <BalanceRow style={{marginTop: 30}}>
        <span>Your Staked</span>
        <span>{stakedBalance}</span>
      </BalanceRow>
      <div style={{ display: "flex", marginTop: "20px" }}>
        <InputWrapper>
          <InputNumber inputRef={inputRefUnstake} />
          <InputRange
            onChange={(e) => onChangeRangeWithDraw(e)}
            maxValue={100}
            minValue={0}
            value={unStakeRange}
            formatLabel={value => `${value}%`}
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
