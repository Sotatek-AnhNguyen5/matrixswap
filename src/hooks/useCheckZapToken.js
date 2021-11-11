import { useWeb3React } from "@web3-react/core";
import { isEmpty } from "lodash";
import { useEffect, useState } from "react";
import QuickSwapFactoryABI from "../abi/quickswapFactoryABI.json";
import ZAPABI from "../abi/zapABI.json";
import { ADDRESS_ZAP } from "../const";
import { hashSha3Tokens, isValidAddress } from "../utils";

const QUICKSWAP_FACTORY_ADDRESS = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";

const useCheckZapToken = (tokenCheck, token0, token1) => {
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
        QUICKSWAP_FACTORY_ADDRESS
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

      const hash0 = hashSha3Tokens(tokenCheck.address, token0.address);
      const hash1 = hashSha3Tokens(tokenCheck.address, token1.address);
      const [interateToken0, internateToken1] = await Promise.all([
        zapContract.methods.intermediateTokens(hash0).call(),
        zapContract.methods.intermediateTokens(hash1).call(),
      ]);

      if (isValidAddress(interateToken0) || isValidAddress(internateToken1)) {
        setZapAble(true);
        return;
      }

      setZapAble(false);
    };

    if (!isEmpty(tokenCheck) && !isEmpty(token0) && !isEmpty(token1)) {
      checkData();
    }
  }, [tokenCheck, token0, token1]);

  return zapAble;
};

export default useCheckZapToken;
