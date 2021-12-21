import { useWeb3React } from "@web3-react/core";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import QuickSwapFactoryABI from "../abi/quickswapFactoryABI.json";
import ZAPABI from "../abi/ZapABI.json";
import {
  ADDRESS_ZAP,
  PROTOCOL_FUNCTION,
  QUICKSWAP_FACTORY_ADDRESS,
  SUSHI_FACTORY_ADDRESS,
} from "../const";
import { hashSha3Tokens, isValidAddress } from "../utils";
import { useFactoryContract } from "./useContract";

const useCheckZapToken = (tokenCheck, token0, token1, farmType) => {
  const [zapAble, setZapAble] = useState(true);
  const { library } = useWeb3React();
  const factoryContract = useFactoryContract(farmType);

  const checkData = async () => {
    if (
      tokenCheck.address.toLowerCase() === token0.address.toLowerCase() ||
      tokenCheck.address.toLowerCase() === token1.address.toLowerCase()
    ) {
      setZapAble(true);
      return;
    }

    const [pairToken0, pairToken1] = await Promise.all([
      factoryContract.methods
        .getPair(tokenCheck.address, token0.address)
        .call(),
      factoryContract.methods
        .getPair(tokenCheck.address, token1.address)
        .call(),
    ]);

    if (isValidAddress(pairToken0) || isValidAddress(pairToken1)) {
      setZapAble(true);
      return;
    }

    const zapContract = new library.eth.Contract(ZAPABI.abi, ADDRESS_ZAP);
    const hashType = PROTOCOL_FUNCTION[farmType].fullnameHash;
    // const hashPair0 = hashSha3Tokens(tokenCheck.address, token0.address);
    // const hashPair1 = hashSha3Tokens(tokenCheck.address, token1.address);
    const [internateToken0, internateToken1] = await Promise.all([
      zapContract.methods
        .getIntermediateToken(hashType, tokenCheck.address, token0.address)
        .call(),
      zapContract.methods
        .getIntermediateToken(hashType, tokenCheck.address, token1.address)
        .call(),
    ]);

    if (isValidAddress(internateToken0) || isValidAddress(internateToken1)) {
      setZapAble(true);
      return;
    }

    setZapAble(false);
  };
  useEffect(() => {
    if (!isEmpty(tokenCheck) && !isEmpty(token0) && !isEmpty(token1)) {
      checkData();
    }
  }, [tokenCheck, token0, token1]);

  return zapAble;
};

export default useCheckZapToken;
