import {useWeb3React} from "@web3-react/core";
import {useMemo} from "react";
import QuickSwapFarm from "../abi/FarmABI.json";
import SushiFarm from "../abi/sushiFarmABI.json";

const useFarmContract = (farmAddress, type) => {
  const {library} = useWeb3React();

  return useMemo(() => {
    return new library.eth.Contract(type === 'sushi' ? SushiFarm : QuickSwapFarm, farmAddress);
  }, [type])
}

export default useFarmContract;