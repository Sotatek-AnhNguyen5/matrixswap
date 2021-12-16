import styled from "styled-components";
import TokenLogo from "../../TokenLogo";
import { BalanceLine, FlexRow } from "../../../theme/components";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Slider from "rc-slider";
import BigNumber from "bignumber.js";
import InputNumber from "../../InputNumber";
import useTokenBalance from "../../../hooks/useTokenBalance";
import useConvertToUSDT from "../../../hooks/useConvertToUSDT";
import useApproveCallBack from "../../../hooks/useApproveCallBack";
import { ADDRESS_ZAP } from "../../../const";
import useEstimateOutput from "../../../hooks/useEstimateOutput";
import useCheckZapToken from "../../../hooks/useCheckZapToken";
import {
  InputSlideRow,
  SelectTokenButton,
  SelectTokenWrapper,
  SliderInputWrapper,
  SliderWrapper,
  TokenCard,
  WrappedStyledImage,
} from "../../../theme/TokenCard";

const TokenLogoWrapper = styled.div`
  background: rgba(1, 3, 4, 0.2);
  border-radius: 26px 0px 0px 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 15px;
  width: 10%;
`;

const LogoBorder = styled.div`
  background: rgba(1, 3, 4, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;

  img {
    width: 40px;
    height: 40px;
  }
`;

const BorderColor = styled.div`
  height: 65px;
  background-color: rgba(1, 3, 4, 0.15);
  border-radius: 26px;
  width: 2px;
  margin-left: auto;
`;

const FromTokenCard = ({
  token,
  removeSelf,
  openSelectToken,
  setSelectedTokens,
  index,
  lpToken,
  farmType,
  isZapIn,
  refreshRatio,
}) => {
  const [percent, setPercent] = useState("0");
  const usdtValue = useConvertToUSDT(token.amount, token, farmType);
  const [balance, refreshBalance] = useTokenBalance(
    token.address,
    token.decimals
  );
  const isZapAble = useCheckZapToken(
    token,
    lpToken.token0,
    lpToken.token1,
    farmType
  );

  const setAmount = (value) => {
    setSelectedTokens((old) => {
      const newData = [...old];
      newData[index].amount = value;
      return [...newData];
    });
  };

  const [approve, loading, allowance] = useApproveCallBack(
    token.address,
    ADDRESS_ZAP
  );
  const estimateOutput = useEstimateOutput(
    token.amount,
    token,
    lpToken,
    farmType
  );

  const insufficientBalance = useMemo(() => {
    return new BigNumber(token.amount).gt(balance);
  }, [token.amount, balance]);

  const onChangeRangePercent = (percentAmount) => {
    setPercent(percentAmount);
    if (balance) {
      const toValue = new BigNumber(balance)
        .times(percentAmount)
        .div(100)
        .toFixed();
      setAmount(toValue);
      !isZapIn && refreshRatio(toValue);
    }
  };

  const onChangeAmountValue = (e) => {
    setAmount(e);
    !isZapIn && refreshRatio(e);
    const amountToPercent = new BigNumber(e || 0).div(balance).times(100);
    setPercent(amountToPercent.toFixed(0));
  };

  useEffect(() => {
    setSelectedTokens((old) => {
      const newData = [...old];
      newData[index].allowance = allowance;
      newData[index].approve = approve;
      newData[index].loading = loading;
      newData[index].usdtAmount = usdtValue;
      newData[index].estimateOutput = estimateOutput;
      newData[index].insufficientBalance = insufficientBalance;
      newData[index].isZapAble = isZapAble;
      newData[index].refreshBalance = refreshBalance;
      return [...newData];
    });
  }, [
    allowance,
    loading,
    usdtValue,
    estimateOutput,
    insufficientBalance,
    isZapAble,
    refreshBalance,
  ]);

  return (
    <TokenCard isActiveBg={true}>
      <TokenLogoWrapper>
        <LogoBorder>
          <TokenLogo symbol={token.symbol} />
        </LogoBorder>
      </TokenLogoWrapper>
      <SelectTokenWrapper>
        <FlexRow justify="flex-start">
          <SelectTokenButton onClick={isZapIn && openSelectToken}>
            {token.symbol}
          </SelectTokenButton>
          <WrappedStyledImage onClick={removeSelf}>
            <img alt="" src="./images/icons/close.png" />
          </WrappedStyledImage>
          <BorderColor />
        </FlexRow>
        <div style={{ width: "100%" }}>
          <FlexRow justify="flex-start" marginTop="10px">
            <BalanceLine danger={insufficientBalance}>
              Balance - <span onClick={() => setAmount(balance)}>MAX</span>
            </BalanceLine>
          </FlexRow>
          <FlexRow justify="flex-start">
            <BalanceLine danger={insufficientBalance}>
              {balance} {token.symbol}
            </BalanceLine>
          </FlexRow>
        </div>
      </SelectTokenWrapper>
      <SliderWrapper>
        <SliderInputWrapper>
          <InputSlideRow danger={insufficientBalance}>
            <span>{percent} %</span>
            <InputNumber
              value={token.amount}
              onChange={(e) => onChangeAmountValue(e)}
            />
          </InputSlideRow>
          <Slider
            min={0}
            onChange={(e) => onChangeRangePercent(e)}
            defaultValue={percent}
            marks={{ 0: "", 25: "", 50: "", 75: "", 100: "" }}
            step={1}
          />
        </SliderInputWrapper>
        <FlexRow height="38px" justify="flex-end">
          <BalanceLine isNumber>= $ {usdtValue}</BalanceLine>
        </FlexRow>
      </SliderWrapper>
    </TokenCard>
  );
};

export default FromTokenCard;
