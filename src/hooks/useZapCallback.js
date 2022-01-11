import { useZapContract } from "./useContract";
import { useCallback, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { ethers } from "ethers";
import { ADDRESS_ZAP, PROTOCOL_FUNCTION } from "../const";
import ZapABI from "../abi/ZapABI.json";

export const STATUS_ZAP = {
  waiting: "waiting",
  success: "success",
  error: "error",
};

const useZapCallback = (params, onFinish, isZapIn) => {
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(false);
  const [status, setStatus] = useState(STATUS_ZAP.waiting);

  return [
    useCallback(async () => {
      setStatus(STATUS_ZAP.waiting);
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(ADDRESS_ZAP, ZapABI.abi, signer);
      const methods = isZapIn ? "zapInMultiToken" : "zapOutMultipleToken";
      const param = isZapIn ? [params] : [...params];

      try {
        const tx = await contract[methods](...param);
        await tx.wait(5);
        await onFinish();
        setLoading(false);
        setStatus(STATUS_ZAP.success);
        setTxHash(tx.hash);
      } catch (e) {
        if (e.message.includes("transaction was replaced")) {
          await onFinish();
          setStatus(STATUS_ZAP.success);
          setTxHash(e.replacement.hash);
        } else {
          setStatus(STATUS_ZAP.error);
        }
        console.log(e);
        setLoading(false);
      }
    }, [params, isZapIn]),
    loading,
    status,
    txHash,
  ];
};

export default useZapCallback;
