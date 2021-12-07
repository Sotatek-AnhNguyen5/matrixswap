import { useZapContract } from "./useContract";
import { useCallback, useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { debounce, isEmpty } from "lodash";
import BigNumber from "bignumber.js";

export const STATUS_ZAP = {
  waiting: "waiting",
  success: "success",
  error: "error",
};

const useZapCallback = (params, onFinish) => {
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
        zapContract.methods
          .zapInMultiToken(params)
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
        setStatus(STATUS_ZAP.error);
        setLoading(false);
      }
    }, [params]),
    loading,
    status,
    txHash,
  ];
};

export default useZapCallback;
