import CurveFarmData from "../json/CurvePools.json";
import {useEffect, useState} from "react";
import {getDataToken} from "../utils/token";
import {useLibrary} from "./useContract";
import {getTokenInfo} from "../utils";
import {calculateTVL} from "../utils/tvl";

const useCurveFarms = () => {
  const farmData = CurveFarmData;
  const library = useLibrary();
  const [completeData, setCompleteData] = useState([]);

  const getFarmData = async () => {
    const listLpToken = await Promise.all(
      farmData.map((item) => getTokenInfo(item.depositToken, library))
    );
    const listTVL = await Promise.all(
      farmData.map((item, index) =>
        calculateTVL(
          listLpToken[index],
          item.curvePool,
          factoryContract,
          library
        )
      )
    );
  }

  useEffect(() => {

  }, [farmData])

  return completeData;
}

export default useCurveFarms;