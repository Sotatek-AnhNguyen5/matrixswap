import { useMemo } from "react";
import styled from "styled-components";
import BigNumber from "bignumber.js";
import { formatNumber } from "../../utils";

const MIN_NUMBER = 0.01;

export const StyledNumber = styled.span`
  font-size: 18px;
  font-family: "ChakraPetch", sans-serif;
  font-weight: 400;
`;

const FormatNumber = ({ amount, noFormat }) =>
  useMemo(() => {
    if (noFormat) {
      return <StyledNumber className="styled-number">{amount}</StyledNumber>;
    }
    const bigAmount = new BigNumber(amount);
    return (
      <StyledNumber title={bigAmount.toFixed()} className="styled-number">
        {bigAmount.gte(MIN_NUMBER)
          ? bigAmount.toFormat(2, 1)
          : formatNumber(bigAmount.toFixed())}
      </StyledNumber>
    );
  }, [amount, noFormat]);

export default FormatNumber;
