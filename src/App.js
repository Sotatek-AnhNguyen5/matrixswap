import styled from "styled-components";
import ConnectButton from "./components/ConnectButton";
import WrappedFarm from "./components/WrappedFarm";
import { Web3ReactProvider } from "@web3-react/core";
import { getLibrary } from "./utils";
import "react-toastify/dist/ReactToastify.css";
import "react-input-range/lib/css/index.css";
import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";
import Select from "react-select";

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

const options = [
  { value: "quick", label: "QuickSwap" },
  { value: "sushi", label: "SushiSwap" },
  { value: "wbtc", label: "WBTC" },
  { value: "weth", label: "WETH" },
  { value: "usdc", label: "USDC" },
  { value: "usdt", label: "USDT" },
  { value: "link", label: "LINK" },
  { value: "aave", label: "AAVE" },
  { value: "quick", label: "QUICK" },
  { value: "dai", label: "DAI" },
  { value: "wmatic", label: "WMATIC" },
];

function App() {
  const [filterKey, setFilterKey] = useState([]);
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <AppWrapper className="App">
        <ConnectButton />
        <InputWrapper>
          <Select
            defaultValue={filterKey}
            isMulti
            name="colors"
            options={options}
            className="basic-multi-select"
            classNamePrefix="select"
            openMenuOnClick={false}
            onChange={(value) => setFilterKey(value)}
            selectProps={{ openMenuOnClick: false }}
            theme={(theme) => ({
              ...theme,
              borderRadius: 0,
              colors: {
                ...theme.colors,
                primary25: "hotpink",
                primary: "black",
              },
            })}
          />
        </InputWrapper>
        <div style={{ marginTop: "50px" }} className="Table">
          <Table>
            <thead>
              <tr>
                <th style={{ width: "20%" }}/>
                <th style={{ width: "25%" }}>APR</th>
                <th style={{ width: "10%" }}>Daily</th>
                <th style={{ width: "25%" }}>TVL</th>
                <th style={{ width: "20%" }}/>
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
