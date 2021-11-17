import styled from "styled-components";
import { FaAngleDown, FaAngleLeft } from "react-icons/fa";
import React, { useState, useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import useFarmUserInfo from "../../hooks/useFarmUserInfo";
import { toast } from "react-toastify";
import FarmABI from "../../abi/FarmABI.json";
import BigNumber from "bignumber.js";
import {find, isEmpty, startsWith} from "lodash";
import { convertDate, moneyFormatter } from "../../utils";
import useLpTokenInfo from "../../hooks/useLpTokenInfo";
import useCalculateApr from "../../hooks/useCalculatedApr";
import ZapTab from "../TableRecord/Zap";
import FarmingTab from "../TableRecord/Farming";
import useGetRewardCallback from "../../hooks/useGetRewardCallback";
import SubmitButton from "../SubmitButton";
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

const TableRecordSushi = ({ data, filterKey, type }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isZap, setIsZap] = useState(true);
  const farmAddress = data.rewardAddress;
  const tvl = data.valueLockedUSD;
  const apr = useCalculateApr(farmAddress, tvl, "sushi");
  const daily = useMemo(() => {
    return new BigNumber(apr).div(365).toFixed(2);
  }, [apr]);

  const lpToken = useLpTokenInfo(data.tokenAddress);
  const [lpBalance, getLpBalance] = useTokenBalance(data.tokenAddress);
  const [reward, balance, refreshFarmInfo, startStakeDate] = useFarmUserInfo(
    farmAddress,
    "sushi",
    data.poolIndex
  );

  const onFinishGetReward = async () => {
    await refreshFarmInfo();
    toast("get reward successfully!");
  };

  const [onGetReward, loadingGetReward] = useGetRewardCallback(
    farmAddress,
    "sushi",
    onFinishGetReward
  );

  const isShow = useMemo(() => {
    const isExists = find(
      filterKey,
      (e) =>
        e.value === type ||
        [lpToken.token0.symbol.toUpperCase(), lpToken.token1.symbol.toUpperCase()].indexOf(
          e.value.toUpperCase()
        ) !== -1
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
            {lpToken.token0.symbol} - {lpToken.token1.symbol}
          </a>
        </Td>
        <Td>{apr} %</Td>
        <Td>{daily} %</Td>
        <Td>{moneyFormatter(tvl)} $</Td>
        <Td>{!isSelected ? <FaAngleLeft /> : <FaAngleDown />}</Td>
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
                {reward} Sushi
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
                  stakingToken={lpToken.address}
                  totalSupplyStakingToken={lpToken.totalSupply}
                  reserves={lpToken.reserves}
                  token0={lpToken.token0}
                  token1={lpToken.token1}
                  changeTab={() => setIsZap(false)}
                  refreshStakeBalance={refreshFarmInfo}
                  type={"sushi"}
                  lpBalance={lpBalance}
                  getLpBalance={getLpBalance}
                />
              ) : (
                <FarmingTab
                  stakingToken={lpToken.address}
                  farmAddress={farmAddress}
                  token0={lpToken.token0}
                  token1={lpToken.token1}
                  stakedBalance={balance}
                  refreshStakedBalance={refreshFarmInfo}
                  type={"sushi"}
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

export default TableRecordSushi;
