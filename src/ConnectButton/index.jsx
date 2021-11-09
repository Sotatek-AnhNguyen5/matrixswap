import { useWeb3React } from "@web3-react/core";
import styled from "styled-components";
import { injected } from "../utils/connectors";

const MetamaskConnectButton = styled.button`
  margin-left: auto;
`;

const Wrapper = styled.div`
    display: flex;
    padding: 20px;
    flex-direction: column;
    align-items: flex-end;
`

const ConnectButton = () => {
  const { active, account, library, activate, deactivate, connector } =
    useWeb3React();

  const connect = async () => {
    try {
      activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  };

  return (
    <Wrapper>
      <MetamaskConnectButton onClick={connect}>
        Connect to Metamask
      </MetamaskConnectButton>
      {active ? (
        <span style={{textAlign: "right"}}>
          Connected with <b> {account}</b>
        </span>
      ) : (
        <span>Not connected</span>
      )}
    </Wrapper>
  );
};

export default ConnectButton;
