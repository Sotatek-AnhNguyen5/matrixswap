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
import { getDataToken, getLPBalance } from "../utils/token";
import { calculateTVL } from "../utils/tvl";
import { useFactoryContract, useLibrary } from "./useContract";
import { calculateAPR } from "../utils/apr";
import { getDeposited } from "../utils/deposited";
import { useWeb3React } from "@web3-react/core";

const ABR_USDC_POOL_INDEX = "10";
const WATCH_BANANA_POOL_INDEX = "8";
const useApeSwapFarms = () => {
  const library = useLibrary();
  const factoryContract = useFactoryContract(FARM_TYPE.apeswap);
  const { loading, error, data } = useQuery(GET_APESWAP_FARMS, {
    context: { clientName: "apesFarm" },
  });
  const [apeSwapFarms, setApeSwapFarm] = useState([]);
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
          FARM_TYPE.apeswap,
          listTVL[index],
          factoryContract,
          library,
          data.miniChefs[0],
          item.allocPoint,
          item.rewarder,
        )
      )
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
      let rewardTokens = [BANANA_TOKEN, WMATIC_TOKEN];
      if (item.id === WATCH_BANANA_POOL_INDEX) {
        rewardTokens = [BANANA_TOKEN, WATCH_TOKEN];
      } else if (item.id === ABR_USDC_POOL_INDEX) {
        rewardTokens = [BANANA_TOKEN, ABR_TOKEN];
      }

      let symbol0, symbol1;
      if (["WMATIC", "USDC"].indexOf(listLpToken[index].token0.symbol) !== -1) {
        symbol0 = listLpToken[index].token1.symbol;
        symbol1 = listLpToken[index].token0.symbol;
      } else {
        symbol0 = listLpToken[index].token0.symbol;
        symbol1 = listLpToken[index].token1.symbol;
      }

      return {
        ...item,
        lpToken: listLpToken[index],
        tvl: listTVL[index],
        apr: listAPR[index],
        symbol0,
        symbol1,
        deposited: listDeposited[index] || 0,
        lpBalance: listLpBalance[index] || 0,
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
  }, [data, account]);

  return apeSwapFarms;
};

export default useApeSwapFarms;
