import styled from "styled-components";
import ConnectButton from "./components/ConnectButton";
import WrappedFarm from "./components/WrappedFarm";
import { Web3ReactProvider } from "@web3-react/core";
import { getLibrary } from "./utils";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";

const Table = styled.table`
  width: 80%;
  margin-left: auto;
  border-spacing: 0px;
  border-collapse: separate;
  border-spacing: 0 15px;
  th {
    color: #656565;
  }
  thead {
    tr {
      border: 1px solid white;
    }
  }
`;

const AppWrapper = styled.div`
  background-color: black;
  min-height: 100vh;
  color: white;
`;

const InputWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;

  button {
    margin-left: -120px;
  }

  input {
    box-sizing: border-box;
    margin-left: auto;
    width: 80%;
    border-radius: 6px;
    padding: 15px 20px;
    font-size: 20px;
    border: solid 1px white;
    background-color: #333333;
    color: ${(props) => props.color ?? "white"};
    font-weight: 500;
    &:focus {
      outline: 0;
    }
  }
`;

function App() {
  const [filterKey, setFilterKey] = useState();
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <AppWrapper className="App">
        <ConnectButton />
        <InputWrapper>
          <input
            value={filterKey}
            onChange={(e) => setFilterKey(e.target.value)}
            type="text"
            placeholder="search"
          />
        </InputWrapper>
        <div style={{ marginTop: "50px" }} className="Table">
          <Table>
            <thead>
              <tr>
                <th style={{ width: "20%" }}></th>
                <th style={{ width: "25%" }}>APR</th>
                <th style={{ width: "10%" }}>Daily</th>
                <th style={{ width: "25%" }}>TVL</th>
                <th style={{ width: "20%" }}></th>
              </tr>
            </thead>
            <tbody>
              <WrappedFarm filterKey={filterKey} />
            </tbody>
          </Table>
        </div>
        <ToastContainer />
      </AppWrapper>
    </Web3ReactProvider>
  );
}

export default App;
