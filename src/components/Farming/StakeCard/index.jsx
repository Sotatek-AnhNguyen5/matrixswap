import styled from "styled-components";
import { BalanceLine, FlexRow } from "../../../theme/components";
import React, { useMemo, useState } from "react";
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
  margin-top: 20px;
  padding: 15px 20px 15px 40px;
  box-sizing: border-box;
`;

const LeftCard = styled(FlexRow)`
  width: 50%;
`;

const SliderWrapper = styled.div`
  display: flex;
  flex-flow: column;
  align-items: flex-start;
  padding: 0 20px;
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
  }
  
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

const StakeCard = ({
  lpLabel,
  amountStake,
  setAmountStake,
  lpBalance,
  isActive,
  insuffBalance,
}) => {
  const [percent, setPercent] = useState("0");

  const onChangeRangePercent = (percentAmount) => {
    setPercent(percentAmount);
    if (lpBalance) {
      setAmountStake(
        new BigNumber(lpBalance).times(percentAmount).div(100).toFixed()
      );
    }
  };

  const onMax = () => {
    setAmountStake(lpBalance);
    setPercent("100");
  };

  const onChangeStake = (value) => {
    setAmountStake(value);
    if (lpBalance) {
      const newPercent = new BigNumber(value).div(lpBalance).times(100);
      setPercent(newPercent.isNaN() ? "0" : newPercent.toFixed(0));
    }
  };

  return (
    <TokenCard isActive={isActive}>
      <LeftCard flexFlow="column">
        <FlexRow width="100%" justify="space-between">
          <FakeButton>{lpLabel}</FakeButton>
          <BorderColor />
        </FlexRow>
        <FlexRow flexFlow="column" marginTop="10px" alignItems="start">
          <BalanceLine danger={insuffBalance}>
            Balance - <span onClick={onMax}>MAX</span>
          </BalanceLine>
          <BalanceLine isNumber danger={insuffBalance}>{lpBalance}</BalanceLine>
        </FlexRow>
      </LeftCard>
      <FlexRow width="50%">
        <SliderWrapper>
          <SliderInputWrapper>
            <InputSlideRow danger={insuffBalance}>
              <span>{percent} %</span>
              <InputNumber value={amountStake} onChange={onChangeStake} />
            </InputSlideRow>
            <Slider
              min={0}
              onChange={(e) => onChangeRangePercent(e)}
              defaultValue={percent}
              marks={{ 0: "", 25: "", 50: "", 75: "", 100: "" }}
              step={1}
            />
          </SliderInputWrapper>
        </SliderWrapper>
      </FlexRow>
    </TokenCard>
  );
};

export default StakeCard;
