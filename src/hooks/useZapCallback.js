import { useZapContract } from "./useContract";
import { useCallback, useState } from "react";
import { useWeb3React } from "@web3-react/core";

  const useZapCallback = (params, onFinish) => {
  const { account } = useWeb3React();
  const zapContract = useZapContract();
  const [loading, setLoading] = useState(false);

  return [
    useCallback(() => {
      setLoading(true);
      console.log(params);
      try {
        zapContract.methods
          .zapInToken(params)
          .send({ from: account })
          .on("confirmation", async function (number) {
            if (number === 1) {
              await onFinish();
              setLoading(false);
            }
          })
          .once("error", function () {
            setLoading(false);
          });
      } catch (e) {
        console.log(e)
        setLoading(false);
      }
    }, [params]),
    loading,
  ];
};

export default useZapCallback;
