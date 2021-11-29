import { useQuery } from "@apollo/client";
import { GET_SUSHI_FARMS } from "../graphql";
import { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import { SUSHI_TOKEN, WMATIC_TOKEN } from "../const";

const useSushiFarms = () => {
  const { loading, error, data } = useQuery(GET_SUSHI_FARMS);
  const [sushiFarm, setSushiFarm] = useState([]);

  useEffect(() => {
    if (data && !isEmpty(data.pools)) {
      const convertedData = data.pools.map((item) => {
        return {
          ...item,
          rewardAddress: item.miniChef.id,
          poolIndex: item.id,
          rewardTokenAddress: item.rewarder.rewardToken,
          rewarderAddress: item.rewarder.id,
          tokenAddress: item.pair,
          appId: "sushiswap",
          rewardTokens: [SUSHI_TOKEN, WMATIC_TOKEN],
        };
      });
      setSushiFarm(convertedData);
    }
  }, [data]);

  return sushiFarm;
};

export default useSushiFarms;
