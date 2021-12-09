import {
  useFactoryContract,
  useLibrary,
  useQuickSwapStakingInfoContract,
} from "./useContract";
import { DEFAULT_PAIR, DRAGON_QUICK_TOKEN, FARM_TYPE } from "../const";
import { useEffect, useState } from "react";
import { getDataToken } from "../utils/token";
import { calculateTVL } from "../utils/tvl";
import { calculateAPR } from "../utils/apr";
import { getDepositedQuickSwap } from "../utils/deposited";
import { useWeb3React } from "@web3-react/core";

const useQuickSwapFarms = () => {
  const library = useLibrary();
  const [quickSwapFarms, setQuickSwapFarms] = useState([]);
  const stakingInfoContract = useQuickSwapStakingInfoContract();
  const factoryContract = useFactoryContract(FARM_TYPE.quickswap);
  const { account } = useWeb3React();

  const getData = async () => {
    const res = await Promise.all(
      DEFAULT_PAIR.map((item) => {
        return stakingInfoContract.methods
          .stakingRewardsInfoByStakingToken(item.id)
          .call();
      })
    );
    const resWithTokenAddress = DEFAULT_PAIR.map((e, index) => {
      return {
        ...e,
        ...res[index],
      };
    });
    const listLpToken = await Promise.all(
      resWithTokenAddress.map((item) => getDataToken(item.id, library))
    );
    const listTVL = await Promise.all(
      resWithTokenAddress.map((item, index) =>
        calculateTVL(
          listLpToken[index],
          item.stakingRewards,
          factoryContract,
          library
        )
      )
    );
    const listAPR = await Promise.all(
      resWithTokenAddress.map((item, index) =>
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
    if (account) {
      listDeposited = await Promise.all(
        resWithTokenAddress.map((item) =>
          getDepositedQuickSwap(library, item.stakingRewards, account)
        )
      );
    }

    const convertedData = resWithTokenAddress.map((item, index) => {
      return {
        ...item,
        lpToken: listLpToken[index],
        tvl: listTVL[index],
        apr: listAPR[index],
        deposited: listDeposited[index],
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
