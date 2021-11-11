import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import InputNumber from "../../InputNumber";
import IERC20ABI from "../../../abi/IERC20ABI.json";
import { useWeb3React } from "@web3-react/core";
import BigNumber from "bignumber.js";
import LpABI from "../../../abi/stakingRewardABi.json";
import ZapABI from "../../../abi/zapABI.json";
import { toast } from "react-toastify";
import useEstimateOutput from "../../../hooks/useEstimateOutput";
import InputRange from "react-input-range";
import useCheckZapToken from "../../../hooks/useCheckZapToken";
import { ADDRESS_ZAP } from "../../../const";

const FakeInput = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;

  box-sizing: border-box;
  border-radius: 6px;
  padding: 15px 20px;
  font-size: 20px;
  border: solid 1px white;
  background-color: #333333;
  font-weight: 500;
`;

const InputWrapper = styled.div`
  margin-top: 10px;
`;

const BalanceRow = styled.div`
  display: flex;
  margin-top: 10px;
  justify-content: space-between;
`;

const ZapButton = styled.button`
  padding: 10px 20px;
  min-width: 100px;
  background-color: #3ee046;
  margin-top: 10px;
  margin-left: auto;
  border: 0;
  cursor: pointer;
`;

const ZapTab = ({
  stakingToken,
  token0,
  token1,
  totalSupplyStakingToken,
  reserves,
  totalSupply,
  changeTab,
  refreshStakeBalance,
}) => {
  const [selectedToken, setSelectedToken] = useState({});
  const [tokenBalance, setTokenBalance] = useState(0);
  const [lpBalance, setLpBalance] = useState(0);
  const [allowance, setAllowance] = useState(0);
  const { library, account } = useWeb3React();
  const [amount, onChangeAmount] = useState(0);
  const isZapAble = useCheckZapToken(selectedToken, token0, token1);
  const [zapValuePercent, setZapValuePercent] = useState(0);
  const estimateOutput = useEstimateOutput(
    amount,
    token0,
    selectedToken,
    reserves,
    totalSupplyStakingToken,
    token1,
  );
  const inputRef = useRef();

  const getLpBalance = async () => {
    const stakingTokenContract = new library.eth.Contract(LpABI, stakingToken);
    const balance = await stakingTokenContract.methods
      .balanceOf(account)
      .call();
    const balanceToNumber = new BigNumber(balance)
      .div(new BigNumber(10).pow(18))
      .toFixed();
    setLpBalance(balanceToNumber);
  };

  const getBalance = async () => {
    if (selectedToken.address) {
      const tokenContract = new library.eth.Contract(
        IERC20ABI,
        selectedToken.address
      );
      const balance = await tokenContract.methods.balanceOf(account).call();
      const balanceToNumber = new BigNumber(balance)
        .div(new BigNumber(10).pow(selectedToken.decimals))
        .toFixed();
      setTokenBalance(balanceToNumber);
    }
  };

  const onChangeRangeStake = (percent) => {
    const value = new BigNumber(tokenBalance).times(percent).div(100).toFixed();
    onChangeAmount(value);
    inputRef.current.value = value;
    setZapValuePercent(percent);
  };

  const onZap = async () => {
    const zapContract = new library.eth.Contract(ZapABI.abi, ADDRESS_ZAP);
    const value = new BigNumber(amount)
      .times(new BigNumber(10).pow(selectedToken.decimals))
      .toFixed();
    const fromAddress = selectedToken.address;
    const toAddress = stakingToken;
    try {
      zapContract.methods
        .zapInToken (fromAddress, value, toAddress, account)
        .send({ from: account })
        .once("receipt", function (e) {
          console.log(e);
          toast("Send Tx successfully!");
        })
        .once("confirmation", async function (e) {
          await getBalance();
          await getLpBalance();
          refreshStakeBalance();
          changeTab();
          toast.success("Zap successfully!");
        });
    } catch (e) {
      console.log(e);
      toast("Zap failed!");
    }
  };

  const onApprove = () => {
    const tokenContract = new library.eth.Contract(
      IERC20ABI,
      selectedToken.address
    );
    const value = new BigNumber(99999999)
      .times(new BigNumber(10).pow(selectedToken.decimals))
      .toFixed();
    try {
      tokenContract.methods
        .approve(ADDRESS_ZAP, value)
        .send({ from: account })
        .once("receipt", function (e) {
          console.log(e);
          toast("Send approve successfully");
        })
        .once("confirmation", function () {
          setAllowance(value);
        });
    } catch (e) {
      console.log(e);
      toast("Approve failed");
    }
  };

  useEffect(() => {
    getBalance();
  }, [selectedToken.address]);

  useEffect(() => {
    const getAllowance = async () => {
      if (selectedToken.address) {
        const tokenContract = new library.eth.Contract(
          IERC20ABI,
          selectedToken.address
        );
        const allowanceAmount = await tokenContract.methods
          .allowance(account, ADDRESS_ZAP)
          .call();
        setAllowance(allowanceAmount);
      }
    };
    getAllowance();
  }, [selectedToken.address]);

  useEffect(() => {
    if (stakingToken) {
      getLpBalance();
    }
  }, [stakingToken]);

  return (
    <div>
      <BalanceRow>
        <span>From Token</span>
        <span>Balance: {tokenBalance}</span>
      </BalanceRow>
      <InputWrapper>
        <InputNumber
          withSelectToken={true}
          onSetSelectedToken={setSelectedToken}
          onChange={onChangeAmount}
          inputRef={inputRef}
        />
      </InputWrapper>
      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
        <InputRange
          onChange={(e) => onChangeRangeStake(e)}
          maxValue={100}
          minValue={0}
          value={zapValuePercent}
          formatLabel={(value) => `${value}%`}
        />
      </div>
      <BalanceRow>
        <span>To LP</span>
        <span>Balance: {lpBalance}</span>
      </BalanceRow>
      <div style={{ marginTop: "10px" }}>
        <FakeInput>{estimateOutput}</FakeInput>
      </div>
      <small style={{ color: "red" }}>
          {!isZapAble && "Cannot zap this token."}
        </small>
      <div style={{ display: "flex" }}>
        {new BigNumber(allowance).isZero() ? (
          <ZapButton onClick={() => onApprove()}>Approve</ZapButton>
        ) : (
          <ZapButton onClick={() => onZap()}>Zap</ZapButton>
        )}
      </div>
    </div>
  );
};

export default ZapTab;
