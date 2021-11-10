import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import ERC20ABI from "../abi/IERC20ABI.json";
import FarmABI from "../abi/FarmABI.json";
import StakingRewardABI from "../abi/stakingRewardABi.json";

const useGetPairToken = (FarmAddress) => {
  const [token0, setToken0] = useState({});
  const [token1, setToken1] = useState({});
  const [totalSupply, setTotalSupply] = useState(0);
  const [totalSupplyStakingToken, setTotalSupplyStakingToken] = useState(0);
  const [reserves, setReserves] = useState(0);
  const [stakingToken, setStakingToken] = useState("");
  const { library } = useWeb3React();

  useEffect(() => {
    const getData = async () => {
      const farmContract = new library.eth.Contract(FarmABI, FarmAddress);
      const [stakingTokenAddress, totalSupplyAmount] = await Promise.all([
        farmContract.methods.stakingToken().call(),
        farmContract.methods.totalSupply().call(),
      ]);
      setStakingToken(stakingTokenAddress);
      setTotalSupply(totalSupplyAmount);
      const stakingTokenContract = new library.eth.Contract(
        StakingRewardABI,
        stakingTokenAddress
      );
      const [token0, token1, reserves, totalSupplyST] = await Promise.all([
        stakingTokenContract.methods.token0().call(),
        stakingTokenContract.methods.token1().call(),
        stakingTokenContract.methods.getReserves().call(),
        stakingTokenContract.methods.totalSupply().call(),
      ]);
      setReserves(reserves);
      setTotalSupplyStakingToken(totalSupplyST);
      const [token0Info, token1Info] = await Promise.all([
        getTokenInfo(token0, library),
        getTokenInfo(token1, library),
      ]);
      token0Info.reserves = reserves._reserve0;
      token1Info.reserves = reserves._reserve1;
      setToken0(token0Info);
      setToken1(token1Info);
    };
    getData();
  }, [FarmAddress]);

  return [token0, token1, stakingToken, reserves, totalSupply, totalSupplyStakingToken];
};

const getTokenInfo = async (address, library) => {
  const token0Contract = new library.eth.Contract(ERC20ABI, address);
  const [name, symbol, decimals] = await Promise.all([
    token0Contract.methods.name().call(),
    token0Contract.methods.symbol().call(),
    token0Contract.methods.decimals().call(),
  ]);

  return {
    name,
    symbol,
    decimals,
    address,
  };
};

export default useGetPairToken;
