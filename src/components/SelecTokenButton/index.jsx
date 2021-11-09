import styled from "styled-components";
import { FaAngleDown, FaSearch } from "react-icons/fa";
import { useState } from "react";
import Modal from "react-modal";
import DefaultToken from "../../json/defaultTokens.json";

const ButtonSelect = styled.button`
  display: flex;
  padding: 5px 10px;
  align-items: center;
  justify-content: center;
  width: 100px;
  border-radius: 6px;
  border: 0;
  cursor: pointer;
  font-weight: 500;
  img {
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }
  svg {
    margin-left: 10px;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  svg {
    margin-right: -25px;
    color: gray;
    z-index: 2;
    position: relative;
  }
  input {
    padding: 10px 20px 10px 30px;
    box-sizing: border-box;
    background-color: #060a10;
    outline: 0;
    color: white;
    font-weight: 500;
    border-radius: 10px;
    border: 0;
    width: 100%;
  }
`;

const TokenRow = styled.div`
  margin-top: 5px;
  display: flex;
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

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#1F2633",
    borderRadius: "10px",
  },
};

const SelectTokenButton = ({onSetSelectedToken}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState({});
  const [filterKey, setFilterKey] = useState();
  const closeModal = () => setIsModalOpen(false);

  const onSelectToken = (token) => {
    setSelectedToken(token);
    closeModal();
    onSetSelectedToken(token)
  }

  return (
    <>
      <ButtonSelect onClick={() => setIsModalOpen(true)}>
        <img src={selectedToken.logoURI} alt="" />
        {selectedToken.symbol}
        {<FaAngleDown />}
      </ButtonSelect>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Select token"
        ariaHideApp={false}
      >
        <InputWrapper>
          <FaSearch />
          <input onChange={e => setFilterKey(e.target.value)} placeholder='Try "DAI"' type="text" />
        </InputWrapper>
        <div style={{ marginTop: "20px", height: "450px", overflow: "auto" }}>
          {DefaultToken.tokens.filter(e => e.chainId === 137).filter(e => e.name.startsWith(filterKey) || !filterKey).map((e) => {
            return (
              <TokenRow onClick={() => onSelectToken(e)} key={e.address}>
                <div className="token-item">
                  <div className="token-logo">
                    <img src={e.logoURI} alt="" />
                    <span>{e.symbol}</span>
                  </div>
                  <div className="token-name">{e.name}</div>
                </div>
              </TokenRow>
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default SelectTokenButton;
