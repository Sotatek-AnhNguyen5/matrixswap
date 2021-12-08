import { useZapContract } from "./useContract";
import { useCallback, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";

export const STATUS_ZAP = {
  waiting: "waiting",
  success: "success",
  error: "error",
};

const useZapCallback = (params, onFinish, isZapIn) => {
  const { account } = useWeb3React();
  const zapContract = useZapContract();
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState(false);
  const [status, setStatus] = useState(STATUS_ZAP.waiting);

  return [
    useCallback(() => {
      setStatus(STATUS_ZAP.waiting);
      setLoading(true);
      try {
        const methods = isZapIn ? "zapInMultiToken" : "zapOutMultipleToken";
        const param = isZapIn ? [params] : [...params];
        console.log(param)
        zapContract.methods[methods](...param)
          .send({ from: account })
          .on("confirmation", async function (number, receipt) {
            if (number === 5) {
              await onFinish();
              setLoading(false);
              setStatus(STATUS_ZAP.success);
              setTxHash(receipt.transactionHash);
            }
          })
          .once("error", function () {
            setStatus(STATUS_ZAP.error);
            setLoading(false);
          });
      } catch (e) {
        console.log(e)
        setStatus(STATUS_ZAP.error);
        setLoading(false);
      }
    }, [params, isZapIn]),
    loading,
    status,
    txHash,
  ];
};

export default useZapCallback;
