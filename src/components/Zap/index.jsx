import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { PROTOCOL_FUNCTION, WMATIC_TOKEN } from "../../const";
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
  opacity: 0.6;

  &:hover {
    opacity: 1;
    background: transparent;
  }
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

const ButtonWrapper = styled.div`
  width: 100%;
  position: relative;
  z-index: 0;
  display: flex;
`;

const ApproveButton = styled(ActiveButton)`
  width: 60%;
  font-size: 16px;
  border-radius: 26px;
  padding: 20px;
  z-index: 1;
  position: relative;
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
  refetchVolume,
  symbol0,
  symbol1,
  changeTab,
  usdtRate,
}) => {
  const { account } = useWeb3React();
  const { token0, token1 } = lpToken;
  const [openSelectToken, setOpenSelectToken] = useState(false);
  const [openConfirmZap, setOpenConfirmZap] = useState(false);
  const [isOpenTxStatusModal, setIsOpenTxStatusModal] = useState(false);
  const [selectedIndexTokenModal, setSelectedTokenModal] = useState();
  const [selectedTokens, setSelectedTokens] = useState([{ ...WMATIC_TOKEN }]);
  const [isZapIn, setIsZapIn] = useState(true);
  const [toTokensZapOut, setToTokensZapOut] = useState([]);

  const tokenHaveToApprove = useMemo(() => {
    return find(
      selectedTokens,
      (e) =>
        e.allowance &&
        (new BigNumber(e.allowance).isZero() ||
          new BigNumber(e.allowance).lt(e.amount))
    );
  }, [selectedTokens]);

  const selectedListToken = isZapIn ? selectedTokens : toTokensZapOut;

  const [noAmountError, unSelectedTokenError, insuffBalance, invalidToken] =
    useZapValidate(selectedTokens, toTokensZapOut, isZapIn);

  const zapButtonTitle = useMemo(() => {
    if (!account) {
      return "No wallet connected";
    } else if (tokenHaveToApprove) {
      return "Zap";
    } else if (unSelectedTokenError) {
      return "Select a token";
    } else if (noAmountError) {
      return "Enter an amount";
    } else if (insuffBalance) {
      return "Insufficient balance";
    } else if (invalidToken) {
      return "Invalid token";
    }
    return "Zap";
  }, [
    account,
    noAmountError,
    unSelectedTokenError,
    insuffBalance,
    invalidToken,
    tokenHaveToApprove,
  ]);

  const onFinishZap = async () => {
    if (!isZapIn) {
      setToTokensZapOut((old) => {
        const newData = [...old].map((e) => {
          e.amount = "";
          return e;
        });
        return [...newData];
      });
      toTokensZapOut.forEach((e) => e.refreshBalance());
    }
    selectedTokens.forEach((e) => e.refreshBalance());
    selectedTokens.forEach((e) => e.getAllowance());
    await Promise.all([getLpBalance(), refreshStakeBalance()]);
    refetchVolume();
    setSelectedTokens((old) => {
      const newData = [...old].map((e) => {
        e.amount = "";
        e.estimateOutput = 0;
        return e;
      });
      return [...newData];
    });
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
          .toFixed(0, 1)
      );
    return {
      protocolType,
      from: fromList,
      amount: amountList,
      to: lpAddress,
      receiver: account,
    };
  }, [type, selectedTokens, toTokensZapOut, isZapIn]);

  const onFail = () => {
    setIsOpenTxStatusModal(true);
  };

  const [onZap, zapLoading, zapStatus, txHash] = useZapCallback(
    params,
    onFinishZap,
    isZapIn,
    onFail
  );

  const onAddTokens = () => {
    if (isZapIn) {
      setSelectedTokens((old) => [...old, {}]);
      setSelectedTokenModal(selectedTokens.length);
    } else {
      setToTokensZapOut((old) => [...old, {}]);
      setSelectedTokenModal(toTokensZapOut.length);
    }
    setOpenSelectToken(true);
  };

  const onSelectedToken = (token) => {
    const tokenData = { ...token, amount: "" };
    const data = (old) => {
      const newData = [...old];
      newData.splice(selectedIndexTokenModal, 1, tokenData);
      return [...newData];
    };
    if (isZapIn) {
      setSelectedTokens(data);
    } else {
      setToTokensZapOut(data);
      averageRatio(selectedTokens[0].amount);
    }
  };

  const removeFromList = (index) => {
    setSelectedTokens((old) => {
      const newData = [...old];
      newData.splice(index, 1);
      return [...newData];
    });
  };

  const removeFromListToTokens = (index) => {
    setToTokensZapOut((old) => {
      const newData = [...old];
      newData.splice(index, 1);
      return [...newData];
    });
    averageRatio(selectedTokens[0].amount);
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
          e.amount = "";
          return e;
        }),
      ]);
      setSelectedTokens([
        {
          symbol: `LP ${symbol0} - ${symbol1}`,
          decimals: 18,
          address: lpAddress,
          amount: "",
        },
      ]);
    } else {
      setSelectedTokens([
        ...toTokensZapOut.map((e) => {
          e.amount = "";
          e.estimateOutput = 0;
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

  const totalEstimateOutputUSDT = useMemo(() => {
    let total = new BigNumber(0);
    selectedTokens
      .filter((e) => e.usdtAmount)
      .forEach((e) => (total = total.plus(e.usdtAmount)));
    return total;
  }, [selectedTokens]);

  const totalTxCost = useMemo(() => {
    let total = new BigNumber(0);
    selectedTokens
      .filter((e) => e.txCost)
      .forEach((e) => (total = total.plus(e.txCost)));
    if (!isZapIn) {
      toTokensZapOut
        .filter((e) => e.txCost)
        .forEach((e) => (total = total.plus(e.txCost)));
    }
    return total.toFixed();
  }, [selectedTokens, toTokensZapOut, isZapIn]);

  useEffect(() => {
    zapLoading && setIsOpenTxStatusModal(true);
  }, [zapLoading]);

  const averageRatio = (amount) => {
    setToTokensZapOut((old) => {
      const ratio = new BigNumber(100).div(old.length).toFixed(0);
      let remainder = 100 % old.length;
      const newData = old.map((e) => {
        const newAmount = new BigNumber(amount || 0)
          .times(ratio)
          .div(100)
          .toFixed();
        if (remainder > 0) {
          e.ratio = new BigNumber(ratio).plus(1).toFixed(0);
          remainder--;
        } else {
          e.ratio = ratio;
        }
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
            symbol0={symbol0}
            symbol1={symbol1}
            selectedTokens={selectedTokens}
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
          symbol0={symbol0}
          symbol1={symbol1}
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
        <ButtonWrapper>
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
        </ButtonWrapper>
      </FlexRow>
      <SelectTokenModal
        isModalOpen={openSelectToken}
        setIsModalOpen={setOpenSelectToken}
        onSetSelectedToken={onSelectedToken}
        selectedToken={selectedListToken}
      />
      <ConfirmZap
        isModalOpen={openConfirmZap}
        setIsModalOpen={setOpenConfirmZap}
        fromTokenList={selectedTokens}
        symbol0={symbol0}
        symbol1={symbol1}
        onZap={onZap}
        estimateOutput={totalEstimateOutput}
        isZapIn={isZapIn}
        toTokensZapOut={toTokensZapOut}
        totalTxCost={totalTxCost}
        totalEstimateOutputUSDT={totalEstimateOutputUSDT}
      />
      <TransactionStatusModal
        isModalOpen={isOpenTxStatusModal}
        isZapIn={isZapIn}
        setIsModalOpen={setIsOpenTxStatusModal}
        status={zapStatus}
        txHash={txHash}
        token0={token0}
        token1={token1}
        lpAddress={lpAddress}
        estimateOutput={totalEstimateOutput}
        toTokensZapOut={toTokensZapOut}
        onCloseSubmittedModal={changeTab}
      />
    </div>
  );
};

export default ZapTab;
