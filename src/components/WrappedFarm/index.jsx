import { useState, useEffect } from "react";
import { isEmpty, take, takeWhile, uniqBy } from "lodash";
import useSushiFarms from "../../hooks/useSushiFarms";
import useApeSwapFarms from "../../hooks/useApeswapFarms";
import useQuickSwapFarms from "../../hooks/useQuickSwapFarms";
import styled from "styled-components";
import { FlexRow, ProtocolBadger } from "../../theme/components";
import SearchWrapper from "./SearchWrapper";
import DataTable from "./DataTable";

const WrapperFarm = styled.div`
  background: radial-gradient(
    44.18% 217.01% at 50.03% 50%,
    #0c1615 0%,
    #08171a 100%
  );
  box-shadow: 0px 20px 21px rgba(0, 0, 0, 0.25);
  border-radius: 47px;
  min-height: 200px;
  margin-top: 50px;
  padding: 20px 40px;
  overflow: auto;
  height: 600px;
`;

const LeftFilter = styled.div`
  display: flex;
  align-items: center;

  .label {
    font-size: 36px;
    font-weight: 400;
  }
`;

const WhiteColumn = styled.div`
  height: 30px;
  width: 2px;
  background-color: ${(props) => props.theme.colorGray};
  margin-left: 20px;
`;

const BlackLine = styled.div`
  width: 100%;
  height: 2px;
  background-color: #000;
  margin-top: 40px;
  margin-bottom: 40px;
`;

const WrappedFarm = ({}) => {
  const [filterKey, setFilterKey] = useState([]);
  const [data, setData] = useState([]);
  const apeSwapFarms = useApeSwapFarms();
  const sushiFarms = useSushiFarms();
  const quickSwapFarms = useQuickSwapFarms();

  useEffect(() => {
    if (!isEmpty(quickSwapFarms)) {
      setData((old) => [...old, ...quickSwapFarms]);
    }
  }, [quickSwapFarms]);

  useEffect(() => {
    if (!isEmpty(sushiFarms)) {
      setData((old) => [...old, ...sushiFarms]);
    }
  }, [sushiFarms]);

  useEffect(() => {
    if (!isEmpty(apeSwapFarms)) {
      setData((old) => [...old, ...apeSwapFarms]);
    }
  }, [apeSwapFarms]);

  return (
    <WrapperFarm>
      <FlexRow>
        <LeftFilter>
          <div className="label">Farming</div>
          <WhiteColumn />
          <ProtocolBadger>
            <img src="./images/protocols/sushiswap.png" alt="" />
            Sushiswap
          </ProtocolBadger>
          <ProtocolBadger>
            <img src="./images/protocols/quickswap.png" alt="" />
            Quickswap
          </ProtocolBadger>
          <ProtocolBadger>
            <img src="./images/protocols/apeswap.png" alt="" />
            Apeswap
          </ProtocolBadger>
          <ProtocolBadger>
            <img src="./images/protocols/curve.png" alt="" />
            Curve
          </ProtocolBadger>
        </LeftFilter>
        <SearchWrapper filterKey={filterKey} onChange={setFilterKey} />
      </FlexRow>
      <BlackLine />
      <DataTable data={data} />
      {/*{data.map((e, index) => {*/}
      {/*  return (*/}
      {/*    <TableRecord*/}
      {/*      key={index}*/}
      {/*      filterKey={filterKey}*/}
      {/*      data={e}*/}
      {/*      type={e.appId}*/}
      {/*    />*/}
      {/*  );*/}
      {/*})}*/}
    </WrapperFarm>
  );
};

export default WrappedFarm;
