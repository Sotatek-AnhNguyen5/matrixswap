import web3 from "web3";
import moment from "moment";
import { Keccak } from "sha3";
import {findIndex} from "lodash";

export const FACTORY_ADDRESS = "0x8aaa5e259f74c8114e0a471d9f2adfc66bfe09ed";
const zero_address = "0x0000000000000000000000000000000000000000";

export function getLibrary(provider, connector) {
  return new web3(provider);
}

export function isValidAddress(address) {
  return address !== zero_address && web3.utils.isAddress(address);
}

export function unWrappedTokenSymbol(symbol) {
  return symbol === 'WETH' ? 'ETH' : symbol;
}

export function moneyFormatter(num, digits = 2) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
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
  return hash.digest({ buffer: Buffer.alloc(32)});;
}

export const removeStakeInfoFromStorage = (farmAddress) => {
  const stakeInfo = JSON.parse(localStorage.getItem("stakeInfo")) || [];
  const farmIndex = findIndex(stakeInfo, { farmAddress });
  if (farmIndex !== -1) {
    stakeInfo.splice(farmIndex, 1)
    localStorage.setItem(
      "stakeInfo",
      JSON.stringify(stakeInfo)
    );
  }
};