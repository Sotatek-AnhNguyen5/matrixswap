import { useState, useEffect } from "react";
import QuickSwapFactoryABI from "../abi/quickswapFactoryABI.json";
import QuickSwapPair from "../abi/QuickSwapPair.json";
import { useWeb3React } from "@web3-react/core";

const QUICKSWAP_FACTORY_ADDRESS = "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32";
const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";


const useConvertToUsdt = (tokenAddress, amount) => {
  const { library } = useWeb3React();
  const [value, setValue] = useState(0);

  useEffect(() => {
    const getData = async () => {

      const factoryContract = new library.eth.Contract(
        QuickSwapFactoryABI,
        QUICKSWAP_FACTORY_ADDRESS
      );
        
      const pairAddress = await factoryContract.methods.getPair(
        tokenAddress,
        USDT_ADDRESS
      );
      const pairContract = new library.eth.Contract(QuickSwapPair, pairAddress);
      const [token0, reverse] = await Promise.all([
        pairContract.methods.token0().call(),
        pairContract.methods.getReserves().call(),
      ]);
      console.log(token0, reverse);
    };
    // getData();
  }, [library]);
  return value;
};

export default useConvertToUsdt;
