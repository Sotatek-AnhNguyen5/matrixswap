import styled from "styled-components";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";
import React, { useState, useMemo, useEffect } from "react";
import useFarmUserInfo from "../../hooks/useFarmUserInfo";
import { toast } from "react-toastify";
import BigNumber from "bignumber.js";
import { find, isEmpty, findIndex } from "lodash";
import { convertDate, moneyFormatter } from "../../utils";
import ZapTab from "../Zap";
import FarmingTab from "../Farming";
import useGetRewardCallback from "../../hooks/useGetRewardCallback";
import SubmitButton from "../SubmitButton";
import useTokenBalance from "../../hooks/useTokenBalance";
import { FARM_TYPE } from "../../const";
import TokenLogo from "../TokenLogo";
import { FlexRow, GrayLabelText, WhiteLabelText } from "../../theme/components";

const FlexRowData = styled.div`
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  border-radius: 12px;

  &:hover {
    background-color: ${(props) => (props.hover ? "#193034" : "")};
  }

  .farm-data-wrapper {
    width: 100%;
    display: flex;
    padding-bottom: 30px;
    padding-right: 20px;
  }

  .data-wrapper {
    width: 100%;
    display: flex;
    align-items: center;

    .wrapped-token-logo {
      display: flex;
      align-items: center;
      text-align: left;
      width: 100%;

      a {
        color: white;
        text-decoration: none;
        text-align: left;
        //white-space: nowrap;
      }

      div {
        text-align: left;
      }
    }
  }
`;

const DataItem = styled.div`
  text-align: center;
  padding: 20px 20px;
`;

const GrayColumn = styled.div`
  width: 1px;
  height: 20px;
  background-color: ${(props) => props.theme.colorGray};
  margin: 0 20px;
`;

const ZapFarmWrapper = styled.div`
  padding: 20px 30px 50px 20px;
  border: 2px solid #000000;
  border-radius: 12px;
  width: 60%;
`;

const ClaimButton = styled(SubmitButton)`
  background: linear-gradient(90.04deg, #0a1c1f 0.96%, #0f2a2e 91.92%);
  border-radius: 26px;
  padding: 10px 0;
  color: ${(props) => props.theme.colorSecondGreen};
  font-size: 16px;
  margin-left: auto;
  letter-spacing: 2px;
  width: 150px;
`;

const ValueSide = styled.div`
  text-align: left;
  width: 30%;
  white-space: nowrap;
`;

const TabLabel = styled.div`
  font-weight: 400;
  font-size: 20px;
  color: ${(props) =>
    props.isActive ? props.theme.colorMainGreen : props.theme.colorGray};
  cursor: pointer;

  &:hover {
    color: #3ee046;
  }
`;

const FarmType = styled.div`
  font-size: 14px;
  font-weight: 400;
  color: ${(props) => props.theme.colorGray};
  text-align: left;
  text-transform: capitalize;
`;

const TableRecord = ({ data, filterKey, type, setParentData }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isZap, setIsZap] = useState(true);
  const farmAddress = data.rewardAddress || data.stakingRewards;
  const { rewardTokens, poolIndex, apr, tvl, lpToken } = data;
  const [lpBalance, getLpBalance] = useTokenBalance(data.tokenAddress);
  const [reward, stakedBalance, refreshFarmInfo, startStakeDate] =
    useFarmUserInfo(
      farmAddress,
      FARM_TYPE[type],
      poolIndex,
      data.tokenAddress,
      data.rewarderAddress
    );

  const onFinishGetReward = async () => {
    await refreshFarmInfo();
    toast("Get reward successfully!");
  };

  const [onGetReward, loadingGetReward] = useGetRewardCallback(
    farmAddress,
    FARM_TYPE[type],
    onFinishGetReward,
    poolIndex
  );

  const isShow = useMemo(() => {
    const isExists = find(
      filterKey,
      (e) =>
        !lpToken.token0.symbol ||
        e.value === type ||
        [
          lpToken.token0.symbol.toUpperCase(),
          lpToken.token1.symbol.toUpperCase(),
        ].indexOf(e.value.toUpperCase()) !== -1
    );
    return isEmpty(filterKey) || isExists;
  }, [filterKey]);

  const daily = useMemo(() => {
    if (new BigNumber(apr).isZero()) {
      return 0;
    }
    return new BigNumber(apr).div(365).toFixed(2);
  }, [apr]);

  const [symbol0, symbol1] = useMemo(() => {
    if (
      FARM_TYPE.apeswap === FARM_TYPE[type] &&
      ["WMATIC", "USDC"].indexOf(lpToken.token0.symbol) !== -1
    ) {
      return [lpToken.token1.symbol, lpToken.token0.symbol];
    }
    return [lpToken.token0.symbol, lpToken.token1.symbol];
  }, [lpToken.token0, lpToken.token1]);

  useEffect(() => {
    if (!new BigNumber(stakedBalance).isZero()) {
      setParentData((old) => {
        const farmList = [...old];
        const indexFarm = findIndex(farmList, (e) => {
          return e.rewardAddress === farmAddress;
        });
        farmList[indexFarm].deposited = stakedBalance;
        return farmList;
      });
    }
  }, [stakedBalance]);

  return (
    <>
      <FlexRowData hover={true} isShow={isShow}>
        <div className="data-wrapper">
          <DataItem style={{ width: "25%" }}>
            <div className="wrapped-token-logo">
              <TokenLogo
                style={{ width: "40px", height: "40px", marginRight: "10px" }}
                symbol={symbol0}
              />
              <TokenLogo
                style={{ width: "40px", height: "40px", marginRight: "30px" }}
                symbol={symbol1}
              />
              <div>
                <a
                  rel="noreferrer"
                  target="_blank"
                  href={`https://polygonscan.com/address/${farmAddress}`}
                  title={poolIndex}
                >
                  {`${symbol0} - ${symbol1}`}
                </a>
                <FarmType>{type}</FarmType>
              </div>
            </div>
          </DataItem>
          <DataItem style={{ width: "15%" }}>{apr} %</DataItem>
          <DataItem style={{ width: "15%" }}>{daily}</DataItem>
          <DataItem style={{ width: "20%" }}>{moneyFormatter(tvl)} $</DataItem>
          <DataItem style={{ width: "20%" }}>{data.deposited || 0}</DataItem>
          <DataItem
            style={{ width: "5%" }}
            onClick={() => setIsSelected((value) => !value)}
          >
            {!isSelected ? <FaAngleRight /> : <FaAngleDown />}
          </DataItem>
        </div>
        {isSelected && (
          <div className="farm-data-wrapper">
            <DataItem style={{ width: "40%", textAlign: "left" }}>
              <FlexRow justify="flex-start">
                <GrayLabelText minWidth="200px">Start date</GrayLabelText>
                <WhiteLabelText>{convertDate(startStakeDate)}</WhiteLabelText>
              </FlexRow>
              <FlexRow justify="flex-start" marginTop="20px">
                <GrayLabelText minWidth="200px">Reward</GrayLabelText>
                <WhiteLabelText>
                  {reward[0]} {rewardTokens[0].symbol}
                </WhiteLabelText>
                <ClaimButton
                  disabled={new BigNumber(reward[0]).isZero()}
                  label={"Claim"}
                  loading={loadingGetReward}
                  labelLoading={"Claiming"}
                  onClick={onGetReward}
                />
              </FlexRow>
              {rewardTokens[1] && (
                <FlexRow justify="flex-start" marginTop="20px">
                  <GrayLabelText minWidth="200px" />
                  <WhiteLabelText>
                    {reward[1]} {rewardTokens[1].symbol}
                  </WhiteLabelText>
                </FlexRow>
              )}
            </DataItem>
            <ZapFarmWrapper>
              <FlexRow justify="flex-start">
                <TabLabel isActive={isZap} onClick={() => setIsZap(true)}>
                  Zap
                </TabLabel>
                <GrayColumn />
                <TabLabel isActive={!isZap} onClick={() => setIsZap(false)}>
                  Farming
                </TabLabel>
              </FlexRow>
              {isZap ? (
                <ZapTab
                  stakingToken={lpToken.address}
                  totalSupplyStakingToken={lpToken.totalSupply}
                  reserves={lpToken.reserves}
                  token0={lpToken.token0}
                  token1={lpToken.token1}
                  changeTab={() => setIsZap(false)}
                  refreshStakeBalance={refreshFarmInfo}
                  type={FARM_TYPE[type]}
                  lpBalance={lpBalance}
                  getLpBalance={getLpBalance}
                />
              ) : (
                <FarmingTab
                  stakingToken={lpToken.address}
                  farmAddress={farmAddress}
                  token0={lpToken.token0}
                  token1={lpToken.token1}
                  stakedBalance={stakedBalance}
                  refreshStakedBalance={refreshFarmInfo}
                  type={FARM_TYPE[type]}
                  lpBalance={lpBalance}
                  getLpBalance={getLpBalance}
                  pId={poolIndex}
                />
              )}
            </ZapFarmWrapper>
          </div>
        )}
      </FlexRowData>
      {/*{isSelected && (*/}
      {/*  <FlexRowData isShow={isShow}>*/}
      {/*    <DataItem>*/}
      {/*      <WrappedDataColumn>*/}
      {/*        <DataColumn style={{ textAlign: "left" }}>*/}
      {/*          <div>Start date</div>*/}
      {/*          <div>Your Staked</div>*/}
      {/*          <div>Reward</div>*/}
      {/*        </DataColumn>*/}
      {/*        <DataColumn>*/}
      {/*          <ValueSide> {convertDate(startStakeDate)} </ValueSide>*/}
      {/*          <ValueSide>{balance}</ValueSide>*/}
      {/*          <ValueSide>*/}
      {/*            {reward[0]} {rewardTokens[0].symbol}*/}
      {/*          </ValueSide>*/}
      {/*          {rewardTokens[1] && (*/}
      {/*            <ValueSide>*/}
      {/*              {reward[1]} {rewardTokens[1].symbol}*/}
      {/*            </ValueSide>*/}
      {/*          )}*/}
      {/*        </DataColumn>*/}
      {/*      </WrappedDataColumn>*/}
      {/*    </DataItem>*/}
      {/*    <DataItem colSpan={2}>*/}
      {/*      <FlexRow justify="center">*/}
      {/*        <TabLabel isActive={isZap} onClick={() => setIsZap(true)}>*/}
      {/*          Zap*/}
      {/*        </TabLabel>*/}
      {/*        <TabLabel isActive={!isZap} onClick={() => setIsZap(false)}>*/}
      {/*          Farming*/}
      {/*        </TabLabel>*/}
      {/*      </FlexRow>*/}
      {/*      <div style={{ padding: "10px" }}></div>*/}
      {/*    </DataItem>*/}
      {/*  </FlexRowData>*/}
      {/*)}*/}
    </>
  );
};

export default TableRecord;
