import { useFactoryContract, useLibrary, useMulticall } from "./useContract";
import { DRAGON_QUICK_TOKEN, FARM_TYPE, USDT_ADDRESS } from "../const";
import { useCallback, useEffect, useState } from "react";
import { convertMultipleCallParams, getDataToken } from "../utils/token";
import { calculateTVL } from "../utils/tvl";
import { calculateAPR } from "../utils/apr";
import { convertLPtoUSDT } from "../utils/deposited";
import { useWeb3React } from "@web3-react/core";
import quickswapFarmData from "../json/quickswapFarmData.json";
import {convertMultipleResultCall, convertSingleResultCall} from "../utils";
import BigNumber from "bignumber.js";

const useQuickSwapFarms = () => {
  const library = useLibrary();
  const [quickSwapFarms, setQuickSwapFarms] = useState([]);
  const multicall = useMulticall();
  const factoryContract = useFactoryContract(FARM_TYPE.quickswap);
  const { account } = useWeb3React();

  const getData = useCallback(async () => {
    const listLpToken = await Promise.all(
      quickswapFarmData.map((item) => getDataToken(item.id, library))
    );

    const tvlPairContextParams = quickswapFarmData.map((item, index) => ({
      reference: item.stakingRewards,
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
    const tvlLpBalance = quickswapFarmData.map((item, index) => ({
      reference: item.stakingRewards,
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
          methodParameters: [item.stakingRewards],
        },
      ],
    }));
    const resultTVL = await multicall.call(tvlLpBalance);
    const listTotalSupply = convertSingleResultCall(resultTVL.results).map(
      (big) => new BigNumber(big[0].hex).toFixed()
    );
    const listTVL = await Promise.all(
      quickswapFarmData.map((item, index) =>
        calculateTVL(
          listLpToken[index],
          item.stakingRewards,
          factoryContract,
          library,
          listTotalSupply[index],
          convertedPairTVL[index].pairToken0Usdt[0],
          convertedPairTVL[index].pairToken1Usdt[0],
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
      const lpDepositedContext = quickswapFarmData.map((item) => ({
        reference: item.stakingRewards,
        contractAddress: item.stakingRewards,
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
            methodParameters: [account],
          },
        ],
      }));
      const lpCallContext = listLpToken.map((item) =>
        convertMultipleCallParams(item.address, account)
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
        quickswapFarmData.map((item, index) =>
          convertLPtoUSDT(
            factoryContract,
            listLpToken[index],
            convertDeposited[index],
            library
          )
        )
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
  }, [account]);

  useEffect(() => {
    getData();
  }, [getData]);

  return quickSwapFarms;
};

export default useQuickSwapFarms;
