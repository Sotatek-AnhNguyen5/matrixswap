import {
  useFactoryContract,
  useLibrary,
  useQuickSwapStakingInfoContract,
} from "./useContract";
import { DEFAULT_PAIR, DRAGON_QUICK_TOKEN, FARM_TYPE } from "../const";
import { useEffect, useState } from "react";
import { getDataToken, getLPBalance } from "../utils/token";
import { calculateTVL } from "../utils/tvl";
import { calculateAPR } from "../utils/apr";
import { getDepositedQuickSwap } from "../utils/deposited";
import { useWeb3React } from "@web3-react/core";
import quickswapFarmData from "../json/quickswapFarmData.json"

const useQuickSwapFarms = () => {
  const library = useLibrary();
  const [quickSwapFarms, setQuickSwapFarms] = useState([]);
  // const stakingInfoContract = useQuickSwapStakingInfoContract();
  const factoryContract = useFactoryContract(FARM_TYPE.quickswap);
  const { account } = useWeb3React();

  const getData = async () => {
    const listLpToken = await Promise.all(
      quickswapFarmData.map((item) => getDataToken(item.id, library))
    );
    const listTVL = await Promise.all(
      quickswapFarmData.map((item, index) =>
        calculateTVL(
          listLpToken[index],
          item.stakingRewards,
          factoryContract,
          library
        )
      )
    );
    const listAPR = await Promise.all(
      quickswapFarmData.map((item, index) =>
        calculateAPR(
          item.stakingRewards,
          FARM_TYPE.quickswap,
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
        quickswapFarmData.map((item, index) =>
          getDepositedQuickSwap(
            library,
            item.stakingRewards,
            account,
            factoryContract,
            listLpToken[index]
          )
        )
      );
      listLpBalance = await Promise.all(
        listLpToken.map((item) => getLPBalance(item.address, library, account))
      );
    }

    const convertedData = quickswapFarmData.map((item, index) => {
      return {
        ...item,
        lpToken: listLpToken[index],
        tvl: listTVL[index],
        apr: listAPR[index],
        symbol0: listLpToken[index].token0.symbol,
        symbol1: listLpToken[index].token1.symbol,
        deposited: listDeposited[index] || 0,
        lpBalance: listLpBalance[index] || 0,
        rewardAddress: item.stakingRewards,
        tokenAddress: item.id,
        appId: "quickswap",
        rewardTokens: [DRAGON_QUICK_TOKEN],
      };
    });
    setQuickSwapFarms(convertedData);
  };

  useEffect(() => {
    getData();
  }, [account]);

  return quickSwapFarms;
};

export default useQuickSwapFarms;
