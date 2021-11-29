import { useQuery } from "@apollo/client";
import { GET_APESWAP_FARMS } from "../graphql";
import { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import { ABR_TOKEN, BANANA_TOKEN, WATCH_TOKEN, WMATIC_TOKEN } from "../const";

const ABR_USDC_POOL_INDEX = "10";
const WATCH_BANANA_POOL_INDEX = "8";
const useApeSwapFarms = () => {
  const { loading, error, data } = useQuery(GET_APESWAP_FARMS, {
    context: { clientName: "apesFarm" },
  });
  const [apeSwapFarms, setApeSwapFarm] = useState([]);

  useEffect(() => {
    if (data && !isEmpty(data.pools)) {
      const convertedData = data.pools.map((item) => {
        let rewardTokens = [BANANA_TOKEN, WMATIC_TOKEN];
        if (item.id === WATCH_BANANA_POOL_INDEX) {
          rewardTokens = [BANANA_TOKEN, WATCH_TOKEN];
        } else if (item.id === ABR_USDC_POOL_INDEX) {
          rewardTokens = [BANANA_TOKEN, ABR_TOKEN];
        }
        return {
          ...item,
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
    }
  }, [data]);

  return apeSwapFarms;
};

export default useApeSwapFarms;
