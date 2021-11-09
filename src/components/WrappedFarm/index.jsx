import { useWeb3React } from "@web3-react/core";
import ABI from "../../abi/factoryABI.json";
import { FACTORY_ADDRESS } from "../../utils";
import { DEFAULT_PAIR } from "../../const";
import { useState, useMemo, useEffect } from "react";
import TableRecord from "../TableRecord";
import useConvertToUsdt from "../../hooks/useConvertToUsdt";

const WrappedFarm = () => {
  const { library, active } = useWeb3React();
  const [data, setData] = useState([]);

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
      setData(res);
    };

    if (active) {
      getData();
    }
  }, [active]);

  return data.map((e, index) => {
    return <TableRecord key={index} data={e} />;
  });
};

export default WrappedFarm;
