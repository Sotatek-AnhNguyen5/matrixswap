import { memo, useMemo } from "react";
import styled from "styled-components";
import BigNumber from "bignumber.js";

export const StyledNumber = styled.span`
  font-size: 18px;
  font-family: "ChakraPetch", sans-serif;
  font-weight: 400;
`;

const FormatNumber = ({ amount }) =>
  useMemo(() => {
    return <StyledNumber className="styled-number">{amount}</StyledNumber>;
  }, [amount]);

export default FormatNumber;