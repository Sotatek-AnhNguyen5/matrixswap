import CurveFarmData from "../json/CurvePools.json";
import {useEffect, useState} from "react";
import {getDataToken} from "../utils/token";
import {useFactoryContract, useLibrary} from "./useContract";
import {getTokenInfo} from "../utils";
import {calculateTVL, calculateTVLCurve} from "../utils/tvl";
import {useWeb3React} from "@web3-react/core";
import {DRAGON_QUICK_TOKEN, FARM_TYPE} from "../const";

const useCurveFarms = () => {
  const farmData = CurveFarmData;
  const library = useLibrary();
  const [completeData, setCompleteData] = useState([]);
  const factoryContract = useFactoryContract(FARM_TYPE.quickswap);
  const {account} = useWeb3React();

  const getFarmData = async () => {
    const listDepositToken = await Promise.all(
      farmData.map((item) => getTokenInfo(item.depositToken, library))
    );
    const listTVL = await Promise.all(
      farmData.map((item, index) =>
        calculateTVLCurve(
          library,
          listDepositToken[index],
          item.curvePool,
          factoryContract
        )
      )
    );
    // let listDeposited = [];
    // let listLpBalance = [];
    // if(account) {
    //
    // }


    const convertedData = farmData.map((item, index) => {
      return {
        ...item,
        lpToken: listDepositToken[index],
        tvl: listTVL[index],
        apr: 0,
        deposited: 0,
        lpBalance: 0,
        rewardAddress: item.stakingRewards,
        tokenAddress: item.id,
        appId: "curve",
        rewardTokens: [DRAGON_QUICK_TOKEN],
      };
    });
  }

  useEffect(() => {

  }, [farmData])

  return completeData;
}

export default useCurveFarms;