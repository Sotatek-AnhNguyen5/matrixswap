import { useWeb3React } from "@web3-react/core";
import ABI from "../../abi/factoryABI.json";
import { FACTORY_ADDRESS } from "../../utils";
import { DEFAULT_PAIR } from "../../const";
import { useState, useEffect } from "react";
import axios from "axios";
import TableRecordSushi from "../WrappedTableRecords";
import { take } from "lodash";

const WrappedFarm = ({ filterKey, setOptionFilter }) => {
  const { library, active } = useWeb3React();
  const [data, setData] = useState([]);

  const getDataApes = async () => {
    const req = await axios.get(
      "https://api.zapper.fi/v1/farms/masterchef?api_key=5d1237c2-3840-4733-8e92-c5a58fe81b88&network=polygon"
    );
    const wrappedData = take(
      req.data.filter((e) => e.isActive && ["apeswap"].indexOf(e.appId) !== -1),
      10
    );

    setData((old) => [...old, ...wrappedData]);
  };

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
      getDataApes();
    }
  }, [active]);

  return (
    <>
      {data.map((e, index) => {
        return (
          <TableRecordSushi
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
