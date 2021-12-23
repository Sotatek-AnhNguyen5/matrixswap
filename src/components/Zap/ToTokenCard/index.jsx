import styled from "styled-components";
import TokenLogo from "../../TokenLogo";
import { BalanceLine, FlexRow } from "../../../theme/components";
import React, { useEffect, useMemo, useRef, useState } from "react";
import BigNumber from "bignumber.js";
import InputNumber from "../../InputNumber";
import useTokenBalance from "../../../hooks/useTokenBalance";
import useConvertToUSDT from "../../../hooks/useConvertToUSDT";
import useEstimateOutput from "../../../hooks/useEstimateOutput";
import useCheckZapToken from "../../../hooks/useCheckZapToken";
import {
  InputSlideRow,
  SelectTokenButton,
  SelectTokenWrapper,
  SliderInputWrapper,
  SliderWrapper,
  TokenCard,
  TokenLogoWrapper,
  WrappedStyledImage,
} from "../../../theme/TokenCard";
import {formatBalance, formatCurrency} from "../../../utils";
import useConvertToWMATIC from "../../../hooks/useConvertToWmatic";

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

const SliderInputWrapper2 = styled(SliderInputWrapper)`
  .input-wrapper {
    width: 100%;
  }

  span {
    margin: 0 10px 10px auto;
    color: rgba(255, 255, 255, 0.6);
  }
`;

const BalanceLine2 = styled(BalanceLine)`
  color: #fff;
`;

const BorderColor = styled.div`
  height: 65px;
  background-color: rgba(1, 3, 4, 0.15);
  border-radius: 26px;
  width: 2px;
  margin-left: auto;
`;

const ToTokenCard = ({
  token,
  removeSelf,
  openSelectToken,
  setSelectedTokens,
  index,
  fromSelectedToken,
  setFromSelectedToken,
  toTokensZapOut,
  farmType,
  lpToken,
}) => {
  const usdtValue = useConvertToUSDT(token.amount, token, farmType, true);
  const txCost = useConvertToWMATIC(token.amount, token, farmType);
  const [balance, refreshBalance] = useTokenBalance(
    token.address,
    token.decimals
  );
  const estimateOutput = useEstimateOutput(1, token, lpToken, farmType);
  const isZapAble = useCheckZapToken(
    token,
    lpToken.token0,
    lpToken.token1,
    farmType
  );

  const isCloseAble = useMemo(() => {
    return toTokensZapOut.length >= 2;
  }, [toTokensZapOut]);

  const estimateValue = useMemo(() => {
    return new BigNumber(1)
      .div(estimateOutput)
      .times(token.amount || 0)
      .toFixed(8);
  }, [token.amount, estimateOutput]);

  const onChangeAmountValue = async (e) => {
    await setSelectedTokens((old) => {
      const newData = [...old];
      newData[index].amount = e;
      return [...newData];
    });
    let total = new BigNumber(0);
    toTokensZapOut.forEach((ele) => (total = total.plus(ele.amount || 0)));
    setFromSelectedToken((old) => {
      const newData = [...old];
      old[0].amount = total.toFixed();
      return newData;
    });
    setSelectedTokens((old) => {
      const newData = old.map((e) => {
        e.ratio = new BigNumber(e.amount).div(total).times(100).toFixed();
        return e;
      });
      return [...newData];
    });
  };

  useEffect(() => {
    setSelectedTokens((old) => {
      const newData = [...old];
      newData[index].usdtAmount = usdtValue;
      newData[index].estimateValue = estimateValue;
      newData[index].isZapAble = isZapAble;
      newData[index].refreshBalance = refreshBalance;
      newData[index].txCost = txCost;
      return [...newData];
    });
  }, [usdtValue, estimateValue, isZapAble, refreshBalance, txCost]);

  return (
    <TokenCard>
      <TokenLogoWrapper>
        <LogoBorder>
          <TokenLogo symbol={token.symbol} />
        </LogoBorder>
      </TokenLogoWrapper>
      <SelectTokenWrapper>
        <FlexRow justify="flex-start">
          <SelectTokenButton isCloseAble={isCloseAble} onClick={openSelectToken}>
            {token.symbol}
          </SelectTokenButton>
          {isCloseAble && (
            <WrappedStyledImage onClick={removeSelf}>
              <img alt="" src="./images/icons/close.png" />
            </WrappedStyledImage>
          )}
          <BorderColor />
        </FlexRow>
        <div style={{ width: "100%" }}>
          <FlexRow justify="flex-start" marginTop="10px">
            <BalanceLine2 isNumber>Balance</BalanceLine2>
          </FlexRow>
          <FlexRow justify="flex-start">
            <BalanceLine2 isNumber>
              {formatBalance(balance)} {token.symbol}
            </BalanceLine2>
          </FlexRow>
        </div>
      </SelectTokenWrapper>
      <SliderWrapper>
        <SliderInputWrapper2>
          <InputSlideRow>
            <InputNumber
              onChange={(e) => onChangeAmountValue(e)}
              value={token.amount}
              placeholder={"0.000000"}
            />
          </InputSlideRow>
          <span>{fromSelectedToken[0].symbol}</span>
        </SliderInputWrapper2>
        <FlexRow height="38px" justify="flex-end">
          <BalanceLine2 isNumber>
            = {formatCurrency(estimateValue)} {token.symbol}
          </BalanceLine2>
        </FlexRow>
      </SliderWrapper>
    </TokenCard>
  );
};

export default ToTokenCard;
