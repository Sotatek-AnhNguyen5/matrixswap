import { useQuery } from "@apollo/client";
import { GET_ZAPS } from "../graphql";
import { useEffect, useState } from "react";
import ERC20ABI from "../abi/IERC20ABI.json";
import { useFactoryContract, useLibrary } from "./useContract";
import BigNumber from "bignumber.js";
import { USDT_ADDRESS } from "../const";
import { convertToUSD } from "../utils/apr";
import moment from "moment";

const useVolume24h = () => {
  const library = useLibrary();
  const factoryContract = useFactoryContract("quick");
  const { data, refetch } = useQuery(GET_ZAPS, {
    context: { clientName: "zapData" },
    notifyOnNetworkStatusChange: true,
  });
  const [volume, setVolume] = useState({
    total: 0,
    total24h: 0,
  });

  const calculateVolume = async () => {
    const yesterday = moment().subtract(1, "days").unix();
    let total = 0;
    let total24h = 0;
    const totalVolume = await Promise.all(
      data.zaps.map(async (e) => {
        const toUSDT = await amountToUSDT(
          library,
          e.amount,
          e.input,
          factoryContract
        );
        return {
          createTime: e.createTime,
          amount: toUSDT,
        };
      })
    );
    totalVolume.forEach((e) => (total = e.amount.plus(total)));
    totalVolume
      .filter((e) => e.createTime >= yesterday)
      .forEach((e) => (total24h = e.amount.plus(total24h)));
    setVolume({
      total: total.toFixed(2),
      total24h: total24h.toFixed(2),
    });
  };

  useEffect(() => {
    if (data && data.zaps) {
      calculateVolume();
    }
  }, [data, data && data.zaps]);

  return [volume, refetch];
};

const amountToUSDT = async (library, amount, tokenAddress, factoryContract) => {
  if (tokenAddress.toLowerCase() === USDT_ADDRESS.toLowerCase()) {
    return new BigNumber(amount).div(new BigNumber(10).pow(6));
  }
  const tokenContract = new library.eth.Contract(ERC20ABI, tokenAddress);
  const decimals = await tokenContract.methods.decimals().call();
  return convertToUSD(
    new BigNumber(amount).div(new BigNumber(10).pow(decimals)),
    decimals,
    library,
    tokenAddress,
    factoryContract
  );
};

export default useVolume24h;
