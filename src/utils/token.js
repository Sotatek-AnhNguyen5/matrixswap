import PairABI from "../abi/QuickSwapPair.json";
import { getTokenAddressFromLp, getTokenInfo } from "./index";
import BigNumber from "bignumber.js";

export const getDataToken = async (address, library) => {
  const lpContract = new library.eth.Contract(PairABI, address);
  const [lpTokenAddress, totalSupply, reserves] = await Promise.all([
    getTokenAddressFromLp(address, library),
    lpContract.methods.totalSupply().call(),
    lpContract.methods.getReserves().call(),
  ]);
  const [token0, token1] = await Promise.all([
    getTokenInfo(lpTokenAddress.token0Address, library),
    getTokenInfo(lpTokenAddress.token1Address, library),
  ]);
  return {
    token0,
    token1,
    totalSupply,
    reserves,
    address,
  };
};

export const getLPBalance = async (address, library, account) => {
  const lpContract = new library.eth.Contract(PairABI, address);
  const balance = await lpContract.methods.balanceOf(account).call();
  return new BigNumber(balance).div(new BigNumber(10).pow(18)).toFixed();
};

export const convertMultipleCallParams = (pairAddress, account) => {
  return {
    reference: pairAddress,
    contractAddress: pairAddress,
    abi: [
      {
        constant: true,
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    calls: [
      {
        reference: "fooCall",
        methodName: "balanceOf",
        methodParameters: [account],
      },
    ],
  };
};
