import { useQuery } from "@apollo/client";
import { GET_APESWAP_FARMS } from "../graphql";
import { useEffect, useState } from "react";
import { isEmpty } from "lodash";
import {
  ABR_TOKEN,
  BANANA_TOKEN,
  FARM_TYPE,
  USDT_ADDRESS,
  WATCH_TOKEN,
  WMATIC_TOKEN,
} from "../const";
import {
  convertMultipleCallParams,
  getDataToken,
} from "../utils/token";
import { calculateTVL } from "../utils/tvl";
import { useFactoryContract, useLibrary, useMulticall } from "./useContract";
import { calculateAPR } from "../utils/apr";
import {
  convertLpStakedContext,
  convertLPtoUSDT,
} from "../utils/deposited";
import { useWeb3React } from "@web3-react/core";
import { convertMultipleResultCall, convertSingleResultCall } from "../utils";
import BigNumber from "bignumber.js";

const ABR_USDC_POOL_INDEX = "10";
const WATCH_BANANA_POOL_INDEX = "8";
const useApeSwapFarms = () => {
  const library = useLibrary();
  const multicall = useMulticall();
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

    const tvlPairContextParams = data.pools.map((item, index) => ({
      reference: listLpToken[index].address,
      contractAddress: factoryContract._address,
      abi: [
        {
          constant: true,
          inputs: [
            { internalType: "address", name: "", type: "address" },
            { internalType: "address", name: "", type: "address" },
          ],
          name: "getPair",
          outputs: [{ internalType: "address", name: "", type: "address" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
      ],
      calls: [
        {
          reference: "pairToken0Usdt",
          methodName: "getPair",
          methodParameters: [listLpToken[index].token0.address, USDT_ADDRESS],
        },
        {
          reference: "pairToken1Usdt",
          methodName: "getPair",
          methodParameters: [listLpToken[index].token1.address, USDT_ADDRESS],
        },
      ],
    }));
    const pairTVL = await multicall.call(tvlPairContextParams);
    const convertedPairTVL = convertMultipleResultCall(pairTVL.results);
    const tvlLpBalance = data.pools.map((item, index) => ({
      reference: `${item.miniChef.id}-${item.id}`,
      contractAddress: listLpToken[index].address,
      abi: [
        {
          constant: true,
          inputs: [
            { internalType: "address", name: "account", type: "address" },
          ],
          name: "balanceOf",
          outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
          payable: false,
          stateMutability: "view",
          type: "function",
        },
      ],
      calls: [
        {
          reference: "balanceOf",
          methodName: "balanceOf",
          methodParameters: [item.miniChef.id],
        },
      ],
    }));
    const resultTVL = await multicall.call(tvlLpBalance);
    const listTotalSupply = convertSingleResultCall(resultTVL.results).map(
      (big) => new BigNumber(big[0].hex).toFixed()
    );

    const listTVL = await Promise.all(
      data.pools.map((item, index) =>
        calculateTVL(
          listLpToken[index],
          item.miniChef.id,
          factoryContract,
          library,
          listTotalSupply[index],
          convertedPairTVL[index].pairToken0Usdt[0],
          convertedPairTVL[index].pairToken1Usdt[0]
        )
      )
    );
    const listAPR = await Promise.all(
      data.pools.map((item, index) => {
        const rewarder = { ...item.rewarder };
        if (item.id === "7") {
          rewarder.rewardToken = "0x76bf0c28e604cc3fe9967c83b3c3f31c213cfe64";
          rewarder.rewardPerSecond = "53592110339506000";
        } else if (item.id === "11") {
          rewarder.rewardToken = "0x8623e66bea0dce41b6d47f9c44e806a115babae0";
          rewarder.rewardPerSecond = "12345679012345700";
        }
        return calculateAPR(
          item.miniChef.id,
          FARM_TYPE.apeswap,
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
      const lpDepositedContext = data.pools.map((item) =>
        convertLpStakedContext(item.miniChef.id, account, item.id)
      );
      const lpCallContext = data.pools.map((item) =>
        convertMultipleCallParams(item.pair, account)
      );
      const [resultBalance, resultDeposited] = await Promise.all([
        multicall.call(lpCallContext),
        multicall.call(lpDepositedContext),
      ]);
      listLpBalance = convertSingleResultCall(resultBalance.results).map(
        (big) =>
          new BigNumber(big[0].hex).div(new BigNumber(10).pow(18)).toFixed()
      );
      const convertDeposited = convertSingleResultCall(
        resultDeposited.results
      ).map((big) => new BigNumber(big[0].hex).toFixed());
      listDeposited = await Promise.all(
        data.pools.map((item, index) =>
          convertLPtoUSDT(
            factoryContract,
            listLpToken[index],
            convertDeposited[index],
            library
          )
        )
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
