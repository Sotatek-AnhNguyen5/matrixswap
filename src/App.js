import styled from "styled-components";
import ConnectButton from "./components/ConnectButton";
import WrappedFarm from "./components/WrappedFarm";
import "react-toastify/dist/ReactToastify.css";
import "react-input-range/lib/css/index.css";
import { ToastContainer } from "react-toastify";
import { useState } from "react";
import Select from "react-select";
import { uniqBy } from "lodash";
import useVolume24h from "./hooks/useVolume24h";

const Table = styled.table`
  width: 80%;
  margin-left: auto;
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
  { value: "quickswap", label: "QuickSwap" },
  { value: "sushiswap", label: "SushiSwap" },
  { value: "apeswap", label: "Apeswap" },
];

const filterOption = (candidate, input) => {
  return (
    (candidate.data.__isNew__ ||
      candidate.label.toLowerCase().includes(input.toLowerCase())) &&
    input
  );
};

function App() {
  const [filterKey, setFilterKey] = useState([]);
  const [optionsFilter, setOptionFilter] = useState([]);
  const volume = useVolume24h();

  return (
    <AppWrapper className="App">
      <ConnectButton />
      <InputWrapper>
        <Select
          defaultValue={filterKey}
          isMulti
          name="colors"
          options={uniqBy([...optionsFilter, ...options], "value")}
          className="basic-multi-select"
          classNamePrefix="select"
          openMenuOnClick={false}
          filterOption={filterOption}
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

      <div
        style={{ textAlign: "center", marginTop: "20px", fontWeight: "bold" }}
      >
        Total volume 24h: {volume}$
      </div>
      <div style={{ marginTop: "50px" }} className="Table">
        <Table>
          <thead>
            <tr>
              <th style={{ width: "20%" }} />
              <th style={{ width: "25%" }}>APR</th>
              <th style={{ width: "10%" }}>Daily</th>
              <th style={{ width: "25%" }}>TVL</th>
              <th style={{ width: "20%" }} />
            </tr>
          </thead>
          <tbody>
            <WrappedFarm
              setOptionFilter={setOptionFilter}
              filterKey={filterKey}
            />
          </tbody>
        </Table>
      </div>
      <ToastContainer />
    </AppWrapper>
  );
}

export default App;
