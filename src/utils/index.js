import web3 from 'web3'

export const FACTORY_ADDRESS = '0x8aaa5e259f74c8114e0a471d9f2adfc66bfe09ed';

export function getLibrary(provider, connector) {
  return new web3(provider);
}

