import styled from "styled-components";
import TokenLogo from "../../TokenLogo";
import React from "react";
import { BalanceLine, FlexRow } from "../../../theme/components";
import {
  InputSlideRow,
  SelectTokenWrapper,
  SliderInputWrapper,
  SliderWrapper,
  TokenCard,
} from "../../../theme/TokenCard";
import InputNumber from "../../InputNumber";

const DoubleLogoWrapper = styled.div`
  width: 92px;
  position: relative;
`;

const TokenLogoWrapper = styled.div`
  background: rgba(1, 3, 4, 0.2);
  border-radius: 26px 0px 0px 26px;
  display: flex;
  justify-content: center;
  padding: 40px 15px;
  width: 10%;
  z-index: 0;
`;

const LogoBorder = styled.div`
  background: rgba(1, 3, 4, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  z-index: 2;
  margin-left: -7px;
  position: absolute;

  img {
    width: 45px;
    height: 45px;
  }
`;

const LogoBorder2 = styled(LogoBorder)`
  z-index: 0;
  left: 30px;
`;

const SelectTokenButton = styled.button`
  background: rgba(1, 3, 4, 0.15);
  font-size: 16px;
  color: #fff;
  border-radius: 16px;
  padding: 0 10px;
  width: 200px;
  height: 55px;
  border: 0;
`;
const BorderColor = styled.div`
  height: 65px;
  background-color: rgba(1, 3, 4, 0.15);
  width: 2px;
  margin-left: auto;
`;
export const BalanceValue = styled.div`
  font-size: 14px;
  color: ${(props) => props.theme.colorGray};
  font-family: ${props => props.isNumber ? "ChakraPetch, sans-serif" : "Ocr-A, serif"};
`;

const ToLpCard = ({ symbol0, symbol1, lpBalance, estimateOutput }) => {
  return (
    <TokenCard>
      <TokenLogoWrapper>
        <DoubleLogoWrapper>
          <LogoBorder>
            <TokenLogo symbol={symbol0} />
          </LogoBorder>
          <LogoBorder2>
            <TokenLogo symbol={symbol1} />
          </LogoBorder2>
        </DoubleLogoWrapper>
      </TokenLogoWrapper>
      <SelectTokenWrapper>
        <FlexRow justify="flex-start">
          <SelectTokenButton>
            LP {symbol0} - {symbol1}
          </SelectTokenButton>
          <BorderColor />
        </FlexRow>
        <div style={{ width: "100%" }}>
          <FlexRow justify="flex-start" marginTop="10px">
            <BalanceValue isNumber>Balance</BalanceValue>
          </FlexRow>
          <FlexRow justify="flex-start">
            <BalanceValue isNumber>{lpBalance} LP</BalanceValue>
          </FlexRow>
        </div>
      </SelectTokenWrapper>
      <SliderWrapper>
        <SliderInputWrapper>
          <InputSlideRow>
            <InputNumber value={estimateOutput} disabled={true} />
          </InputSlideRow>
        </SliderInputWrapper>
      </SliderWrapper>
    </TokenCard>
  );
};

export default ToLpCard;
