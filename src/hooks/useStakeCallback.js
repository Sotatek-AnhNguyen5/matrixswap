import { useCallback, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import { FARM_TYPE, PROTOCOL_FUNCTION } from "../const";
import { useFarmContract } from "./useContract";
import { ethers } from "ethers";

const useStakeCallback = (farmAddress, value, onFinish, type, pId) => {
  const { account } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const farmContract = useFarmContract(farmAddress, type);

  return [
    useCallback(async () => {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        farmAddress,
        PROTOCOL_FUNCTION[type].abi,
        signer
      );
      try {
        const amount = new BigNumber(value)
          .times(new BigNumber(10).pow(18))
          .toFixed(0);
        let params;
        if (type === FARM_TYPE.apeswap || type === FARM_TYPE.sushiswap) {
          params = [pId, amount, account];
        } else {
          params = [amount];
        }
        const methods = PROTOCOL_FUNCTION[type].stake;
        const tx = await contract[methods](...params);
        await tx.wait(2);
        await onFinish();
        setLoading(false);
      } catch (e) {
        if(e.message.includes("transaction was replaced")) {
          await onFinish();
        }
        setLoading(false);
      }
    }, [farmContract, value, type]),
    loading,
  ];
};

export default useStakeCallback;
