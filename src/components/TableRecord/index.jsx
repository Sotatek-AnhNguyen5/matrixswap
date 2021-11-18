import styled from "styled-components";
import { FaAngleDown, FaAngleLeft } from "react-icons/fa";
import React, { useState, useMemo } from "react";
import ZapTab from "./Zap";
import FarmingTab from "./Farming";
import useGetPairToken from "../../hooks/useGetPairToken";
import useFarmUserInfo from "../../hooks/useFarmUserInfo";
import useTVL from "../../hooks/useTVL";
import useCalculateApr from "../../hooks/useCalculatedApr";
import { toast } from "react-toastify";
import BigNumber from "bignumber.js";
import {find, isEmpty} from "lodash";
import { convertDate, moneyFormatter } from "../../utils";
import SubmitButton from "../SubmitButton";
import useGetRewardCallback from "../../hooks/useGetRewardCallback";
import useTokenBalance from "../../hooks/useTokenBalance";

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
  a {
    color: white;
    text-decoration: none;
  }
`;

const TdSecond = styled(Td)`
  vertical-align: baseline;
`;

const Tr = styled.tr`
  background-color: #333333;
  border-radius: 10px;
  display: ${(props) => (props.isShow ? "table-row" : "none")};
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

const TabLabel = styled.div`
  padding: 10px;
  font-weight: 500;
  color: ${(props) => (props.isActive ? "#3ee046" : "#656565")};
  cursor: pointer;

  &:hover {
    color: #3ee046;
  }
`;

const TableRecord = ({ data, filterKey, type }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isZap, setIsZap] = useState(true);
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
  const [reward, balance, refreshFarmInfo, startStakeDate] =
    useFarmUserInfo(farmAddress);
  const [lpBalance, getLpBalance] = useTokenBalance(stakingToken);

  const apr = useCalculateApr(farmAddress, usdtValue);

  const daily = useMemo(() => {
    return new BigNumber(apr).div(365).toFixed(2);
  }, [apr]);

  const onFinishGetReward = async () => {
    await refreshFarmInfo();
    toast("get reward successfully!");
  };
  const [onGetReward, loadingGetReward] = useGetRewardCallback(
    farmAddress,
    "quick",
    onFinishGetReward
  );

  const isShow = useMemo(() => {
    const isExists = find(
      filterKey,
      (e) =>
        e.value === type ||
        [token0.symbol, token1.symbol].indexOf(e.value.toUpperCase()) !== -1
    );
    return isEmpty(filterKey) || isExists;
  }, [filterKey]);

  return (
    <>
      <Tr isShow={isShow} onClick={() => setIsSelected((value) => !value)}>
        <Td style={{ textAlign: "left", paddingLeft: "20px" }}>
          <a
            target="_blank"
            href={`https://polygonscan.com/address/${farmAddress}`}
          >
            {token0.symbol} - {token1.symbol}
          </a>
        </Td>
        <Td>{apr} %</Td>
        <Td>{daily} %</Td>
        <Td>{moneyFormatter(usdtValue)} $</Td>
        <Td>{isSelected ? <FaAngleLeft /> : <FaAngleDown />}</Td>
      </Tr>
      {isSelected && (
        <Tr isShow={isShow} style={{ marginTop: "10px" }}>
          <TdSecond colSpan={2}>
            <DataRow>
              <div>Start date</div>
              <ValueSide> {convertDate(startStakeDate)} </ValueSide>
            </DataRow>
            <DataRow>
              <div>Your Staked</div>
              <ValueSide>{balance}</ValueSide>
            </DataRow>
            <DataRow>
              <div>Reward</div>
              <ValueSide>
                {reward} dQUICK
                <SubmitButton
                  disabled={new BigNumber(reward).isZero()}
                  label={"Claim"}
                  loading={loadingGetReward}
                  labelLoading={"Claiming"}
                  onClick={onGetReward}
                  style={{ marginLeft: "20px" }}
                />
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
                  token1={token1}
                  changeTab={() => setIsZap(false)}
                  refreshStakeBalance={refreshFarmInfo}
                  type={"quick"}
                  lpBalance={lpBalance}
                  getLpBalance={getLpBalance}
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
                  type={"quick"}
                  lpBalance={lpBalance}
                  getLpBalance={getLpBalance}
                />
              )}
            </div>
          </TdSecond>
        </Tr>
      )}
    </>
  );
};

export default TableRecord;
