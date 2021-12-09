import { useEffect, useState } from "react";
import { find } from "lodash";
import BigNumber from "bignumber.js";

const useZapValidate = (selectedTokens, toTokensZapOut, isZapIn) => {
  const [noAmount, setNoAmount] = useState(false);
  const [noToken, setNoToken] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  useEffect(() => {
    const tokenInsuffBalance = find(
      selectedTokens,
      (e) => e.insufficientBalance
    );
    const tokenInvalid = find(
      isZapIn ? selectedTokens : toTokensZapOut,
      (e) => !e.isZapAble
    );
    setInsufficientBalance(!!tokenInsuffBalance);
    const tokenNoAmount = find(isZapIn ? selectedTokens : toTokensZapOut, (e) =>
      new BigNumber(e.amount).isZero()
    );
    const unSelected = find(
      isZapIn ? selectedTokens : toTokensZapOut,
      (e) => !e.address
    );
    setInvalidToken(tokenInvalid);
    setNoAmount(!!tokenNoAmount);
    setNoToken(!!unSelected);
  }, [selectedTokens, toTokensZapOut, isZapIn]);

  return [noAmount, noToken, insufficientBalance, invalidToken];
};

export default useZapValidate;
