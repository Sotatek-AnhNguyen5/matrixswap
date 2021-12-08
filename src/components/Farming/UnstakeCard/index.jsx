import styled from "styled-components";
import { FlexRow } from "../../../theme/components";
import React, { useMemo, useRef, useState } from "react";
import InputNumber from "../../InputNumber";
import Slider from "rc-slider";
import BigNumber from "bignumber.js";

const TokenCard = styled.div`
  display: flex;
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
  padding: 0px 20px 20px 20px;
`;

const FakeButton = styled.div`
  background: rgba(1, 3, 4, 0.15);
  border-radius: 16px;
  padding: 20px;
  color: #fff;
  font-size: 18px;
`;
const BorderColor = styled.div`
  height: 45px;
  background-color: rgba(1, 3, 4, 0.15);
  border-radius: 26px;
  width: 2px;
`;

const BalanceLine = styled.div`
  font-size: 16px;
  color: ${(props) =>
    props.danger ? props.theme.colorDanger : "rgba(18, 70, 46, 0.6)"};
  
  span {
    cursor: pointer;
  }
`;

const SliderInputWrapper = styled.div`
  background: rgba(1, 3, 4, 0.1);
  border-radius: 16px;
  width: 100%;
  display: flex;
  flex-flow: column;
  min-height: 65px;

  .input-wrapper {
    width: 90%;
  }

  input {
    text-align: right;
    font-weight: 400;
    font-size: 24px;
    color: rgba(255, 255, 255, 0.6);
    background: transparent;
    border: 0;
    outline: 0;
    padding: 10px 20px;
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

const UnstakeCard = ({ stakedBalance, inputRef, isActive }) => {
  const [percent, setPercent] = useState("0");

  const onChangeRangePercent = (percentAmount) => {
    setPercent(percentAmount);
    if (stakedBalance) {
      inputRef.current.value = new BigNumber(stakedBalance)
        .times(percentAmount)
        .div(100)
        .toFixed();
    }
  };

  const onMax = () => {
    inputRef.current.value = stakedBalance;
    setPercent("100");
  }

  const onChangeUnstake = (value) => {
    const newPercent = new BigNumber(value).div(stakedBalance).times(100);
    setPercent(newPercent.toFixed(0));
  };

  const isOverBalance =
    inputRef.current && new BigNumber(stakedBalance).lt(inputRef.current.value);

  return (
    <TokenCard isActive={isActive}>
      <LeftCard flexFlow="column">
        <FlexRow width="100%" justify="space-between">
          <FakeButton>Your Balance</FakeButton>
          <BorderColor />
        </FlexRow>
        <FlexRow flexFlow="column" marginTop="20px" alignItems="start">
          <BalanceLine danger={isOverBalance}>
            Balance - <span onClick={onMax}>MAX</span>
          </BalanceLine>
          <BalanceLine danger={isOverBalance}>{stakedBalance}</BalanceLine>
        </FlexRow>
      </LeftCard>
      <FlexRow width="50%">
        <SliderWrapper>
          <SliderInputWrapper>
            <InputSlideRow danger={isOverBalance}>
              <span style={{ width: "20%" }}>{percent} %</span>
              <InputNumber onChange={onChangeUnstake} inputRef={inputRef} />
            </InputSlideRow>
            <Slider
              min={0}
              onChange={(e) => onChangeRangePercent(e)}
              defaultValue={percent}
              marks={{ 0: "", 25: "", 50: "", 75: "", 100: "" }}
              step={1}
            />
          </SliderInputWrapper>
          {/*<FlexRow height="64px" justify="flex-end">*/}
          {/*  <BalanceLine>*/}
          {/*    = <span>$ {usdtValue}</span>*/}
          {/*  </BalanceLine>*/}
          {/*</FlexRow>*/}
        </SliderWrapper>
      </FlexRow>
    </TokenCard>
  );
};

export default UnstakeCard;
