import web3 from 'web3'

export const FACTORY_ADDRESS = '0x8aaa5e259f74c8114e0a471d9f2adfc66bfe09ed';
const zero_address = '0x0000000000000000000000000000000000000000';

export function getLibrary(provider, connector) {
  return new web3(provider);
}

export function isValidAddress(address) {
  return address!==zero_address &&  web3.utils.isAddress(address)
}

export function moneyFormatter(num, digits = 2) {
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return num >= item.value;
  });
  return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}