import styled from "styled-components";
import { FaAngleDown, FaAngleLeft } from "react-icons/fa";
import { useState, useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import ZapTab from "./Zap";
import FarmingTab from "./Farming";
import useGetPairToken from "../../hooks/useGetPairToken";
import useFarmUserInfo from "../../hooks/useReward";
import useTVL from "../../hooks/useTVL";
import useCalculateApr from "../../hooks/useCalculatedApr";
import { toast } from "react-toastify";
import FarmABI from "../../abi/FarmABI.json";
import BigNumber from "bignumber.js";
import { startsWith } from "lodash";

const Td = styled.td`
  text-align: center;
  padding: 5px 10px;
  svg {
    cursor: pointer;
    font-size: 30px;
  }
  &:first-child {
    border-top-left-radius: 10px;
    border-bottom-left-radius: 10px;
  }
`;

const TdSecond = styled(Td)`
  vertical-align: baseline;
`;

const Tr = styled.tr`
  background-color: #333333;
  border-radius: 10px;
  display: ${props => props.isShow ? 'table-row' : 'none'}
`;

const DataRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
`;

const ValueSide = styled.div`
  text-align: left;
  width: 30%;
  white-space: nowrap;
`;
const ClaimButton = styled.button`
  background-color: ${(props) => (props.isActive ? "#3ee046" : "#999999")};
  color: ${(props) => (props.isActive ? "#fff" : "#564c52")};
  font-size: 20px;
  padding: 4px 8px;
  margin-left: 30px;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
`;

const TabLabel = styled.div`
  padding: 10px;
  font-weight: 500;
  color: ${(props) => (props.isActive ? "#3ee046" : "#656565")};
  cursor: pointer;
  &:hover {
    color: #3ee046;
  }
`;

const TableRecord = ({ data, filterKey }) => {
  const { library, account } = useWeb3React();
  const [isSelected, setIsSelected] = useState(false);
  const [isZap, setIsZap] = useState(true);
  const [index, setIndex] = useState(0);
  const farmAddress = data.stakingRewards;
  const [
    token0,
    token1,
    stakingToken,
    reserves,
    totalSupply,
    totalSupplyStakingToken,
  ] = useGetPairToken(farmAddress);

  const usdtValue = useTVL(
    token0,
    token1,
    totalSupply,
    totalSupplyStakingToken
  );
  const [reward, balance, refreshFarmInfo, startStakeDate] = useFarmUserInfo(
    farmAddress,
    index
  );
  const apr = useCalculateApr(farmAddress, usdtValue);

  const daily = useMemo(() => {
    return new BigNumber(apr).div(365).toFixed(2);
  }, [apr]);
  const onGetReward = async () => {
    const farmContract = new library.eth.Contract(FarmABI, farmAddress);
    farmContract.methods
      .getReward()
      .send({ from: account })
      .once("hash", function (e) {
        toast("Send tx get reward successfully!");
      })
      .once("confirmation", function (e) {
        toast("get reward successfully!");
        setIndex((e) => (e += 1));
      });
  };

  const isShow = useMemo(() => {
    const wrappedTokenSymbol = `${token0.symbol}-${token1.symbol}`;
    return (
      !filterKey ||
      startsWith(token0.symbol, filterKey) ||
      startsWith(token1.symbol, filterKey) ||
      startsWith(wrappedTokenSymbol, filterKey)
    );
  }, [filterKey]);

  return (
    <>
      <Tr isShow={isShow} onClick={() => setIsSelected((value) => !value)}>
        <Td style={{ textAlign: "left", paddingLeft: "20px" }}>
          {token0.symbol} - {token1.symbol}
        </Td>
        <Td>{apr} %</Td>
        <Td>{daily} %</Td>
        <Td>{usdtValue} $</Td>
        <Td>{!isSelected ? <FaAngleLeft /> : <FaAngleDown />}</Td>
      </Tr>
      {isSelected && (
        <Tr isShow={isShow} style={{ marginTop: "10px" }}>
          <TdSecond colSpan={2}>
            <DataRow>
              <div>Start date</div>
              <ValueSide> {startStakeDate} </ValueSide>
            </DataRow>
            <DataRow>
              <div>Your Staked</div>
              <ValueSide>{balance}</ValueSide>
            </DataRow>
            <DataRow>
              <div>Reward</div>
              <ValueSide>
                {reward}{" "}
                <ClaimButton
                  disabled={new BigNumber(reward).isZero()}
                  isActive={!new BigNumber(reward).isZero()}
                  onClick={() => onGetReward()}
                >
                  Claim
                </ClaimButton>
              </ValueSide>
            </DataRow>
          </TdSecond>
          <td />
          <TdSecond colSpan={2}>
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <TabLabel isActive={isZap} onClick={() => setIsZap(true)}>
                Zap
              </TabLabel>
              <TabLabel isActive={!isZap} onClick={() => setIsZap(false)}>
                Farming
              </TabLabel>
            </div>
            <div style={{ padding: "10px" }}>
              {isZap ? (
                <ZapTab
                  stakingToken={stakingToken}
                  totalSupplyStakingToken={totalSupplyStakingToken}
                  totalSupply={totalSupply}
                  reserves={reserves}
                  token0={token0}
                  changeTab={() => setIsZap(false)}
                  refreshStakeBalance={refreshFarmInfo}
                />
              ) : (
                <FarmingTab
                  stakingToken={stakingToken}
                  reserves={reserves}
                  farmAddress={data.stakingRewards}
                  token0={token0}
                  token1={token1}
                  stakedBalance={balance}
                  refreshStakedBalance={refreshFarmInfo}
                />
              )}
            </div>
          </TdSecond>
          {/* <TdSecond/> */}
        </Tr>
      )}
    </>
  );
};

export default TableRecord;
