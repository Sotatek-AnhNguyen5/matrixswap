import styled from "styled-components";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import React, { useState, useMemo } from "react";
import useFarmUserInfo from "../../hooks/useFarmUserInfo";
import { toast } from "react-toastify";
import BigNumber from "bignumber.js";
import { find, isEmpty } from "lodash";
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

const WrappedDataColumn = styled.div`
  display: flex;
  justify-content: space-between;
`;

const DataColumn = styled.div`
  align-items: center;
  justify-content: space-between;
  padding: 10px;

  div {
    padding: 10px;
  }
`;

const TableRecordSushi = ({ data, filterKey, type }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isZap, setIsZap] = useState(true);
  const farmAddress = data.rewardAddress;
  const tvl = data.valueLockedUSD;
  const rewardTokens = data.rewardTokens;
  const apr = useCalculateApr(farmAddress, tvl, "sushi", rewardTokens[0]);
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
        [
          lpToken.token0.symbol.toUpperCase(),
          lpToken.token1.symbol.toUpperCase(),
        ].indexOf(e.value.toUpperCase()) !== -1
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
        <Td>{!isSelected ? <FaAngleRight /> : <FaAngleDown />}</Td>
      </Tr>
      {isSelected && (
        <Tr isShow={isShow} style={{ marginTop: "10px" }}>
          <TdSecond colSpan={3}>
            <WrappedDataColumn>
              <DataColumn style={{ textAlign: "left" }}>
                <div>Start date</div>
                <div>Your Staked</div>
                <div>Reward</div>
              </DataColumn>
              <DataColumn>
                <ValueSide> {convertDate(startStakeDate)} </ValueSide>
                <ValueSide>{balance}</ValueSide>
                <ValueSide>
                  {reward} ADDY
                  <SubmitButton
                    disabled={new BigNumber(reward).isZero()}
                    label={"Claim"}
                    loading={loadingGetReward}
                    labelLoading={"Claiming"}
                    onClick={onGetReward}
                    style={{ marginLeft: "20px" }}
                  />
                </ValueSide>
              </DataColumn>
            </WrappedDataColumn>
          </TdSecond>
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
