import styled from "styled-components";
import TokenLogo from "../../TokenLogo";
import { FlexRow } from "../../../theme/components";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Slider from "rc-slider";
import BigNumber from "bignumber.js";
import InputNumber from "../../InputNumber";
import useTokenBalance from "../../../hooks/useTokenBalance";
import useConvertToUSDT from "../../../hooks/useConvertToUSDT";
import useApproveCallBack from "../../../hooks/useApproveCallBack";
import { ADDRESS_ZAP } from "../../../const";
import useEstimateOutput from "../../../hooks/useEstimateOutput";

const TokenCard = styled.div`
  display: flex;
  align-items: center;
  background: linear-gradient(90.04deg, #0a1c1f 0.96%, #0f2a2e 91.92%);
  border-radius: 26px;
  width: 100%;
  margin-top: 20px;
`;

const TokenLogoWrapper = styled.div`
  background: rgba(1, 3, 4, 0.2);
  border-radius: 26px 0px 0px 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 15px;
  width: 10%;
  height: 100px;
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

const SelectTokenWrapper = styled.div`
  display: flex;
  flex-flow: column;
  padding: 20px;
  width: 50%;
`;

const SliderWrapper = styled.div`
  display: flex;
  flex-flow: column;
  padding: 20px;
  width: 40%;
`;

const SliderInputWrapper = styled.div`
  background: rgba(1, 3, 4, 0.1);
  border-radius: 16px;
  width: 100%;
  display: flex;
  flex-flow: column;
  min-height: 65px;

  .input-wrapper {
    width: 100%;
  }

  input {
    text-align: right;
    font-weight: 400;
    font-size: 24px;
    color: #fff;
    background: transparent;
    border: 0;
    outline: 0;
    padding: 10px 20px;
  }

  span {
    margin-left: auto;
    margin-bottom: 10px;
    margin-right: 20px;
  }
`;

const SelectTokenButton = styled.button`
  background: rgba(1, 3, 4, 0.15);
  cursor: pointer;
  font-size: 18px;
  color: #fff;
  border-bottom-left-radius: 16px;
  border-top-left-radius: 16px;
  padding: 0 20px;
  width: 150px;
  height: 65px;
  border: 0;

  &:hover {
    background: rgba(81, 139, 167, 0.15);
  }
`;

const WrappedStyledImage = styled.div`
  border-bottom-right-radius: 16px;
  border-top-right-radius: 16px;
  background: rgba(1, 3, 4, 0.15);
  height: 65px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: rgba(81, 139, 167, 0.15);
  }
`;

const BalanceLine = styled.div`
  color: #fff;
  font-size: 16px;
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
  const usdtValue = useConvertToUSDT(token.amount, token, farmType);
  const [balance] = useTokenBalance(token.address, token.decimals);
  const estimateOutput = useEstimateOutput(1, token, lpToken, farmType);

  const estimateValue = useMemo(() => {
    return new BigNumber(1).div(estimateOutput).times(token.amount).toFixed(8);
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
      return [...newData];
    });
  }, [usdtValue, estimateValue]);

  return (
    <TokenCard>
      <TokenLogoWrapper>
        <LogoBorder>
          <TokenLogo symbol={token.symbol} />
        </LogoBorder>
      </TokenLogoWrapper>
      <SelectTokenWrapper>
        <FlexRow justify="flex-start">
          <SelectTokenButton onClick={openSelectToken}>
            {token.symbol}
          </SelectTokenButton>
          <WrappedStyledImage onClick={removeSelf}>
            <img alt="" src="./images/icons/close.png" />
          </WrappedStyledImage>
          <BorderColor />
        </FlexRow>
        <div style={{ width: "100%" }}>
          <FlexRow justify="flex-start" marginTop="10px">
            <BalanceLine>Balance</BalanceLine>
          </FlexRow>
          <FlexRow justify="flex-start" marginTop="10px">
            <BalanceLine>
              {balance} {token.symbol}
            </BalanceLine>
          </FlexRow>
        </div>
      </SelectTokenWrapper>
      <SliderWrapper>
        <SliderInputWrapper>
          <InputNumber
            onChange={(e) => onChangeAmountValue(e)}
            value={token.amount}
          />
          <span>{fromSelectedToken[0].symbol}</span>
        </SliderInputWrapper>
        <FlexRow height="64px" justify="flex-end">
          <BalanceLine>
            = {estimateValue} {token.symbol}
          </BalanceLine>
        </FlexRow>
      </SliderWrapper>
    </TokenCard>
  );
};

export default ToTokenCard;
