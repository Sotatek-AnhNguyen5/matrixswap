import { useWeb3React } from "@web3-react/core";
import ABI from "../../abi/factoryABI.json";
import { FACTORY_ADDRESS } from "../../utils";
import { DEFAULT_PAIR } from "../../const";
import { useState, useEffect } from "react";
import { isEmpty, take, takeWhile } from "lodash";
import useSushiFarms from "../../hooks/useSushiFarms";
import useApeSwapFarms from "../../hooks/useApeswapFarms";
import TableRecord from "../WrappedTableRecords";

const WrappedFarm = ({ filterKey, setOptionFilter }) => {
  const { library, active } = useWeb3React();
  const [data, setData] = useState([]);
  const sushiFarms = useSushiFarms();
  const apeSwapFarms = useApeSwapFarms();

  useEffect(() => {
    const getData = async () => {
      const factoryContract = new library.eth.Contract(ABI, FACTORY_ADDRESS);
      const allData = [];
      for (let pair of DEFAULT_PAIR) {
        allData.push(
          factoryContract.methods
            .stakingRewardsInfoByStakingToken(pair.id)
            .call()
        );
      }
      const res = await Promise.all(allData);
      for (let i = 0; i < res.length; i++) {
        res[i].tokenAddress = DEFAULT_PAIR[i].id;
      }
      setData((old) => [...old, ...res]);
    };

    if (active) {
      getData();
    }
  }, [active]);

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
            setOptionFilter={setOptionFilter}
            key={index}
            filterKey={filterKey}
            data={e}
            type={e.appId || "quickswap"}
          />
        );
      })}
    </>
  );
};

export default WrappedFarm;
