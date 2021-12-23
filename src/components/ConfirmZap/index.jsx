import Modal from "react-modal";
import styled from "styled-components";
import { ActiveButton, FlexRow } from "../../theme/components";
import TokenLogo from "../TokenLogo";
import { useMemo, useState } from "react";
import BigNumber from "bignumber.js";
import { formatCurrency } from "../../utils";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#0D2528",
    borderRadius: "26px",
    width: "520px",
    padding: 0,
  },
};

const ModalHeader = styled.div`
  text-align: center;
  background-color: #0a1e20;
  padding: 15px;
  position: relative;

  span {
    color: #fff;
    font-size: 24px;
  }

  img {
    width: 14px;
    height: 14px;
    right: 20px;
    cursor: pointer;
    position: absolute;
  }
`;

const ModalContent = styled.div`
  padding: 20px 30px 40px 30px;

  .title-content {
    font-size: 24px;
    color: #fff;
  }
`;

const TokenCard = styled(FlexRow)`
  padding: 10px;
  background: linear-gradient(89.83deg, #172b2e 4.19%, #183034 97.77%);
  border-radius: 18px;
  margin-top: 20px;
`;

const DoubleLogoWrapper = styled.div`
  white-space: nowrap;

  img {
    &:first-of-type {
      position: relative;
      z-index: 1;
      margin-right: -15px;
    }
  }
`;

const SmallWhiteText = styled.span`
  font-size: 14px;
  color: #fff;
  margin-left: ${(props) => props.ml ?? "30px"};
  font-family: ${(props) =>
    props.isNumber ? "ChakraPetch, sans-serif" : "Ocr-A, serif"};
`;

const SmallerGrayText = styled.span`
  font-size: 14px;
  color: ${(props) => props.theme.colorGray};
  font-family: ChakraPetch, sans-serif;
`;

const LeftTokenWrapper = styled.div`
  display: flex;
  align-items: center;

  img {
    width: 40px;
    height: 40px;
  }

  span {
    margin-left: 30px;
  }
`;

const GrayText = styled.div`
  color: #3f7178;
  font-size: 14px;
  margin-right: auto;
`;

const NumberSpan = styled.span`
  font-family: ChakraPetch, sans-serif;
  font-size: 14px;
`;

const GrayRightText = styled.div`
  display: flex;
  text-align: right;
  font-family: ChakraPetch, sans-serif;
  font-size: 14px;
  color: #51909a;
  margin-left: auto;
  margin-top: ${(props) => props.marginTop ?? "0"};

  img {
    width: 15px;
    height: 20px;
    margin-right: 20px;
    cursor: pointer;
    margin-top: 4px;
  }
`;

const RightTokenWrapper = styled.div`
  text-align: right;
  display: flex;
  flex-flow: column;
`;

const ConfirmZap = ({
  isModalOpen,
  setIsModalOpen,
  fromTokenList,
  symbol0,
  symbol1,
  estimateOutput,
  onZap,
  zapLoading,
  isZapIn,
  toTokensZapOut,
  totalTxCost,
}) => {
  const closeModal = () => setIsModalOpen(false);
  const [isRevert, setIsRevert] = useState(false);

  const onConfirm = () => {
    onZap();
    closeModal();
  };

  const lpTokenLabel = useMemo(() => {
    return `LP ${symbol0}-${symbol1}`;
  }, [symbol0, symbol1]);

  const conversionRateRow = (element) => {
    if (isRevert) {
      const rate = new BigNumber(element.estimateOutput)
        .div(element.amount)
        .toFixed(8);
      return (
        <NumberSpan key={element.address}>
          1 {element.symbol} = {rate} {lpTokenLabel}
        </NumberSpan>
      );
    } else {
      const rate = new BigNumber(element.amount)
        .div(element.estimateOutput)
        .toFixed(8);
      return (
        <NumberSpan key={element.address}>
          1 {lpTokenLabel} = {rate} {element.symbol}
        </NumberSpan>
      );
    }
  };

  const conversionRateRowZapOut = (element) => {
    if (isRevert) {
      const rate = new BigNumber(element.amount)
        .div(element.estimateValue)
        .toFixed(8);
      return (
        <NumberSpan key={element.address}>
          1 {element.symbol} = {rate} {lpTokenLabel}
        </NumberSpan>
      );
    } else {
      const rate = new BigNumber(element.estimateValue)
        .div(element.amount)
        .toFixed(8);
      return (
        <NumberSpan key={element.address}>
          1 {lpTokenLabel} = {rate} {element.symbol}
        </NumberSpan>
      );
    }
  };
  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      onAfterOpen={() => (document.body.style.overflow = "hidden")}
      onAfterClose={() => (document.body.style.overflow = "unset")}
      style={customStyles}
      contentLabel="Select token"
      ariaHideApp={false}
    >
      <ModalHeader>
        <span>Confirm Zap</span>
        <img onClick={closeModal} src="./images/icons/close.png" alt="" />
      </ModalHeader>
      <ModalContent>
        {isZapIn ? (
          <>
            {fromTokenList.map((e, index) => (
              <TokenCard key={index}>
                <LeftTokenWrapper>
                  <TokenLogo symbol={e.symbol} />
                  <SmallWhiteText>{e.symbol}</SmallWhiteText>
                </LeftTokenWrapper>
                <RightTokenWrapper>
                  <SmallWhiteText isNumber>{e.amount}</SmallWhiteText>
                  <SmallerGrayText>
                    {formatCurrency(e.usdtAmount, 2)} $
                  </SmallerGrayText>
                </RightTokenWrapper>
              </TokenCard>
            ))}
            <FlexRow justify="center" marginTop="40px">
              <img src="./images/icons/down.png" alt="" />
            </FlexRow>
            <TokenCard marginTop="40px">
              <LeftTokenWrapper>
                <DoubleLogoWrapper>
                  <TokenLogo symbol={symbol0} />
                  <TokenLogo symbol={symbol1} />
                </DoubleLogoWrapper>
                <SmallWhiteText ml="5px !important">
                  LP {symbol0} - {symbol1}
                </SmallWhiteText>
              </LeftTokenWrapper>
              <RightTokenWrapper>
                <SmallWhiteText isNumber>{estimateOutput}</SmallWhiteText>
              </RightTokenWrapper>
            </TokenCard>
          </>
        ) : (
          <>
            <TokenCard>
              <LeftTokenWrapper>
                <DoubleLogoWrapper>
                  <TokenLogo symbol={symbol0} />
                  <TokenLogo symbol={symbol1} />
                </DoubleLogoWrapper>
                <SmallWhiteText isNumber>
                  {fromTokenList[0].symbol}
                </SmallWhiteText>
              </LeftTokenWrapper>
              <RightTokenWrapper>
                <SmallWhiteText isNumber>
                  {fromTokenList[0].amount}
                </SmallWhiteText>
                <SmallerGrayText>
                  {formatCurrency(fromTokenList[0].usdtAmount, 2)} $
                </SmallerGrayText>
              </RightTokenWrapper>
            </TokenCard>
            <FlexRow justify="center" marginTop="40px">
              <img src="./images/icons/down.png" alt="" />
            </FlexRow>
            {toTokensZapOut.map((e, index) => (
              <TokenCard key={`${e.address}-${index}`}>
                <LeftTokenWrapper>
                  <TokenLogo symbol={e.symbol} />
                  <SmallWhiteText>{e.symbol}</SmallWhiteText>
                </LeftTokenWrapper>
                <RightTokenWrapper>
                  <SmallWhiteText isNumber>{e.estimateValue}</SmallWhiteText>
                  <SmallerGrayText isNumber>
                    {formatCurrency(e.usdtAmount, 2)} $
                  </SmallerGrayText>
                </RightTokenWrapper>
              </TokenCard>
            ))}
          </>
        )}

        <FlexRow flexFlow="column" marginTop="40px">
          <GrayText>Conversion Rate</GrayText>
          <GrayRightText marginTop="20px">
            <img
              onClick={() => setIsRevert((old) => !old)}
              src="./images/icons/gray-vertical-exchange.png"
              alt=""
            />
            {isZapIn ? (
              <FlexRow flexFlow="column">
                {fromTokenList.map((e) => conversionRateRow(e))}
              </FlexRow>
            ) : (
              <FlexRow flexFlow="column">
                {toTokensZapOut.map((e) => conversionRateRowZapOut(e))}
              </FlexRow>
            )}
          </GrayRightText>
        </FlexRow>
        <FlexRow marginTop="20px">
          <GrayText>Transaction Cost</GrayText>
          <GrayRightText>{formatCurrency(totalTxCost, 8)} WMATIC</GrayRightText>
        </FlexRow>
        <ActiveButton
          marginTop="40px"
          label="Confirm Zap"
          labelLoading="Zapping"
          loading={zapLoading}
          onClick={onConfirm}
        />
      </ModalContent>
    </Modal>
  );
};

export default ConfirmZap;
