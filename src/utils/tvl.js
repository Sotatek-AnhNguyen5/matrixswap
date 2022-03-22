import {
  BASE_TOKENS_SORT,
  QUICKSWAP_USDT_WETH_PAIR,
  USDC_TOKEN,
  USDT_ADDRESS,
  WETH_ADDRESS,
  WMATIC_TOKEN,
} from "../const";
import QuickSwapPair from "../abi/QuickSwapPair.json";
import BigNumber from "bignumber.js";
import {isValidAddress} from "./index";
import {find} from "lodash";

export const rateConvert = {
  WETHtoUSDT: "",
};

export const tokenToWMATIC = async (
  amount,
  library,
  token,
  factoryContract
) => {
  if (token.address.toLowerCase() === WMATIC_TOKEN.address.toLowerCase()) {
    return amount;
  }
  const pairWMATIC = await factoryContract.methods
    .getPair(WMATIC_TOKEN.address, token.address)
    .call();

  const pairContract = new library.eth.Contract(QuickSwapPair, pairWMATIC);

  const [token0, reserves] = await Promise.all([
    pairContract.methods.token0().call(),
    pairContract.methods.getReserves().call(),
  ]);

  const tokenRate =
    token0.toLowerCase() === WMATIC_TOKEN.address.toLowerCase()
      ? new BigNumber(
        new BigNumber(reserves._reserve0).div(new BigNumber(10).pow(18))
      ).div(
        new BigNumber(reserves._reserve1).div(
          new BigNumber(10).pow(token.decimals)
        )
      )
      : new BigNumber(
        new BigNumber(reserves._reserve1).div(new BigNumber(10).pow(18))
      ).div(
        new BigNumber(reserves._reserve0).div(
          new BigNumber(10).pow(token.decimals)
        )
      );
  return new BigNumber(amount).times(tokenRate);
};

export const tokenToWeth = async (amount, library, token, factoryContract) => {
  const pairWETH = await factoryContract.methods
    .getPair(WETH_ADDRESS, token.address)
    .call();

  const pairContract = new library.eth.Contract(QuickSwapPair, pairWETH);

  const [token0, reserves] = await Promise.all([
    pairContract.methods.token0().call(),
    pairContract.methods.getReserves().call(),
  ]);

  const tokenRate =
    token0.toLowerCase() === WETH_ADDRESS.toLowerCase()
      ? new BigNumber(reserves._reserve0).div(reserves._reserve1)
      : new BigNumber(reserves._reserve1).div(reserves._reserve0);
  return new BigNumber(amount).times(tokenRate);
};
export const usdtToWETH = async (amount, library) => {
  const pairContract = new library.eth.Contract(
    QuickSwapPair,
    QUICKSWAP_USDT_WETH_PAIR
  );

  const [reserves] = await Promise.all([
    pairContract.methods.getReserves().call(),
  ]);
  const tokenRate = new BigNumber(reserves._reserve0).div(reserves._reserve1);
  return new BigNumber(amount)
    .times(tokenRate)
    .times(new BigNumber(10).pow(-12))
    .toFixed();
};

export const WETHtoUSDT = async (amount, library) => {
  if (rateConvert.WETHtoUSDT) {
    new BigNumber(amount).times(rateConvert.WETHtoUSDT);
  }
  const pairContract = new library.eth.Contract(
    QuickSwapPair,
    QUICKSWAP_USDT_WETH_PAIR
  );

  const [reserves] = await Promise.all([
    pairContract.methods.getReserves().call(),
  ]);
  const tokenRate = new BigNumber(reserves._reserve1).div(reserves._reserve0);
  return new BigNumber(amount).times(tokenRate);
};

export const wMaticToUSDT = async (amount, library) => {
  if (rateConvert.WETHtoUSDT) {
    new BigNumber(amount).times(rateConvert.WETHtoUSDT);
  }
  const pairContract = new library.eth.Contract(
    QuickSwapPair,
    "0x604229c960e5CACF2aaEAc8Be68Ac07BA9dF81c3"
  );

  const [reserves] = await Promise.all([
    pairContract.methods.getReserves().call(),
  ]);
  const tokenRate = new BigNumber(reserves._reserve1).div(reserves._reserve0);
  return new BigNumber(amount)
    .times(tokenRate)
    .times(new BigNumber(10).pow(12));
};

export const calculateTVL = async (
  lpToken,
  farmAddress,
  factoryContract,
  library,
  totalSupply,
  pairToken0UsdtAddress,
  pairToken1UsdtAddress
) => {
  try {
    if (
      [lpToken.token0.address.toLowerCase(), lpToken.token1.address.toLowerCase()].indexOf(USDC_TOKEN.address.toLowerCase()) !== -1 ||
      [lpToken.token0.address.toLowerCase(), lpToken.token1.address.toLowerCase()].indexOf(USDT_ADDRESS.toLowerCase()) !== -1
    ) {
      const isToken0Usdt = [USDC_TOKEN.address.toLowerCase(), USDT_ADDRESS.toLowerCase()].indexOf(lpToken.token0.address.toLowerCase()) !== -1
      const tokenHold = new BigNumber(totalSupply)
        .div(lpToken.totalSupply)
        .times(
          new BigNumber(
            isToken0Usdt
              ? lpToken.reserves._reserve0
              : lpToken.reserves._reserve1
          ).div(new BigNumber(10).pow(6))
        );
      return new BigNumber(tokenHold).times(2);
    }
    if (
      isValidAddress(pairToken1UsdtAddress) ||
      isValidAddress(pairToken0UsdtAddress)
    ) {
      let isUsedToken0;
      const token0IsPopular = !!find(BASE_TOKENS_SORT, e => {
        return e.address.toLowerCase() === lpToken.token0.address.toLowerCase();
      })
      const token1IsPopular = !!find(BASE_TOKENS_SORT, e => {
        return e.address.toLowerCase() === lpToken.token1.address.toLowerCase();
      })
      if (
        token0IsPopular &&
        isValidAddress(pairToken0UsdtAddress)
      ) {
        isUsedToken0 = true;
      } else if (
        token1IsPopular &&
        isValidAddress(pairToken1UsdtAddress)
      ) {
        isUsedToken0 = false;
      } else {
        isUsedToken0 = isValidAddress(pairToken0UsdtAddress);
      }
      const pairContract = new library.eth.Contract(
        QuickSwapPair,
        isUsedToken0 ? pairToken0UsdtAddress : pairToken1UsdtAddress
      );

      const [reverse] = await Promise.all([
        pairContract.methods.getReserves().call(),
      ]);
      const tokenRate = new BigNumber(reverse._reserve1).div(reverse._reserve0);
      const tokenHold = new BigNumber(totalSupply)
        .div(lpToken.totalSupply)
        .times(
          isUsedToken0 ? lpToken.reserves._reserve0 : lpToken.reserves._reserve1
        );
      const totalSupplyUsdt = new BigNumber(tokenHold)
        .div(new BigNumber(10).pow(6))
        .times(tokenRate)
        .times(2);

      return totalSupplyUsdt.toFixed(6);
    }

    let [pair0, pair1] = await Promise.all([
      factoryContract.methods
        .getPair(lpToken.token0.address, WETH_ADDRESS)
        .call(),
      factoryContract.methods
        .getPair(lpToken.token1.address, WETH_ADDRESS)
        .call(),
    ]);

    if (isValidAddress(pair0) || isValidAddress(pair1)) {
      const isUsedToken0 = isValidAddress(pair0);
      const usedToken = isUsedToken0 ? lpToken.token0 : lpToken.token1;
      const tokenHold = new BigNumber(totalSupply)
        .div(lpToken.totalSupply)
        .times(
          isUsedToken0 ? lpToken.reserves._reserve0 : lpToken.reserves._reserve1
        );
      const totalSupplyToETH = await tokenToWeth(
        tokenHold,
        library,
        usedToken,
        factoryContract
      );
      const totalSupplyToUSDT = await WETHtoUSDT(totalSupplyToETH, library);
      return totalSupplyToUSDT
        .times(2)
        .div(new BigNumber(10).pow(6))
        .toFixed(6);
    }
  } catch (e) {
    console.log(e);
    return 0;
  }
};
