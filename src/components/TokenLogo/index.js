import { find } from "lodash";
import DefaultToken from "../../json/defaultTokens.json";
import { unWrappedTokenSymbol } from "../../utils";
import { useMemo } from "react";
import styled from "styled-components";
import { tokensLogoLink } from "../../utils/TokenLogo";

const StyledToken = styled.img`
  border-radius: 50%;
`;

const TokenLogo = ({ symbol, style, classname }) => {
  const tokenURI = useMemo(() => {
    const token = find(
      DefaultToken.tokens,
      (e) => e.symbol === unWrappedTokenSymbol(symbol)
    );
    if (token) {
      return token.logoURI;
    }
    const tokenLogo = tokensLogoLink[symbol];
    if (tokenLogo) {
      return tokenLogo;
    }

    return symbol && `./images/tokens/${symbol.toLowerCase()}.png`;
  }, [symbol]);
  return (
    <StyledToken
      style={style}
      src={tokenURI}
      className={classname}
      alt=""
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = "./images/tokens/empty-token-polygon.png";
      }}
    />
  );
};

export default TokenLogo;
