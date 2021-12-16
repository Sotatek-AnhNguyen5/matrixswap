import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useMemo } from "react";
import styled, { useTheme } from "styled-components";
import { injected, supportedChainIds } from "../../utils/connectors";

const AddressLabel = styled.div`
  font-weight: 400;
  font-size: 16px;
  margin-top: 10px;
  color: #ffffff;
  letter-spacing: 1px;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 220px;
  font-size: 16px;
  line-height: 19px;
  min-height: 70px;
  background: ${(props) =>
    props.isWrongNetWork
      ? 'linear-gradient(0deg, rgba(254, 5, 5, 0.5), rgba(254, 5, 5, 0.5)),url("./images/bg-connect-button-danger.png")'
      : 'linear-gradient(0deg, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url("./images/bg-connect-button.png")'};
  background-size: cover;
  border: 1px solid #30b438;
  box-sizing: border-box;
  border-radius: 51px;
  cursor: pointer;
`;

const ConnectButton = () => {
  const { active, account, activate, error } = useWeb3React();
  const theme = useTheme();

  const connect = useCallback(() => {
    try {
      activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  }, [activate]);

  const shortcutAddress = useMemo(() => {
    if (account) {
      const firstPart = account.substring(0, 6);
      const endPart = account.substring(account.length - 3, account.length);
      return `${firstPart}.......${endPart}`;
    }
    return "";
  }, [account]);

  // useEffect(() => {
  //   connect();
  // }, [connect]);

  const isWrongNetWork = useMemo(() => {
    return error && error.name === "UnsupportedChainIdError";
  }, [error]);

  console.log(isWrongNetWork)
  console.log(error)

  return (
    <Wrapper onClick={connect} isWrongNetWork={isWrongNetWork}>
      {active ? (
        <span style={{ textAlign: "left", color: theme.colorMainGreen }}>
          Polygon wallet
          <AddressLabel> {shortcutAddress}</AddressLabel>
        </span>
      ) : isWrongNetWork ? (
        "Wrong Network"
      ) : (
        "Connect to a wallet"
      )}
    </Wrapper>
  );
};

export default ConnectButton;
