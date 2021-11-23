import { useWeb3React } from "@web3-react/core";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import QuickSwapFactoryABI from "../abi/quickswapFactoryABI.json";
import ZAPABI from "../abi/ZapABI.json";
import {ADDRESS_ZAP, PROTOCOL_FUNCTION, QUICKSWAP_FACTORY_ADDRESS, SUSHI_FACTORY_ADDRESS} from "../const";
import { hashSha3Tokens, isValidAddress } from "../utils";

const useCheckZapToken = (tokenCheck, token0, token1, type) => {
  const [zapAble, setZapAble] = useState(true);
  const { library } = useWeb3React();

  useEffect(() => {
    const checkData = async () => {
      if (
        tokenCheck.address.toLowerCase() === token0.address.toLowerCase() ||
        tokenCheck.address.toLowerCase() === token1.address.toLowerCase()
      ) {
        setZapAble(true);
        return;
      }

      const factoryContract = new library.eth.Contract(
        QuickSwapFactoryABI,
        type === "sushi" ? SUSHI_FACTORY_ADDRESS : QUICKSWAP_FACTORY_ADDRESS
      );
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
      const hashType = PROTOCOL_FUNCTION[type].fullnameHash;
      const hash0 = hashSha3Tokens(tokenCheck.address, token0.address);
      const hash1 = hashSha3Tokens(tokenCheck.address, token1.address);
      const [internateToken0, internateToken1] = await Promise.all([
        zapContract.methods.protocols(hashType).call(),
        zapContract.methods.protocols(hashType).call(),
      ]);

      console.log(internateToken0, internateToken1)
      //TODO fix this
      // if (isValidAddress(internateToken0) || isValidAddress(internateToken1)) {
      //   setZapAble(true);
      //   return;
      // }

      setZapAble(false);
    };

    if (!isEmpty(tokenCheck) && !isEmpty(token0) && !isEmpty(token1)) {
      checkData();
    }
  }, [tokenCheck, token0, token1]);

  return zapAble;
};

export default useCheckZapToken;
