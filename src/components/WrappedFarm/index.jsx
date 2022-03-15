import { useState, useEffect, useCallback } from "react";
import useSushiFarms from "../../hooks/useSushiFarms";
import styled from "styled-components";
import { FlexRow, ProtocolBadger } from "../../theme/components";
import SearchWrapper from "./SearchWrapper";
import DataTable from "./DataTable";
import useQuickSwapFarms from "../../hooks/useQuickSwapFarms";
import useApeSwapFarms from "../../hooks/useApeswapFarms";

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
  margin-right: 10px;
`;

const BlackLine = styled.div`
  width: 100%;
  height: 2px;
  background-color: #000;
  margin-top: 40px;
  margin-bottom: 40px;
`;

const sortAlpha = (a, b) => {
  const labela = `${a.symbol0} - ${a.symbol1}`;
  const labelb = `${b.symbol0} - ${a.symbol1}`;
  if (labela < labelb) {
    return -1;
  }
  if (labela > labelb) {
    return 1;
  }
  return 0;
};

const WrappedFarm = ({ refetchVolume }) => {
  const [filterKey, setFilterKey] = useState([]);
  const [data, setData] = useState([]);
  const apeSwapFarms = useApeSwapFarms();
  const sushiFarms = useSushiFarms();
  const quickSwapFarms = useQuickSwapFarms();

  useEffect(() => {
    const newData = [...sushiFarms, ...apeSwapFarms, ...quickSwapFarms].sort(
      sortAlpha
    );

    setData((old) => newData);
  }, [sushiFarms, apeSwapFarms, quickSwapFarms]);

  const isActiveFilter = useCallback(
    (key) => {
      return !!filterKey.find((e) => e.value === key);
    },
    [filterKey]
  );

  const toogleFilter = useCallback(
    (key) => {
      const indexKey = filterKey.findIndex((e) => e.value === key);
      if (indexKey !== -1) {
        setFilterKey((old) => {
          const newData = [...old];
          newData.splice(indexKey, 1);
          return newData;
        });
      } else {
        setFilterKey((old) => {
          const newData = [
            ...old,
            {
              value: key,
              label: key,
            },
          ];
          return newData;
        });
      }
    },
    [filterKey]
  );

  return (
    <WrapperFarm>
      <FlexRow>
        <LeftFilter>
          <div className="label">Farming</div>
          <WhiteColumn />
          <ProtocolBadger
            onClick={() => toogleFilter("sushiswap")}
            isActive={isActiveFilter("sushiswap")}
          >
            <img src="./images/protocols/sushiswap.png" alt="" />
            Sushiswap
          </ProtocolBadger>
          <ProtocolBadger
            onClick={() => toogleFilter("quickswap")}
            isActive={isActiveFilter("quickswap")}
          >
            <img src="./images/protocols/quickswap.png" alt="" />
            Quickswap
          </ProtocolBadger>
          <ProtocolBadger
            onClick={() => toogleFilter("apeswap")}
            isActive={isActiveFilter("apeswap")}
          >
            <img src="./images/protocols/apeswap.png" alt="" />
            Apeswap
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
    </WrapperFarm>
  );
};

export default WrappedFarm;
