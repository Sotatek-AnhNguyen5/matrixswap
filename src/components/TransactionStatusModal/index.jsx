import Modal from "react-modal";
import { ActiveButton, FlexRow } from "../../theme/components";
import GreenSpin from "../GreenSpin";
import styled from "styled-components";
import { useCallback, useMemo } from "react";
import { STATUS_ZAP } from "../../hooks/useZapCallback";
import { formatBalance, formatTokenBalance } from "../../utils";

const ActiveTitle = styled(FlexRow)`
  color: ${(props) => props.theme.colorMainGreen};
  font-size: 16px;
`;
const WhiteTitle = styled(FlexRow)`
  font-size: 14px;
  box-sizing: border-box;
  color: #fff;
  font-family: ${(props) =>
    props.isNumber ? "ChakraPetch, sans-serif" : "Ocr-A, serif"};

  a {
    text-decoration: none;
    color: #fff;
    cursor: pointer;

    &:hover {
      color: ${(props) => props.theme.colorMainGreen};
    }
  }
`;

const ExtendMessage = styled(WhiteTitle)`
  max-width: 400px;
`;

const StyledCheck = styled.img`
  width: 80px;
  height: 80px;
`;

const FooterButton = styled(FlexRow)`
  padding: 10px 20px;
  background: #081719;
  border-radius: 0px 0px 26px 26px;
  margin-top: 40px;
  box-sizing: border-box;
`;

const TransactionStatusModal = ({
  isModalOpen,
  setIsModalOpen,
  status,
  txHash,
  estimateOutput,
  token0,
  token1,
  lpAddress,
  isZapIn,
  toTokensZapOut,
  onCloseSubmittedModal,
}) => {
  const closeModal = () => setIsModalOpen(false);

  const onAddLpToWallet = useCallback(async () => {
    try {
      let toMetamaskSymbol = `LP ${token0.symbol}-${token1.symbol}`;
      if (toMetamaskSymbol.length >= 11) {
        toMetamaskSymbol = toMetamaskSymbol.substr(0, 10);
      }

      window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20", // Initially only supports ERC20, but eventually more!
          options: {
            address: lpAddress, // The address that the token is at.
            symbol: toMetamaskSymbol, // A ticker symbol or shorthand, up to 5 chars.
            decimals: 18, // The number of decimals in the token
          },
        },
      });
    } catch (error) {
      console.log(error);
    }
  }, [lpAddress, token0, token1]);

  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "#0A1E20",
      borderRadius: "26px",
      padding:
        STATUS_ZAP.error === status ? "30px 0 0 0" : "30px 30px 60px 30px",
    },
  };

  const messageZapOut = useMemo(() => {
    let message = "";
    toTokensZapOut.forEach(
      (e) =>
        (message += `${formatTokenBalance(e.estimateValue)} ${e.symbol} and `)
    );
    return message.substring(0, message.length - 4);
  }, [toTokensZapOut]);

  const ModalContent = useMemo(() => {
    if (status === STATUS_ZAP.waiting) {
      return (
        <>
          <FlexRow justify="center">
            <GreenSpin width="80px" height="80px" />
          </FlexRow>
          <ActiveTitle justify="center" marginTop="40px">
            Waiting For Confirmation
          </ActiveTitle>
          {isZapIn ? (
            <>
              <WhiteTitle isNumber justify="center" marginTop="20px">
                Zapping tokens for {formatTokenBalance(estimateOutput)} LP
              </WhiteTitle>
            </>
          ) : (
            <>
              <ExtendMessage isNumber justify="center" marginTop="20px">
                Zapping LP for {messageZapOut}
              </ExtendMessage>
            </>
          )}
          <WhiteTitle justify="center" marginTop="20px">
            Confirm transaction on your wallet
          </WhiteTitle>
        </>
      );
    } else if (status === STATUS_ZAP.error) {
      return (
        <>
          <ActiveTitle justify="center">Confirm Zap</ActiveTitle>
          <WhiteTitle justify="center" padding="0 20px" marginTop="20px">
            Transaction rejected!
          </WhiteTitle>
          <FooterButton justify="flex-end">
            <ActiveButton width="100px" onClick={closeModal} label="Close" />
          </FooterButton>
        </>
      );
    } else {
      return (
        <>
          <FlexRow justify="center">
            <StyledCheck src="./images/icons/green-check.png" alt="" />
          </FlexRow>
          <ActiveTitle justify="center" marginTop="40px">
            Transaction Submitted
          </ActiveTitle>
          <WhiteTitle justify="center" marginTop="20px">
            <a target="_blank" href={`https://polygonscan.com/tx/${txHash}`}>
              View on Explorer
            </a>
          </WhiteTitle>
          <WhiteTitle justify="center" marginTop="20px">
            <a onClick={onAddLpToWallet}>
              Add {`LP ${token0.symbol}-${token1.symbol}`} to Metamask
            </a>
          </WhiteTitle>
          <ActiveButton
            label="Close"
            marginTop="40px"
            width="100%"
            onClick={onCloseSubmittedModal}
          />
        </>
      );
    }
  }, [status, estimateOutput, txHash, isZapIn, toTokensZapOut]);

  return (
    <Modal
      isOpen={isModalOpen}
      style={customStyles}
      contentLabel="Select token"
      ariaHideApp={false}
      onAfterOpen={() => (document.body.style.overflow = "hidden")}
      onAfterClose={() => (document.body.style.overflow = "unset")}
    >
      {ModalContent}
    </Modal>
  );
};

export default TransactionStatusModal;
