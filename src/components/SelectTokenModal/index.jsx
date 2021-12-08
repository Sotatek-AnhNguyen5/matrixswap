import styled from "styled-components";
import { useMemo, useState } from "react";
import Modal from "react-modal";
import DefaultToken from "../../json/defaultTokens.json";
import { startsWith } from "lodash";
import useListTokenWithBalance from "../../hooks/useListTokenWithBalance";
import { FlexRow, GridContainer } from "../../theme/components";
import TokenLogo from "../TokenLogo";
import {
  DAI_TOKEN,
  PBNB_TOKEN,
  USDT_TOKEN,
  WETH_TOKEN,
  WMATIC_TOKEN,
} from "../../const";

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 20px;

  input {
    padding: 20px;
    box-sizing: border-box;
    background-color: #0a1b1e;
    font-size: 24px;
    outline: 0;
    box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.25);
    border-radius: 12px;
    color: white;
    font-weight: 500;
    border: 0;
    width: 100%;

    &::placeholder {
      color: #79878c;
    }
  }
`;

const TokenRow = styled.div`
  margin-top: 5px;
  display: ${(props) => (props.isShow ? "flex" : "none")};
  align-items: center;
  flex-flow: column;
  cursor: pointer;
  color: white;

  .token-item {
    box-sizing: border-box;
    border-radius: 6px;
    padding: 8px 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .token-logo {
      display: flex;
      align-items: center;

      img {
        border-radius: 50%;
        width: 20px;
        height: 20px;
      }

      span {
        margin-left: 10px;
        font-weight: 500;
      }
    }

    &:hover {
      background-color: #161a24;
    }
  }
`;

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

const BlackLine = styled.div`
  background-color: #010304;
  width: 100%;
  height: 2px;
  margin-top: 20px;
  margin-bottom: 20px;
`;

const CommonBaseItem = styled.div`
  display: flex;
  padding: 10px 15px;
  align-items: center;
  color: #fff;
  border-radius: 71px;
  opacity: 0.88;
  background-color: ${(props) => props.theme.colorDarkerGray};
  font-weight: 400;
  font-size: 24px;
  cursor: pointer;

  img {
    margin-right: 10px;
    width: 32px;
    height: 32px;
  }

  &:hover {
    background-color: #356468;
  }
`;

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#0C2225",
    borderRadius: "26px",
    width: "550px",
    height: "700",
    padding: 0,
  },
};

const CommonBaseList = [
  WMATIC_TOKEN,
  WETH_TOKEN,
  USDT_TOKEN,
  DAI_TOKEN,
  PBNB_TOKEN,
];

const SelectTokenModal = ({
  onSetSelectedToken,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [filterKey, setFilterKey] = useState();
  const closeModal = () => setIsModalOpen(false);

  const onSelectToken = (token) => {
    onSetSelectedToken(token);
    closeModal();
  };

  const listToken = useMemo(() => {
    return DefaultToken.tokens.filter((e) => e.chainId === 137);
  }, []);

  const listTokenWithBalance = useListTokenWithBalance(listToken);

  return (
    <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Select token"
      ariaHideApp={false}
    >
      <ModalHeader>
        <span>Select a token</span>
        <img onClick={closeModal} src="./images/icons/close.png" alt="" />
      </ModalHeader>
      <ModalContent>
        <div className="title-content">Common base</div>
        <GridContainer
          width="80%"
          gridGap="20px 30px"
          marginTop="20px"
          templateColumns="auto auto auto"
        >
          {CommonBaseList.map((e) => (
            <CommonBaseItem onClick={() => onSelectToken(e)} key={e.address}>
              <TokenLogo symbol={e.symbol} />
              {e.symbol}
            </CommonBaseItem>
          ))}
        </GridContainer>
        <BlackLine />
        <div className="title-content">Search for a token</div>
        <InputWrapper>
          <input
            onChange={(e) => setFilterKey(e.target.value)}
            placeholder="By Name Or Address"
            type="text"
          />
        </InputWrapper>
        <div style={{ marginTop: "20px", height: "200px", overflow: "auto" }}>
          {listTokenWithBalance.map((e) => {
            return (
              <TokenRow
                isShow={
                  startsWith(e.name, filterKey) ||
                  startsWith(e.symbol, filterKey) ||
                  !filterKey
                }
                onClick={() => onSelectToken(e)}
                key={e.address}
              >
                <div className="token-item">
                  <div className="token-logo">
                    <img src={e.logoURI} alt="" />
                    <span>{e.symbol}</span>
                  </div>
                  <div className="token-name">{e.balance}</div>
                </div>
              </TokenRow>
            );
          })}
        </div>
      </ModalContent>
    </Modal>
  );
};

export default SelectTokenModal;