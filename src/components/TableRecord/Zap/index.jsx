import React, { useState, useEffect, useRef, useMemo } from "react";
import styled from "styled-components";
import InputNumber from "../../InputNumber";
import IERC20ABI from "../../../abi/IERC20ABI.json";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import { toast } from "react-toastify";
import useEstimateOutput from "../../../hooks/useEstimateOutput";
import InputRange from "react-input-range";
import useCheckZapToken from "../../../hooks/useCheckZapToken";
import { ADDRESS_ZAP, PROTOCOL_FUNCTION } from "../../../const";
import useApproveCallBack from "../../../hooks/useApproveCallBack";
import SubmitButton from "../../SubmitButton";
import useZapCallback from "../../../hooks/useZapCallback";
import { find } from "lodash";
import DefaultToken from "../../../json/defaultTokens.json";
import { unWrappedTokenSymbol } from "../../../utils";

const FakeInput = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;

  box-sizing: border-box;
  border-radius: 6px;
  padding: 15px 20px;
  font-size: 20px;
  border: solid 1px white;
  background-color: #333333;
  font-weight: 500;

  div {
    margin-left: auto;

    img {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      margin-right: 10px;
    }
  }
`;

const InputWrapper = styled.div`
  margin-top: 10px;
`;

const BalanceRow = styled.div`
  display: flex;
  margin-top: 10px;
  justify-content: space-between;
`;

const ZapTab = ({
  stakingToken,
  token0,
  token1,
  totalSupplyStakingToken,
  reserves,
  changeTab,
  refreshStakeBalance,
  type,
  getLpBalance,
  lpBalance,
}) => {
  const { library, account } = useWeb3React();
  const [selectedToken, setSelectedToken] = useState({});
  const [tokenBalance, setTokenBalance] = useState(0);
  const [amount, onChangeAmount] = useState(0);
  const isZapAble = useCheckZapToken(selectedToken, token0, token1, type);
  const [zapValuePercent, setZapValuePercent] = useState(0);
  const [approve, loadingApprove, allowance] = useApproveCallBack(
    selectedToken.address,
    ADDRESS_ZAP
  );
  const estimateOutput = useEstimateOutput(
    amount,
    token0,
    selectedToken,
    reserves,
    totalSupplyStakingToken,
    token1,
    type
  );
  const inputRef = useRef();

  const getBalance = async () => {
    if (selectedToken.address) {
      const tokenContract = new library.eth.Contract(
        IERC20ABI,
        selectedToken.address
      );
      const balance = await tokenContract.methods.balanceOf(account).call();
      const balanceToNumber = new BigNumber(balance)
        .div(new BigNumber(10).pow(selectedToken.decimals))
        .toFixed();
      setTokenBalance(balanceToNumber);
    }
  };

  const onChangeRangeStake = (percent) => {
    const value = new BigNumber(tokenBalance).times(percent).div(100).toFixed();
    onChangeAmount(value);
    inputRef.current.value = value;
    setZapValuePercent(percent);
  };

  const onFinishZap = async () => {
    await getBalance();
    await getLpBalance();
    await refreshStakeBalance();
    changeTab();
    toast.success("Zap successfully!");
  };

  const params = useMemo(() => {
    const protocolType = PROTOCOL_FUNCTION[type].fullnameHash;
    const from = selectedToken.address;
    const value = new BigNumber(amount)
      .times(new BigNumber(10).pow(selectedToken.decimals))
      .toFixed();
    return {
      protocolType,
      from,
      amount: value,
      to: stakingToken,
      receiver: account,
    };
  }, [type, selectedToken.address, amount]);

  const onChangeAmountValue = (e) => {
    onChangeAmount(e);
    const percent = new BigNumber(e).div(tokenBalance).times(100);
    e && setZapValuePercent(percent.gt(100) ? 100 : percent.toNumber());
  };

  const [onZap, zapLoading] = useZapCallback(params, onFinishZap);

  const tokenIcon0 = useMemo(() => {
    const token = find(
      DefaultToken.tokens,
      (e) => e.symbol === unWrappedTokenSymbol(token0.symbol)
    );
    return token
      ? token.logoURI
      : "https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/assets/dg.jpg";
  }, [DefaultToken.tokens, token0.symbol]);

  const tokenIcon1 = useMemo(() => {
    const token = find(
      DefaultToken.tokens,
      (e) => e.symbol === unWrappedTokenSymbol(token1.symbol)
    );
    return token
      ? token.logoURI
      : "https://raw.githubusercontent.com/sameepsi/quickswap-default-token-list/master/assets/dg.jpg";
  }, [DefaultToken.tokens, token1.symbol]);

  useEffect(() => {
    getBalance();
  }, [selectedToken.address]);

  return (
    <div>
      <BalanceRow>
        <span>From Token</span>
        <span>Balance: {tokenBalance}</span>
      </BalanceRow>
      <InputWrapper>
        <InputNumber
          withSelectToken={true}
          onSetSelectedToken={setSelectedToken}
          onChange={(e) => onChangeAmountValue(e)}
          inputRef={inputRef}
          disabled={new BigNumber(allowance).isZero()}
        />
      </InputWrapper>
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <InputRange
          onChange={(e) => onChangeRangeStake(e)}
          maxValue={100}
          minValue={0}
          value={zapValuePercent}
          formatLabel={(value) => `${value}%`}
        />
      </div>
      <BalanceRow>
        <span>To LP</span>
        <span>Balance: {lpBalance}</span>
      </BalanceRow>
      <div style={{ marginTop: "10px" }}>
        <FakeInput>
          {estimateOutput}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <img src={tokenIcon0} alt="" />
            <img src={tokenIcon1} alt="" />
            LP {`${token0.symbol} - ${token1.symbol}`}
          </div>
        </FakeInput>
      </div>
      <div
        style={{ display: "flex", justifyContent: "end", marginTop: "20px" }}
      >
        {isZapAble ? (
          new BigNumber(allowance).isZero() ? (
            <SubmitButton
              label={"approve"}
              loading={loadingApprove}
              labelLoading={"approving"}
              onClick={approve}
            />
          ) : (
            <SubmitButton
              label={"zap"}
              loading={zapLoading}
              labelLoading={"zapping"}
              onClick={onZap}
              disabled={!isZapAble}
            />
          )
        ) : (
          <SubmitButton label={"invalid token"} disabled={true} />
        )}
      </div>
    </div>
  );
};

export default ZapTab;
