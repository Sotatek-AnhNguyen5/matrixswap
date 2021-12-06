import React, { useMemo, useState } from "react";
import styled from "styled-components";
import { ADDRESS_ZAP, PROTOCOL_FUNCTION, WMATIC_TOKEN } from "../../const";
import SubmitButton from "../SubmitButton";
import useZapCallback from "../../hooks/useZapCallback";
import FromTokenCard from "./FromTokenCard";
import { FlexRow, StyledButton } from "../../theme/components";
import SelectTokenModal from "../SelectTokenModal";
import ToLpCard from "./ToLpCard";
import { find } from "lodash";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";

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
  border-bottom: 3px solid #010304;
  display: flex;
  justify-content: center;
  margin-top: 20px;

  img {
    width: 40px;
    height: 40px;
    margin-bottom: -20px;
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
  stakingToken,
  token0,
  token1,
  refreshStakeBalance,
  type,
  getLpBalance,
  lpBalance,
}) => {
  const { account } = useWeb3React();
  const [openSelectToken, setOpenSelectToken] = useState(false);
  const [selectedIndexTokenModal, setSelectedTokenModal] = useState();
  const [selectedTokens, setSelectedTokens] = useState([WMATIC_TOKEN]);
  // const isZapAble = useCheckZapToken(selectedToken, token0, token1, type);

  const tokenHaveToApprove = find(
    selectedTokens,
    (e) => e.allowance && new BigNumber(e.allowance).isZero()
  );

  // const estimateOutput = useEstimateOutput(
  //   amount,sd
  //   token0,
  //   selectedToken,
  //   reserves,
  //   totalSupplyStakingToken,
  //   token1,
  //   type
  // );

  const onFinishZap = async () => {
    getLpBalance();
    refreshStakeBalance();
  };

  const params = useMemo(() => {
    const protocolType = PROTOCOL_FUNCTION[type].fullnameHash;
    const fromList = selectedTokens.map((e) => e.address);
    const amountList = selectedTokens.map((e) =>
      new BigNumber(e.amount)
        .times(new BigNumber(10).pow(e.decimals))
        .toFixed(0)
    );
    return {
      protocolType,
      from: fromList,
      amount: amountList,
      to: stakingToken,
      receiver: account,
    };
  }, [type, selectedTokens]);

  const [onZap, zapLoading] = useZapCallback(params, onFinishZap);
  const onAddTokens = () => {
    setSelectedTokens((old) => [...old, {}]);
  };

  const onSelectedToken = (token) => {
    setSelectedTokens((old) => {
      old.splice(selectedIndexTokenModal, 1, token);
      return old;
    });
  };

  const removeFromList = (index) => {
    index !== 0 &&
      setSelectedTokens((old) => {
        old.splice(index, 1);
        return [...old];
      });
  };

  const onOpenSelectToken = (index) => {
    setSelectedTokenModal(index);
    setOpenSelectToken(true);
  };

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
          />
        );
      })}
      <AddTokenButton onClick={onAddTokens}>+ Add token</AddTokenButton>
      <ExchangeWrapper>
        <img src="./images/icons/exchange-circle.png" alt="" />
      </ExchangeWrapper>
      <ToLpText>To LP</ToLpText>
      <ToLpCard token0={token0} token1={token1} lpBalance={lpBalance} />
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
          onClick={onZap}
          loading={zapLoading}
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
    </div>
  );
};

export default ZapTab;
