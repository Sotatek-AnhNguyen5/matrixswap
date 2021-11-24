import { useWeb3React } from "@web3-react/core";
import ZapABI from "../abi/ZapABI.json";
import {ADDRESS_ZAP, PROTOCOL_FUNCTION} from "../const";
import { useMemo } from "react";
import QuickSwapFactoryABI from "../abi/quickswapFactoryABI.json";

export const useZapContract = () => {
  const { library } = useWeb3React();
  return useMemo(() => {
    return new library.eth.Contract(ZapABI.abi, ADDRESS_ZAP);
  }, [library, ADDRESS_ZAP, ZapABI.abi]);
};

export const useFactoryContract = (type) => {
  const {library} = useWeb3React();
  return useMemo(() => {
    if(library) {
      return new library.eth.Contract(QuickSwapFactoryABI, PROTOCOL_FUNCTION[type].factoryAddress);
    }
    return undefined
  }, [library, type, QuickSwapFactoryABI]);
}

export const useFarmContract = (farmAddress, type) => {
  const {library} = useWeb3React();
  return useMemo(() => {
    return new library.eth.Contract(PROTOCOL_FUNCTION[type].abi, farmAddress);
  }, [library, type, farmAddress]);
}