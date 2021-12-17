import { memo, useMemo } from "react";
import styled from "styled-components";
import BigNumber from "bignumber.js";
import {formatNumber, formatSmallNumber} from "../../utils";

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
    const bigAmount = new BigNumber(amount).toFixed();
    return (
      <StyledNumber title={bigAmount} className="styled-number">
        {formatNumber(bigAmount)}
      </StyledNumber>
    );
  }, [amount]);

export default FormatNumber;
