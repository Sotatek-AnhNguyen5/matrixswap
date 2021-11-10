import web3 from 'web3'

export const FACTORY_ADDRESS = '0x8aaa5e259f74c8114e0a471d9f2adfc66bfe09ed';
const zero_address = '0x0000000000000000000000000000000000000000';

export function getLibrary(provider, connector) {
  return new web3(provider);
}

export function isValidAddress(address) {
  return address!==zero_address &&  web3.utils.isAddress(address)
}