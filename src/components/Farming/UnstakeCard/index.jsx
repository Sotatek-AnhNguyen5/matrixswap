import styled from "styled-components";
import { BalanceLine, FlexRow, MaxButton } from "../../../theme/components";
import React, { useEffect, useMemo, useRef, useState } from "react";
import InputNumber from "../../InputNumber";
import Slider from "rc-slider";
import BigNumber from "bignumber.js";
import { useWeb3React } from "@web3-react/core";
import { formatBalance, formatCurrency } from "../../../utils";

const TokenCard = styled.div`
  display: ${(props) => (props.isActive ? "flex" : "none")};
  background: ${(props) =>
    props.isActive
      ? "linear-gradient(90deg, #2ac031 13.55%, #3ee046 90.32%)"
      : "linear-gradient(90deg, #0A1C1F 0%, #0F2A2E 96.22%)"};
  align-items: flex-start;
  border-radius: 26px;
  width: 100%;
  margin-top: 40px;
  padding: 20px 20px 20px 40px;
  box-sizing: border-box;
`;

const LeftCard = styled(FlexRow)`
  width: 50%;
`;

const SliderWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  padding: 0 0 0 20px;
  width: 100%;
`;
const FakeButton = styled.div`
  background: rgba(1, 3, 4, 0.15);
  border-radius: 16px;
  padding: 16px 20px;
  color: #fff;
  font-size: 16px;
`;

const BorderColor = styled.div`
  height: 45px;
  background-color: rgba(1, 3, 4, 0.15);
  border-radius: 26px;
  width: 2px;
`;

const SliderInputWrapper = styled.div`
  background: rgba(1, 3, 4, 0.1);
  border-radius: 16px;
  width: 100%;
  display: flex;
  flex-flow: column;
  min-height: 54px;

  .input-wrapper {
    width: 100%;
    input {
      font-family: ChakraPetch, sans-serif;
      text-align: right;
      font-weight: 400;
      font-size: 18px;
      color: rgba(255, 255, 255, 0.6);
      background: transparent;
      border: 0;
      outline: 0;
      padding: 10px 20px;

      &::placeholder {
        color: rgba(255, 255, 255, 0.6);
      }
    }
  }
  
  .rc-slider {
    margin-bottom: -5px;
  }
`;

const InputSlideRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(18, 70, 46, 0.6);
  font-size: 16px;
  padding-left: 10px;
  white-space: nowrap;

  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 100px;
    color: ${(props) =>
      props.danger ? props.theme.colorDanger : "rgba(18, 70, 46, 0.6)"};
  }
`;

const UnstakeCard = ({
  stakedBalance,
  amountUnstake,
  setAmountUnstake,
  isActive,
  insuffBalance,
  usdtValue,
  labelLP,
  setIsWithdrawAll,
}) => {
  const [percent, setPercent] = useState("0");
  const [inputAmount, setAmountInput] = useState("");
  const { account } = useWeb3React();

  const customSetPercent = (amount) => {
    if (amount === "100") {
      setIsWithdrawAll(true);
    } else {
      setIsWithdrawAll(false);
    }
    setPercent(amount);
  };

  const onChangeRangePercent = (percentAmount) => {
    customSetPercent(percentAmount.toString());
    if (stakedBalance) {
      const amount = new BigNumber(stakedBalance).times(percentAmount).div(100);
      setAmountUnstake(amount.toFixed());
      setAmountInput(amount.toFixed(6, 1));
    }
  };

  const onMax = () => {
    setAmountUnstake(stakedBalance);
    setAmountInput(stakedBalance);
    customSetPercent("100");
  };

  const onChangeUnstake = (value) => {
    setAmountUnstake(value);
    setAmountInput(value);
    if (stakedBalance) {
      const newPercent = new BigNumber(value).div(stakedBalance).times(100);
      customSetPercent(
        newPercent.toFixed(0) === "Infinity" || newPercent.isNaN()
          ? "0"
          : newPercent.toFixed(0).toString()
      );
    }
  };

  useEffect(() => {
    if (!amountUnstake) {
      setPercent("0");
      setAmountInput("");
    }
  }, [amountUnstake]);

  return (
    <TokenCard isActive={isActive}>
      <LeftCard flexFlow="column">
        <FlexRow width="100%" justify="space-between">
          <FakeButton>Your Stake</FakeButton>
          <BorderColor />
        </FlexRow>
        {account && (
          <FlexRow flexFlow="column" marginTop="10px" alignItems="start">
            <BalanceLine danger={insuffBalance}>Balance</BalanceLine>
            <BalanceLine isNumber danger={insuffBalance}>
              {formatBalance(stakedBalance)} {labelLP}
            </BalanceLine>
          </FlexRow>
        )}
      </LeftCard>
      <FlexRow width="50%">
        <SliderWrapper>
          <SliderInputWrapper>
            <InputSlideRow danger={insuffBalance}>
              {account && <span>{percent} %</span>}
              <InputNumber
                onChange={onChangeUnstake}
                value={inputAmount}
                placeholder={"0.000000"}
              />
            </InputSlideRow>
            {account && (
              <Slider
                min={0}
                onChange={(e) => onChangeRangePercent(e)}
                value={percent}
                marks={{ 0: "", 25: "", 50: "", 75: "", 100: "" }}
                step={1}
              />
            )}
          </SliderInputWrapper>
          {account && (
            <FlexRow justify="flex-end">
              <MaxButton marginTop="10px" isActive={isActive} onClick={onMax}>
                MAX
              </MaxButton>
              <BalanceLine isNumber>
                = $ {formatCurrency(usdtValue, 2)}
              </BalanceLine>
            </FlexRow>
          )}
        </SliderWrapper>
      </FlexRow>
    </TokenCard>
  );
};

export default UnstakeCard;
