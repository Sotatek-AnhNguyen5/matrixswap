import {useWeb3React} from "@web3-react/core";
import ABI from "../../abi/factoryABI.json";
import {FACTORY_ADDRESS} from "../../utils";
import {DEFAULT_PAIR} from "../../const";
import {useState, useMemo, useEffect} from "react";
import TableRecord from "../TableRecord";
import axios from "axios";
import TableRecordSushi from "../TableRecordSushi";
import {take} from "lodash";


const WrappedFarm = ({filterKey}) => {
  const {library, active} = useWeb3React();
  const [data, setData] = useState([]);
  const [dataSushi, setDataSushi] = useState([]);


  const getDataSushi = async () => {
    const req = await axios.get('https://api.zapper.fi/v1/farms/masterchef?api_key=5d1237c2-3840-4733-8e92-c5a58fe81b88&network=polygon');
    setDataSushi(req.data.filter(e => e.appId === 'sushiswap'));
  }

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
      getDataSushi();
    }
  }, [active]);

  return (
    <>
      {data.map((e, index) => {
        return <TableRecord key={index} filterKey={filterKey} data={e} type={"quickswap"}/>;
      })}
      {take(dataSushi, 10).map((e, index) => {
        return <TableRecordSushi key={index} filterKey={filterKey} data={e} type={"sushiswap"}/>
      })}
    </>
  );
};

export default WrappedFarm;
