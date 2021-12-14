import { memo, useMemo } from "react";
import styled from "styled-components";
import BigNumber from "bignumber.js";
import { formatSmallNumber } from "../../utils";

export const StyledNumber = styled.span`
  font-size: 18px;
  font-family: "ChakraPetch", sans-serif;
  font-weight: 400;
`;

const FormatNumber = ({ amount, decimals, noFormat }) =>
  useMemo(() => {
    if (noFormat) {
      return <StyledNumber className="styled-number">{amount}</StyledNumber>;
    }
    const bigAmount = new BigNumber(amount);
    return (
      <StyledNumber className="styled-number">
        {formatSmallNumber(bigAmount.toFixed())}
      </StyledNumber>
    );
  }, [amount]);

export default FormatNumber;
