import { useCallback, useState } from "react";
import { ethers } from "ethers";
import { ADDRESS_ZAP } from "../const";
import ZapABI from "../abi/ZapABI.json";

export const STATUS_ZAP = {
  waiting: "waiting",
  success: "success",
  error: "error",
};

const useZapCallback = (params, onFinish, isZapIn, onFail) => {
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
        await tx.wait(2);
        setTxHash(tx.hash);
        setLoading(false);
        setStatus(STATUS_ZAP.success);
        await onFinish();
      } catch (e) {
        if (e.message.includes("transaction was replaced")) {
          await onFinish();
          setStatus(STATUS_ZAP.success);
          setTxHash(e.replacement.hash);
        } else {
          setStatus(STATUS_ZAP.error);
          onFail();
        }
        console.log(e);
        setLoading(false);
      }
    }, [params, isZapIn, onFinish]),
    loading,
    status,
    txHash,
  ];
};

export default useZapCallback;
