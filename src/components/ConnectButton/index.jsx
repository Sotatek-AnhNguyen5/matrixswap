import { useWeb3React } from "@web3-react/core";
import { useEffect, useMemo } from "react";
import styled from "styled-components";
import { injected } from "../../utils/connectors";

const MetamaskConnectButton = styled.button`
  margin-left: auto;
`;

const AddressLabel = styled.div`
  font-weight: 500;
  color: white;
  background-color: #3ee046;
  padding: 10px 20px;
  border-radius: 10px;
  min-width: 250px;
  text-align: center;
  letter-spacing: 1px;
`;

const Wrapper = styled.div`
  display: flex;
  padding: 20px;
  flex-direction: column;
  align-items: flex-end;
`;

const ConnectButton = () => {
  const { active, account, activate } = useWeb3React();

  const connect = async () => {
    try {
      activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  };

  const shortcutAddress = useMemo(() => {
    if (account) {
      const firstPart = account.substring(1, 10);
      const endPart = account.substring(account.length - 10, account.length);
      return `${firstPart}.......${endPart}`;
    }
    return ""
  }, [account]);

  useEffect(() => {
    connect();
  }, []);

  return (
    <Wrapper>
      {!active && (
        <MetamaskConnectButton onClick={connect}>
          Connect to Metamask
        </MetamaskConnectButton>
      )}
      {active ? (
        <span style={{ textAlign: "right" }}>
          <AddressLabel> {shortcutAddress}</AddressLabel>
        </span>
      ) : (
        <span>Not connected</span>
      )}
    </Wrapper>
  );
};

export default ConnectButton;
