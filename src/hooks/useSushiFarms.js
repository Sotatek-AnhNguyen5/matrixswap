import { useQuery } from "@apollo/client";
import { GET_SUSHI_FARMS } from "../graphql";
import { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import { FARM_TYPE, SUSHI_TOKEN, WMATIC_TOKEN } from "../const";
import { getDataToken, getLPBalance } from "../utils/token";
import { calculateTVL } from "../utils/tvl";
import { calculateAPR } from "../utils/apr";
import { useFactoryContract, useLibrary } from "./useContract";
import { getDeposited } from "../utils/deposited";
import { useWeb3React } from "@web3-react/core";

const useSushiFarms = () => {
  const library = useLibrary();
  const factoryContract = useFactoryContract(FARM_TYPE.sushiswap);
  const { loading, error, data } = useQuery(GET_SUSHI_FARMS);
  const [sushiFarm, setSushiFarm] = useState([]);
  const { account } = useWeb3React();

  const getFarmData = async () => {
    const listLpToken = await Promise.all(
      data.pools.map((item) => getDataToken(item.pair, library))
    );
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
          FARM_TYPE.sushiswap,
          listTVL[index],
          factoryContract,
          library
        )
      )
    );

    let listDeposited = [];
    let listLpBalance = [];
    if (account) {
      listDeposited = await Promise.all(
        data.pools.map((item) =>
          getDeposited(library, item.miniChef.id, item.id, account)
        )
      );

      listLpBalance = await Promise.all(
        data.pools.map((item) => getLPBalance(item.pair, library, account))
      );
    }

    const convertedData = data.pools.map((item, index) => {
      return {
        ...item,
        lpToken: listLpToken[index],
        tvl: listTVL[index],
        apr: listAPR[index],
        deposited: listDeposited[index],
        lpBalance: listLpBalance[index],
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
  };

  useEffect(() => {
    if (data && !isEmpty(data.pools)) {
      getFarmData();
    }
  }, [data, account]);

  return sushiFarm;
};

export default useSushiFarms;
