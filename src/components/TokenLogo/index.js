import { find } from "lodash";
import DefaultToken from "../../json/defaultTokens.json";
import { unWrappedTokenSymbol } from "../../utils";
import { useMemo } from "react";
import styled from "styled-components";

const StyledToken = styled.img`
  border-radius: 50%;
`;

const TokenLogo = ({ symbol, style }) => {
  const tokenURI = useMemo(() => {
    const token = find(
      DefaultToken.tokens,
      (e) => e.symbol === unWrappedTokenSymbol(symbol)
    );
    if (token) {
      return token.logoURI;
    }
    return symbol && `./images/tokens/${symbol.toLowerCase()}.png`;
  }, [symbol]);
  return (
    <StyledToken
      style={style}
      src={tokenURI}
      alt=""
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "./images/tokens/question.png";
      }}
    />
  );
};

export default TokenLogo;
