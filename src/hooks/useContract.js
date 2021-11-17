import { useWeb3React } from "@web3-react/core";
import ZapABI from "../abi/zapABI.json";
import { ADDRESS_ZAP } from "../const";
import { useMemo } from "react";

export const useZapContract = () => {
  const { library } = useWeb3React();
  return useMemo(() => {
    return new library.eth.Contract(ZapABI.abi, ADDRESS_ZAP);
  }, [library, ADDRESS_ZAP, ZapABI.abi]);
};