import Modal from "react-modal";
import styled from "styled-components";
import { ActiveButton, FlexRow } from "../../theme/components";
import TokenLogo from "../TokenLogo";
import { useMemo, useState } from "react";
import BigNumber from "bignumber.js";

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
    width: "650px",
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
    font-size: 36px;
  }

  img {
    width: 30px;
    height: 30px;
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
  img {
    &:first-of-type {
      position: relative;
      z-index: 1;
      margin-right: -15px;
    }
  }
`;

const SmallWhiteText = styled.span`
  font-size: 24px;
  color: #fff;
`;

const SmallerGrayText = styled.span`
  font-size: 18px;
  color: ${(props) => props.theme.colorGray};
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
  font-size: 18px;
  margin-right: auto;
`;

const GrayRightText = styled.div`
  display: flex;
  text-align: right;
  font-size: 16px;
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
  token0,
  token1,
  estimateOutput,
  onZap,
  zapLoading,
  isZapIn,
  toTokensZapOut,
}) => {
  const closeModal = () => setIsModalOpen(false);
  const [isRevert, setIsRevert] = useState(false);

  const onConfirm = () => {
    onZap();
    closeModal();
  };

  const lpTokenLabel = useMemo(() => {
    return `LP ${token0.symbol}-${token1.symbol}`;
  }, [token0, token1]);

  const conversionRateRow = (element) => {
    if (isRevert) {
      const rate = new BigNumber(element.estimateOutput)
        .div(element.amount)
        .toFixed(8);
      return (
        <span key={element.address}>
          1 {element.symbol} - {rate} {lpTokenLabel}
        </span>
      );
    } else {
      const rate = new BigNumber(element.amount)
        .div(element.estimateOutput)
        .toFixed(8);
      return (
        <span key={element.address}>
          1 {lpTokenLabel} - {rate} {element.symbol}
        </span>
      );
    }
  };

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
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
                  <SmallWhiteText>{e.amount}</SmallWhiteText>
                  <SmallerGrayText>{e.usdtAmount} $</SmallerGrayText>
                </RightTokenWrapper>
              </TokenCard>
            ))}
            <FlexRow justify="center" marginTop="40px">
              <img src="./images/icons/down.png" alt="" />
            </FlexRow>
            <TokenCard marginTop="40px">
              <LeftTokenWrapper>
                <DoubleLogoWrapper>
                  <TokenLogo symbol={token0.symbol} />
                  <TokenLogo symbol={token1.symbol} />
                </DoubleLogoWrapper>
              </LeftTokenWrapper>
              <RightTokenWrapper>
                <SmallWhiteText>{estimateOutput}</SmallWhiteText>
              </RightTokenWrapper>
            </TokenCard>
          </>
        ) : (
          <>
            <TokenCard>
              <LeftTokenWrapper>
                <DoubleLogoWrapper>
                  <TokenLogo symbol={token0.symbol} />
                  <TokenLogo symbol={token1.symbol} />
                </DoubleLogoWrapper>
              </LeftTokenWrapper>
              <RightTokenWrapper>
                <SmallWhiteText>{fromTokenList[0].amount}</SmallWhiteText>
              </RightTokenWrapper>
            </TokenCard>
            <FlexRow justify="center" marginTop="40px">
              <img src="./images/icons/down.png" alt="" />
            </FlexRow>
            {toTokensZapOut.map((e, index) => (
              <TokenCard key={index}>
                <LeftTokenWrapper>
                  <TokenLogo symbol={e.symbol} />
                  <SmallWhiteText>{e.symbol}</SmallWhiteText>
                </LeftTokenWrapper>
                <RightTokenWrapper>
                  <SmallWhiteText>{e.amount}</SmallWhiteText>
                  <SmallerGrayText>{e.usdtAmount} $</SmallerGrayText>
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
            {isZapIn ? <FlexRow flexFlow="column">
              {fromTokenList.map((e) => conversionRateRow(e))}
            </FlexRow> : <FlexRow flexFlow="column">
              {toTokensZapOut.map((e) => conversionRateRow(e))}
            </FlexRow>}

          </GrayRightText>
        </FlexRow>
        <FlexRow marginTop="20px">
          <GrayText>Transaction Cost</GrayText>
          <GrayRightText>0 WATIC</GrayRightText>
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
