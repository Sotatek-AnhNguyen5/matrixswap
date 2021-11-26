import { useQuery } from "@apollo/client";
import {GET_APESWAP_FARMS} from "../graphql";
import { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import {BANANA_TOKEN, WMATIC_TOKEN} from "../const";

const useApeSwapFarms = () => {
  const { loading, error, data } = useQuery(GET_APESWAP_FARMS, {
    context: { clientName: "apesFarm" },
  });
  const [apeSwapFarms, setApeSwapFarm] = useState([]);

  useEffect(() => {
    if (data && !isEmpty(data.pools)) {
      const convertedData = data.pools.map((item) => {
        return {
          ...item,
          rewardAddress: item.miniChef.id,
          poolIndex: item.id,
          rewardTokenAddress: item.rewarder.rewardToken,
          tokenAddress: item.pair,
          appId: "apeswap",
          rewardTokens: [BANANA_TOKEN, WMATIC_TOKEN],
        };
      });
      setApeSwapFarm(convertedData);
    }
  }, [data]);

  return apeSwapFarms;
};

export default useApeSwapFarms;
