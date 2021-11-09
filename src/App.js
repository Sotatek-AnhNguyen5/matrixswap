import styled from "styled-components";
import ConnectButton from "./ConnectButton";
import WrappedFarm from "./components/WrappedFarm";
import { Web3ReactProvider } from "@web3-react/core";
import { getLibrary } from "./utils";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";

const Table = styled.table`
  width: 80%;
  margin-left: auto;
  border-spacing: 0px;
  border-collapse: separate;
  border-spacing: 0 15px;
  th {
    color: #656565;
  }
`;

const AppWrapper = styled.div`
  background-color: black;
  min-height: 100vh;
  color: white;
`;

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <AppWrapper className="App">
        <ConnectButton />
        <div style={{ marginTop: "50px" }} className="Table">
          <Table>
            <thead>
              <tr>
                <th style={{ width: "30%" }}></th>
                <th style={{ width: "30%" }}>APR</th>
                <th style={{ width: "15%" }}>Daily</th>
                <th style={{ width: "15%" }}>TLV</th>
                <th style={{ width: "10%" }}></th>
              </tr>
            </thead>
            <tbody>
              <WrappedFarm />
            </tbody>
          </Table>
        </div>
        <ToastContainer />
      </AppWrapper>
    </Web3ReactProvider>
  );
}

export default App;
