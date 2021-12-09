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
  min-height: 600px;
  margin-top: 50px;
  padding: 20px 40px;
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

const WrappedFarm = ({ refetchVolume }) => {
  const [filterKey, setFilterKey] = useState([]);
  const [data, setData] = useState([]);
  const apeSwapFarms = useApeSwapFarms();
  const sushiFarms = useSushiFarms();
  const quickSwapFarms = useQuickSwapFarms();

  useEffect(() => {
    if (
      !isEmpty(apeSwapFarms) &&
      !isEmpty(sushiFarms) &&
      !isEmpty(quickSwapFarms)
    ) {
      setData((old) => [...apeSwapFarms, ...sushiFarms, ...quickSwapFarms]);
    }
  }, [apeSwapFarms, sushiFarms, quickSwapFarms]);

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
      <DataTable
        refetchVolume={refetchVolume}
        data={data}
        setData={setData}
        filterKey={filterKey}
      />
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
