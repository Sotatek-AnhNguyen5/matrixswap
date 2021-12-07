import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { ADDRESS_ZAP, PROTOCOL_FUNCTION, WMATIC_TOKEN } from "../../const";
import SubmitButton from "../SubmitButton";
import useZapCallback from "../../hooks/useZapCallback";
import FromTokenCard from "./FromTokenCard";
import { FlexRow, StyledButton } from "../../theme/components";
import SelectTokenModal from "../SelectTokenModal";
import ToLpCard from "./ToLpCard";
import { find, sumBy } from "lodash";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import ConfirmZap from "../ConfirmZap";
import TransactionStatusModal from "../TransactionStatusModal";

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

const ActiveButton = styled(SubmitButton)`
  background-color: ${(props) => props.theme.colorMainGreen};
  width: 55%;
  font-size: 16px;
  border-radius: 26px;
  padding: 20px;
  z-index: 1;
`;

const ZapButton = styled(SubmitButton)`
  background: ${(props) =>
    props.isApproveFirst
      ? "linear-gradient(90.04deg, #0A1C1F 0.96%, #0F2A2E 91.92%);"
      : props.theme.colorMainGreen};
  border-radius: 26px;
  padding: 20px;
  width: ${(props) => (props.isApproveFirst ? "50%" : "100%")};
  z-index: 0;
  margin-left: ${(props) => props.isApproveFirst && "-40px"};
`;

const ZapTab = ({
  lpAddress,
  token0,
  token1,
  refreshStakeBalance,
  type,
  getLpBalance,
  lpBalance,
  lpToken,
}) => {
  const { account } = useWeb3React();
  const [openSelectToken, setOpenSelectToken] = useState(false);
  const [openConfirmZap, setOpenConfirmZap] = useState(false);
  const [isOpenTxStatusModal, setIsOpenTxStatusModal] = useState(false);
  const [selectedIndexTokenModal, setSelectedTokenModal] = useState();
  const [selectedTokens, setSelectedTokens] = useState([WMATIC_TOKEN]);
  const [isZapIn, setIsZapIn] = useState(true);
  // const isZapAble = useCheckZapToken(selectedToken, token0, token1, type);

  const tokenHaveToApprove = find(
    selectedTokens,
    (e) => e.allowance && new BigNumber(e.allowance).isZero()
  );

  const onFinishZap = async () => {
    getLpBalance();
    refreshStakeBalance();
  };

  const params = useMemo(() => {
    const protocolType = PROTOCOL_FUNCTION[type].fullnameHash;
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
  }, [type, selectedTokens]);

  const [onZap, zapLoading, zapStatus, txHash] = useZapCallback(
    params,
    onFinishZap
  );
  const onAddTokens = () => {
    setSelectedTokens((old) => [...old, {}]);
  };

  const onSelectedToken = (token) => {
    setSelectedTokens((old) => {
      const newData = [...old];
      newData.splice(selectedIndexTokenModal, 1, token);
      return [...newData];
    });
  };

  const removeFromList = (index) => {
    index !== 0 &&
      setSelectedTokens((old) => {
        const newData = [...old];
        newData.splice(index, 1);
        return [...newData];
      });
  };

  const onOpenSelectToken = (index) => {
    setSelectedTokenModal(index);
    setOpenSelectToken(true);
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

  return (
    <div>
      <FromToken>From Token</FromToken>
      {selectedTokens.map((ele, i) => {
        return (
          <FromTokenCard
            token={ele}
            key={i}
            index={i}
            removeSelf={() => removeFromList(i)}
            openSelectToken={() => onOpenSelectToken(i)}
            setSelectedTokens={setSelectedTokens}
            lpToken={lpToken}
            farmType={type}
          />
        );
      })}
      <AddTokenButton onClick={onAddTokens}>+ Add token</AddTokenButton>
      <ExchangeWrapper>
        <div className="black-circle" onClick={() => setIsZapIn((old) => !old)}>
          <img src="./images/icons/up-down.png" alt="" />
        </div>
        <div className="green-line" />
      </ExchangeWrapper>
      <ToLpText>To LP</ToLpText>
      <ToLpCard
        estimateOutput={totalEstimateOutput}
        token0={token0}
        token1={token1}
        lpBalance={lpBalance}
      />
      <FlexRow marginTop="20px" justify="flex-start">
        {tokenHaveToApprove && (
          <ActiveButton
            label={"approve"}
            loading={tokenHaveToApprove.loading}
            labelLoading={"approving"}
            onClick={tokenHaveToApprove.approve}
          />
        )}
        <ZapButton
          onClick={() => setOpenConfirmZap(true)}
          isApproveFirst={!!tokenHaveToApprove}
          label={"Zap"}
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
