import { useQuery } from "@apollo/client";
import { GET_APESWAP_FARMS } from "../graphql";
import { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import {
  ABR_TOKEN,
  BANANA_TOKEN,
  FARM_TYPE,
  WATCH_TOKEN,
  WMATIC_TOKEN,
} from "../const";
import { getDataToken } from "../utils/token";
import { calculateTVL } from "../utils/tvl";
import { useFactoryContract, useLibrary } from "./useContract";
import { calculateAPR } from "../utils/apr";

const ABR_USDC_POOL_INDEX = "10";
const WATCH_BANANA_POOL_INDEX = "8";
const useApeSwapFarms = () => {
  const library = useLibrary();
  const factoryContract = useFactoryContract(FARM_TYPE.apeswap);
  const { loading, error, data } = useQuery(GET_APESWAP_FARMS, {
    context: { clientName: "apesFarm" },
  });
  const [apeSwapFarms, setApeSwapFarm] = useState([]);

  const getFarmData = async () => {
    const listLpToken = await Promise.all(
      data.pools.map((item) => getDataToken(item.pair, library))
    );
    console.log(listLpToken)
    const listTVL = await Promise.all(
      data.pools.map((item, index) =>
        calculateTVL(
          listLpToken[index],
          item.miniChef.id,
          factoryContract,
          library
        )
      )
    );
    const listAPR = await Promise.all(
      data.pools.map((item, index) =>
        calculateAPR(
          item.miniChef.id,
          FARM_TYPE.apeswap,
          listTVL[index],
          factoryContract,
          library
        )
      )
    );

    const convertedData = data.pools.map((item, index) => {
      let rewardTokens = [BANANA_TOKEN, WMATIC_TOKEN];
      if (item.id === WATCH_BANANA_POOL_INDEX) {
        rewardTokens = [BANANA_TOKEN, WATCH_TOKEN];
      } else if (item.id === ABR_USDC_POOL_INDEX) {
        rewardTokens = [BANANA_TOKEN, ABR_TOKEN];
      }
      return {
        ...item,
        lpToken: listLpToken[index],
        tvl: listTVL[index],
        apr: listAPR[index],
        rewardAddress: item.miniChef.id,
        poolIndex: item.id,
        rewardTokenAddress: item.rewarder.rewardToken,
        rewarderAddress: item.rewarder.id,
        tokenAddress: item.pair,
        appId: "apeswap",
        rewardTokens,
      };
    });
    setApeSwapFarm(convertedData);
  };

  useEffect(() => {
    if (data && !isEmpty(data.pools)) {
      getFarmData();
    }
  }, [data]);

  return apeSwapFarms;
};

export default useApeSwapFarms;
