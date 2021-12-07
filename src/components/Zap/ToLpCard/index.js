import styled from "styled-components";
import TokenLogo from "../../TokenLogo";
import React from "react";
import { FlexRow } from "../../../theme/components";

const TokenCard = styled.div`
  display: flex;
  align-items: center;
  background: linear-gradient(90.04deg, #0a1c1f 0.96%, #0f2a2e 91.92%);
  border-radius: 26px;
  width: 100%;
  margin-top: 20px;
`;

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
  height: 100px;
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
  margin-left: 10px;
  position: absolute;

  img {
    width: 45px;
    height: 45px;
  }
`;

const BalanceLine = styled.div`
  color: ${(props) => props.theme.colorGray};
  font-size: 16px;
`;

const LogoBorder2 = styled(LogoBorder)`
  z-index: 0;
  left: 30px;
`;

const SelectTokenWrapper = styled.div`
  display: flex;
  flex-flow: column;
  padding: 20px;
  width: 50%;
`;

const SelectTokenButton = styled.button`
  background: rgba(1, 3, 4, 0.15);
  font-size: 16px;
  color: #fff;
  border-radius: 16px;
  padding: 0 10px;
  width: 200px;
  height: 65px;
  border: 0;
`;

const BorderColor = styled.div`
  height: 65px;
  background-color: rgba(1, 3, 4, 0.15);
  width: 2px;
  margin-left: auto;
`;

const SliderWrapper = styled.div`
  display: flex;
  flex-flow: column;
  padding: 0px 20px;
  width: 40%;
  height: 130px;
`;

const OutputWrapper = styled.div`
  font-size: 24px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: normal;
  border-radius: 16px;
  background: rgba(1, 3, 4, 0.1);
  padding: 0 10px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const ToLpCard = ({ token0, token1, lpBalance, estimateOutput }) => {
  return (
    <TokenCard>
      <TokenLogoWrapper>
        <DoubleLogoWrapper>
          <LogoBorder>
            <TokenLogo symbol={token0.symbol} />
          </LogoBorder>
          <LogoBorder2>
            <TokenLogo symbol={token1.symbol} />
          </LogoBorder2>
        </DoubleLogoWrapper>
      </TokenLogoWrapper>
      <SelectTokenWrapper>
        <FlexRow justify="flex-start">
          <SelectTokenButton>
            LP {`${token0.symbol}-${token1.symbol}`}
          </SelectTokenButton>
          <BorderColor />
        </FlexRow>
        <div style={{ width: "100%" }}>
          <FlexRow justify="flex-start" marginTop="10px">
            <BalanceLine>Balance</BalanceLine>
          </FlexRow>
          <FlexRow justify="flex-start" marginTop="10px">
            <BalanceLine>{lpBalance} LP</BalanceLine>
          </FlexRow>
        </div>
      </SelectTokenWrapper>
      <SliderWrapper>
        <OutputWrapper>{estimateOutput}</OutputWrapper>
      </SliderWrapper>
    </TokenCard>
  );
};

export default ToLpCard;
