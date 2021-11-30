import { useWeb3React } from "@web3-react/core";
import ABI from "../../abi/QuickSwapStakingInfoABI.json";
import { DEFAULT_PAIR, QUICKSWAP_STAKINGINFO_ADDRESS } from "../../const";
import { useState, useEffect } from "react";
import { isEmpty, take, takeWhile } from "lodash";
import useSushiFarms from "../../hooks/useSushiFarms";
import useApeSwapFarms from "../../hooks/useApeswapFarms";
import TableRecord from "../WrappedTableRecords";
import useQuickSwapFarms from "../../hooks/useQuickSwapFarms";

const WrappedFarm = ({ filterKey }) => {
  const [data, setData] = useState([]);
  const sushiFarms = useSushiFarms();
  const apeSwapFarms = useApeSwapFarms();
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
    <>
      {data.map((e, index) => {
        return (
          <TableRecord
            key={index}
            filterKey={filterKey}
            data={e}
            type={e.appId}
          />
        );
      })}
    </>
  );
};

export default WrappedFarm;
