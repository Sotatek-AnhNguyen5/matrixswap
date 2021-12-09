import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ADDRESS_ZAP, PROTOCOL_FUNCTION, WMATIC_TOKEN } from "../../const";
import useZapCallback from "../../hooks/useZapCallback";
import FromTokenCard from "./FromTokenCard";
import { ActiveButton, FlexRow, StyledButton } from "../../theme/components";
import SelectTokenModal from "../SelectTokenModal";
import ToLpCard from "./ToLpCard";
import { find } from "lodash";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import ConfirmZap from "../ConfirmZap";
import TransactionStatusModal from "../TransactionStatusModal";
import ToTokenCard from "./ToTokenCard";
import useZapValidate from "../../hooks/useZapValidate";

const FromToken = styled.div`
  color: rgba(30, 174, 37, 0.5);
  font-size: 16px;
  line-height: 19px;
  margin-top: 20px;
`;

const AddTokenButton = styled(StyledButton)`
  border-radius: 26px;
  width: 100%;
  padding: 10px 20px;
  text-align: center;
  color: ${(props) => props.theme.colorMainGreen};
  font-size: 16px;
  margin-top: 40px;
  border: 2px dashed rgba(62, 224, 70, 0.6);
  background: transparent;
`;

const ExchangeWrapper = styled.div`
  background-color: #010304;
  margin-top: 40px;
  position: relative;
  cursor: pointer;
  height: 0.175rem;
  width: 100%;
  z-index: 0;

  .black-circle {
    background-color: #010304;
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    z-index: 1;
    left: 50%;
    border-radius: 50%;
    transform: translateX(-1.125rem);
    transition: all 0.14s ease 0.36s;
    width: 2.25rem;
    height: 2.25rem;
    top: -16px;
  }

  img {
    width: 1.5rem;
    height: 1.25rem;
  }

  .green-line {
    position: absolute;
    left: 50%;
    height: 0.175rem;
    width: 0;
    background-color: #1eae25;
    transform: translateX(-50%);
    transition: all 0.4s ease-in 0s;
  }

  &:hover {
    .green-line {
      width: 100%;
      transition: all 0.4s ease-in 0s;
    }

    .black-circle {
      background-color: #1eae25;
      transition: all 0.2s ease 0s;
    }
  }
`;

const ToLpText = styled.div`
  color: #3f7178;
  font-size: 16px;
  margin-top: 40px;
`;

const ApproveButton = styled(ActiveButton)`
  width: 55%;
  font-size: 16px;
  border-radius: 26px;
  padding: 20px;
  z-index: 1;
`;

const ZapButton = styled(ActiveButton)`
  border-radius: 26px;
  padding: 20px;
  width: ${(props) => (props.isApproveFirst ? "50%" : "100%")};
  z-index: 0;
  margin-left: ${(props) => props.isApproveFirst && "-40px"};
`;

const ZapTab = ({
  lpAddress,
  refreshStakeBalance,
  type,
  getLpBalance,
  lpBalance,
  lpToken,
  wrappedSymbol,
  refetchVolume,
}) => {
  const { account } = useWeb3React();
  const { token0, token1 } = lpToken;
  const [openSelectToken, setOpenSelectToken] = useState(false);
  const [openConfirmZap, setOpenConfirmZap] = useState(false);
  const [isOpenTxStatusModal, setIsOpenTxStatusModal] = useState(false);
  const [selectedIndexTokenModal, setSelectedTokenModal] = useState();
  const [selectedTokens, setSelectedTokens] = useState([
    { ...WMATIC_TOKEN, amount: 0 },
  ]);
  const [isZapIn, setIsZapIn] = useState(true);
  const [toTokensZapOut, setToTokensZapOut] = useState([]);

  const tokenHaveToApprove = find(
    selectedTokens,
    (e) => e.allowance && new BigNumber(e.allowance).isZero()
  );

  const [noAmountError, unSelectedTokenError, insuffBalance, invalidToken] =
    useZapValidate(selectedTokens, toTokensZapOut, isZapIn);

  const zapButtonTitle = useMemo(() => {
    if (unSelectedTokenError) {
      return "Select a token";
    } else if (noAmountError) {
      return "Enter an amount";
    } else if (insuffBalance) {
      return "Insufficient balance";
    } else if (invalidToken) {
      return "Invalid token";
    }
    return "Zap";
  }, [noAmountError, unSelectedTokenError, insuffBalance, invalidToken]);

  const onFinishZap = async () => {
    if (!isZapIn) {
      toTokensZapOut.forEach((e) => e.refreshBalance());
    }
    const balanceJob = [];
    selectedTokens.forEach((e) => e.refreshBalance());
    await Promise.all([getLpBalance(), refreshStakeBalance(), balanceJob]);
    refetchVolume();
  };

  const params = useMemo(() => {
    const protocolType = PROTOCOL_FUNCTION[type].fullnameHash;

    if (!isZapIn) {
      const ratio = toTokensZapOut
        .filter((e) => e.address)
        .map((e) => parseInt(e.ratio));
      const amountBig = new BigNumber(selectedTokens[0].amount)
        .times(new BigNumber(10).pow(18))
        .toFixed(0);
      const toList = toTokensZapOut
        .filter((e) => e.address)
        .map((e) => e.address);
      return [protocolType, lpToken.address, amountBig, toList, ratio, account];
    }
    const fromList = selectedTokens
      .filter((e) => e.address)
      .map((e) => e.address);
    const amountList = selectedTokens
      .filter((e) => e.address)
      .map((e) =>
        new BigNumber(e.amount)
          .times(new BigNumber(10).pow(e.decimals))
          .toFixed(0)
      );
    return {
      protocolType,
      from: fromList,
      amount: amountList,
      to: lpAddress,
      receiver: account,
    };
  }, [type, selectedTokens, toTokensZapOut, isZapIn]);

  const [onZap, zapLoading, zapStatus, txHash] = useZapCallback(
    params,
    onFinishZap,
    isZapIn
  );

  const onAddTokens = () => {
    if (isZapIn) {
      setSelectedTokens((old) => [...old, {}]);
    } else {
      setToTokensZapOut((old) => [...old, {}]);
    }
  };

  const onSelectedToken = (token) => {
    const data = (old) => {
      const newData = [...old];
      newData.splice(selectedIndexTokenModal, 1, token);
      return [...newData];
    };
    if (isZapIn) {
      setSelectedTokens(data);
    } else {
      setToTokensZapOut(data);
    }
  };

  const removeFromList = (index) => {
    index !== 0 &&
      setSelectedTokens((old) => {
        const newData = [...old];
        newData.splice(index, 1);
        return [...newData];
      });
  };

  const removeFromListToTokens = (index) => {
    index !== 0 &&
      setToTokensZapOut((old) => {
        const newData = [...old];
        newData.splice(index, 1);
        return [...newData];
      });
  };

  const onOpenSelectToken = (index) => {
    setSelectedTokenModal(index);
    setOpenSelectToken(true);
  };

  const onChangeTypeZap = () => {
    setIsZapIn((old) => !old);
    if (isZapIn) {
      setToTokensZapOut([
        ...selectedTokens.map((e) => {
          e.amount = 0;
          return e;
        }),
      ]);
      setSelectedTokens([
        {
          symbol: `LP ${token0.symbol} - ${token1.symbol}`,
          decimals: 18,
          address: lpAddress,
          amount: 0,
        },
      ]);
    } else {
      setSelectedTokens([
        ...toTokensZapOut.map((e) => {
          e.amount = 0;
          return e;
        }),
      ]);
      setToTokensZapOut([]);
    }
  };

  const totalEstimateOutput = useMemo(() => {
    let total = new BigNumber(0);
    selectedTokens
      .filter((e) => e.estimateOutput)
      .forEach((e) => (total = total.plus(e.estimateOutput)));
    return total.toFixed();
  }, [selectedTokens]);

  useEffect(() => {
    zapLoading && setIsOpenTxStatusModal(true);
  }, [zapLoading]);

  const averageRatio = (amount) => {
    setToTokensZapOut((old) => {
      const ratio = new BigNumber(100).div(old.length).toFixed(0);
      const newData = old.map((e) => {
        const newAmount = new BigNumber(amount).times(ratio).div(100).toFixed();
        e.ratio = ratio;
        e.amount = newAmount;
        return e;
      });
      return [...newData];
    });
  };

  return (
    <div>
      <FromToken>{isZapIn ? "From Token" : "From LP"}</FromToken>
      {selectedTokens.map((ele, i) => {
        return (
          <FromTokenCard
            token={ele}
            key={`${lpAddress}-${type}-${i}`}
            index={i}
            removeSelf={() => removeFromList(i)}
            openSelectToken={() => onOpenSelectToken(i)}
            setSelectedTokens={setSelectedTokens}
            refreshRatio={averageRatio}
            lpToken={lpToken}
            farmType={type}
            isZapIn={isZapIn}
          />
        );
      })}
      {isZapIn && (
        <AddTokenButton onClick={onAddTokens}>+ Add token</AddTokenButton>
      )}
      <ExchangeWrapper>
        <div className="black-circle" onClick={onChangeTypeZap}>
          <img src="./images/icons/up-down.png" alt="" />
        </div>
        <div className="green-line" />
      </ExchangeWrapper>
      <ToLpText>{isZapIn ? "To LP" : "To token"}</ToLpText>
      {isZapIn ? (
        <ToLpCard
          estimateOutput={totalEstimateOutput}
          token0={token0}
          token1={token1}
          lpBalance={lpBalance}
        />
      ) : (
        <>
          {toTokensZapOut.map((e, index) => (
            <ToTokenCard
              key={`${e.address}-${index}`}
              token={e}
              fromSelectedToken={selectedTokens}
              setFromSelectedToken={setSelectedTokens}
              removeSelf={() => removeFromListToTokens(index)}
              setSelectedTokens={setToTokensZapOut}
              toTokensZapOut={toTokensZapOut}
              index={index}
              openSelectToken={() => onOpenSelectToken(index)}
              farmType={type}
              lpToken={lpToken}
            />
          ))}
        </>
      )}

      <FlexRow justify="center" marginTop="20px">
        {!isZapIn && (
          <AddTokenButton onClick={onAddTokens}>+ Add token</AddTokenButton>
        )}
      </FlexRow>
      <FlexRow marginTop="20px" justify="flex-start">
        {tokenHaveToApprove && (
          <ApproveButton
            label={"approve"}
            loading={tokenHaveToApprove.loading}
            labelLoading={"approving"}
            onClick={tokenHaveToApprove.approve}
          />
        )}
        <ZapButton
          onClick={() => setOpenConfirmZap(true)}
          isApproveFirst={!!tokenHaveToApprove}
          disabled={
            !!tokenHaveToApprove ||
            noAmountError ||
            unSelectedTokenError ||
            invalidToken ||
            insuffBalance
          }
          label={zapButtonTitle}
          labelLoading={"Zapping"}
        />
      </FlexRow>
      <SelectTokenModal
        isModalOpen={openSelectToken}
        setIsModalOpen={setOpenSelectToken}
        onSetSelectedToken={onSelectedToken}
      />
      <ConfirmZap
        isModalOpen={openConfirmZap}
        setIsModalOpen={setOpenConfirmZap}
        fromTokenList={selectedTokens}
        token0={token0}
        token1={token1}
        onZap={onZap}
        estimateOutput={totalEstimateOutput}
        isZapIn={isZapIn}
        toTokensZapOut={toTokensZapOut}
      />
      <TransactionStatusModal
        isModalOpen={isOpenTxStatusModal}
        setIsModalOpen={setIsOpenTxStatusModal}
        status={zapStatus}
        txHash={txHash}
        token0={token0}
        token1={token1}
        lpAddress={lpAddress}
        estimateOutput={totalEstimateOutput}
      />
    </div>
  );
};

export default ZapTab;
