import styled from "styled-components";
import "react-toastify/dist/ReactToastify.css";
import "react-input-range/lib/css/index.css";
import FarmList from "./pages/FarmList";
import 'rc-tooltip/assets/bootstrap.css';

const AppWrapper = styled.div`
  color: white;
  height: 100%;
`;

function App() {

  return (
    <AppWrapper className="App">
      <FarmList/>
      {/*<ConnectButton />*/}
      {/*<InputWrapper>*/}
      {/*  <Select*/}
      {/*    defaultValue={filterKey}*/}
      {/*    isMulti*/}
      {/*    name="colors"*/}
      {/*    options={uniqBy(FilterOptions, "value")}*/}
      {/*    className="basic-multi-select"*/}
      {/*    classNamePrefix="select"*/}
      {/*    openMenuOnClick={false}*/}
      {/*    filterOption={filterOption}*/}
      {/*    onChange={(value) => setFilterKey(value)}*/}
      {/*    selectProps={{ openMenuOnClick: false }}*/}
      {/*    theme={(theme) => ({*/}
      {/*      ...theme,*/}
      {/*      borderRadius: 0,*/}
      {/*      colors: {*/}
      {/*        ...theme.colors,*/}
      {/*        primary25: "hotpink",*/}
      {/*        primary: "black",*/}
      {/*      },*/}
      {/*    })}*/}
      {/*  />*/}
      {/*</InputWrapper>*/}

      {/*<div*/}
      {/*  style={{ textAlign: "center", marginTop: "20px", fontWeight: "bold" }}*/}
      {/*>*/}
      {/*  Total volume 24h: {volume}$*/}
      {/*</div>*/}
      {/*<div style={{ marginTop: "50px" }} className="Table">*/}
      {/*  <Table>*/}
      {/*    <thead>*/}
      {/*      <tr>*/}
      {/*        <th style={{ width: "20%" }} />*/}
      {/*        <th style={{ width: "25%" }}>*/}
      {/*          {renderLabelWithSort("apr", "APR")}*/}
      {/*        </th>*/}
      {/*        <th style={{ width: "10%" }}>*/}
      {/*          {renderLabelWithSort("daily", "Daily")}*/}
      {/*        </th>*/}
      {/*        <th style={{ width: "25%" }}>*/}
      {/*          {renderLabelWithSort("tvl", "TVL")}*/}
      {/*        </th>*/}
      {/*        <th style={{ width: "20%" }} />*/}
      {/*      </tr>*/}
      {/*    </thead>*/}
      {/*    <tbody>*/}
      {/*      <WrappedFarm filterKey={filterKey} />*/}
      {/*    </tbody>*/}
      {/*  </Table>*/}
      {/*</div>*/}
      {/*<ToastContainer />*/}
    </AppWrapper>
  );
}

export default App;
