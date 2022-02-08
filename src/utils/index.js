import web3 from "web3";
import moment from "moment";
import { Keccak } from "sha3";
import { find, findIndex } from "lodash";
import ERC20ABI from "../abi/IERC20ABI.json";
import BigNumber from "bignumber.js";

const zero_address = "0x0000000000000000000000000000000000000000";

export function getLibrary(provider, connector) {
  return new web3(provider);
}

export function isValidAddress(address) {
  return address !== zero_address && web3.utils.isAddress(address);
}

export function unWrappedTokenSymbol(symbol) {
  return symbol === "WETH" ? "ETH" : symbol;
}

export function moneyFormatter(num, digits = 2) {
  const newValue = new BigNumber(num);
  if (newValue.lt(1000)) {
    return newValue.toFixed(2);
  }

  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "B" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" },
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return num >= item.value;
    });
  return item
    ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
    : "0";
}

export function rewardFormat(num, digits = 7) {
  return new BigNumber(num).toFormat(digits).replace(/\.0+$/, "");
}

export function convertDate(input) {
  if (!input) {
    return "-";
  }
  const utcTime = moment(input).utc();
  const format = "D MMM YYYY h:m";
  return `${utcTime.format(format, format)} UTC`;
}

export function hashSha3Tokens(token0, token1) {
  const hash = new Keccak(256);
  hash.update(token0 + token1);
  return hash.digest({ buffer: Buffer.alloc(32) });
}

export const removeStakeInfoFromStorage = (farmAddress, pId) => {
  const stakeInfo = JSON.parse(localStorage.getItem("stakeInfo")) || [];
  const farmIndex = findIndex(stakeInfo, (e) => {
    return (
      e.farmAddress.toLowerCase() === farmAddress.toLowerCase() && e.pId === pId
    );
  });
  if (farmIndex !== -1) {
    stakeInfo.splice(farmIndex, 1);
    localStorage.setItem("stakeInfo", JSON.stringify(stakeInfo));
  }
};

export const getDataFromStorage = (keyType, predicate) => {
  const dataInfo = JSON.parse(sessionStorage.getItem(keyType)) || [];
  return find(dataInfo, predicate);
};

export const putDataToStorage = (keyType, data) => {
  const dataInfo = JSON.parse(sessionStorage.getItem(keyType)) || [];
  sessionStorage.setItem(keyType, JSON.stringify([...dataInfo, data]));
  return true;
};

export const getTokenInfo = async (address, library) => {
  const dataFromStorage = getDataFromStorage("tokenInfo", { address });
  if (dataFromStorage) {
    const { name, decimals, symbol, address } = dataFromStorage;
    return {
      name,
      decimals,
      symbol,
      address,
    };
  }
  const token0Contract = new library.eth.Contract(ERC20ABI, address);
  const [name, symbol, decimals] = await Promise.all([
    token0Contract.methods.name().call(),
    token0Contract.methods.symbol().call(),
    token0Contract.methods.decimals().call(),
  ]);
  const data = {
    name,
    symbol,
    decimals,
    address,
  };
  putDataToStorage("tokenInfo", data);
  return data;
};

export const formatSmallNumber = (amount) => {
  if (amount.includes(".")) {
    const amountSplit = amount.split(".");
    const amountAfterZero = amountSplit[1].split("");
    let number = 0;
    let formattedNumber = "";
    amountAfterZero.forEach((e) => {
      if (number >= 2) return;
      if (e !== "0") {
        number += 1;
      }
      formattedNumber += e;
    });
    return `${amountSplit[0]}.${formattedNumber}`;
  }
  return amount;
};

export const formatNumber = (amount) => {
  if (amount.includes(".")) {
    const amountSplit = amount.split(".");
    const arrayNumberAfterDot = amountSplit[1].split("");
    if (arrayNumberAfterDot.length <= 2) {
      return amount;
    }
    return "0.00...";
  }
  return amount;
};

export const formatCurrency = (amount, decimals = 6) => {
  const amountBig = new BigNumber(amount);
  if (amountBig.isZero()) {
    return "0";
  }
  return new BigNumber(amount).toFixed(decimals, 1);
};

export const formatBalance = (amount) => {
  const amountBig = new BigNumber(amount);
  if (!amountBig.isZero() && amountBig.lt(0.000001)) {
    return "0.000000";
  }
  return amountBig.toFormat(6, 1).replace(/\.0+$/, "");
};

export const formatTokenBalance = (amount) => {
  if(!amount) {
    return "0"
  }
  const amountBig = new BigNumber(amount);
  if (!amountBig.isZero() && amountBig.lt(0.000001)) {
    return "0.000000...";
  }
  return new BigNumber(amount).toFixed(6, 1).replace(/\.0+$/, "");
};
