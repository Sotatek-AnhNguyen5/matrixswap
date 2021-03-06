import { useWeb3React } from "@web3-react/core";
import ZapABI from "../abi/ZapABI.json";
import {
  ADDRESS_ZAP,
  PROTOCOL_FUNCTION,
  QUICKSWAP_STAKINGINFO_ADDRESS,
} from "../const";
import { useMemo } from "react";
import QuickSwapFactoryABI from "../abi/quickswapFactoryABI.json";
import Web3 from "web3";
import ABI from "../abi/QuickSwapStakingInfoABI.json";
import {Multicall} from "ethereum-multicall";

const web3 = new Web3(
  new Web3.providers.HttpProvider("https://polygon-rpc.com/")
);
export const getContract = (library, abi, address) => {
  if (library) {
    return new library.eth.Contract(abi, address);
  } else {
    return new web3.eth.Contract(abi, address);
  }
};

export const useZapContract = () => {
  const { library } = useWeb3React();
  return useMemo(() => {
    return getContract(library, ZapABI.abi, ADDRESS_ZAP);
  }, [library, ADDRESS_ZAP, ZapABI.abi]);
};

export const useFactoryContract = (type) => {
  const { library } = useWeb3React();
  return useMemo(() => {
    return getContract(
      library,
      QuickSwapFactoryABI,
      PROTOCOL_FUNCTION[type].factoryAddress
    );
  }, [library, type]);
};

export const useFarmContract = (farmAddress, type) => {
  const { library } = useWeb3React();
  return useMemo(() => {
    return getContract(library, PROTOCOL_FUNCTION[type].abi, farmAddress);
  }, [library, type, farmAddress]);
};

export const useQuickSwapStakingInfoContract = () => {
  const { library } = useWeb3React();
  return useMemo(() => {
    return getContract(library, ABI, QUICKSWAP_STAKINGINFO_ADDRESS);
  }, [library]);
};

export const useLibrary = () => {
  const { library } = useWeb3React();
  return useMemo(() => {
    return library || web3;
  }, [library]);
};

export const useMulticall = () => {
  const web3Instance = useLibrary();
  return new Multicall({ web3Instance, tryAggregate: true });
};
