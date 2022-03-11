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
      data.pools.map((item, index) => {
        const rewarder = { ...item.rewarder };
        if (item.id === "47") {
          rewarder.rewardToken = "0xd8ca34fd379d9ca3c6ee3b3905678320f5b45195";
          rewarder.rewardPerSecond = "4629629630000";
        }
        return calculateAPR(
          item.miniChef.id,
          FARM_TYPE.sushiswap,
          listTVL[index],
          factoryContract,
          library,
          data.miniChefs[0],
          item.allocPoint,
          rewarder,
          item.id
        );
      })
    );
    let listDeposited = [];
    let listLpBalance = [];
    if (account) {
      listDeposited = await Promise.all(
        data.pools.map((item, index) =>
          getDeposited(
            library,
            item.miniChef.id,
            item.id,
            account,
            factoryContract,
            listLpToken[index]
          )
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
        deposited: listDeposited[index] || 0,
        lpBalance: listLpBalance[index] || 0,
        symbol0: listLpToken[index].token0.symbol,
        symbol1: listLpToken[index].token1.symbol,
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
