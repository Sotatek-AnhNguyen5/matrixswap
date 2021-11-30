import { useQuery } from "@apollo/client";
import { GET_ZAPS } from "../graphql";
import { useEffect, useState } from "react";
import moment from "moment";
import { useWeb3React } from "@web3-react/core";
import ERC20ABI from "../abi/IERC20ABI.json";
import { useFactoryContract } from "./useContract";
import BigNumber from "bignumber.js";
import { USDT_ADDRESS } from "../const";
import {convertToUSD} from "../utils/apr";

const useVolume24h = () => {
  const { library } = useWeb3React();
  const factoryContract = useFactoryContract("quick");
  const { loading, error, data } = useQuery(GET_ZAPS, {
    variables: {
      createTime: moment().subtract(1, "days").unix(),
    },
    context: { clientName: "zapData" },
  });
  const [volume, setVolume] = useState();

  const calculateVolume24h = async () => {
    let total = 0;
    const jobData = [];
    for (let e of data.zaps) {
      jobData.push(amountToUSDT(library, e.amount, e.input, factoryContract));
    }
    const lstVolume = await Promise.all(jobData);
    lstVolume.forEach((e) => (total = e.plus(total)));
    setVolume(total.toFixed(2));
  };

  useEffect(() => {
    if (data && data.zaps) {
      calculateVolume24h();
    }
  }, [data]);

  return volume;
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
