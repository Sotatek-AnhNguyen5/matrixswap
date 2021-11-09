import styled from "styled-components";
import { FaAngleDown, FaAngleLeft } from "react-icons/fa";
import { useState, useMemo } from "react";
import { useWeb3React } from "@web3-react/core";
import ZapTab from "./Zap";
import FarmingTab from "./Farming";
import useGetPairToken from "../../hooks/useGetPairToken";
import useFarmUserInfo from "../../hooks/useReward";
import useConvertToUsdt from "../../hooks/useConvertToUsdt";

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
`;

const DataRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
`;
const ClaimButton = styled.button`
  background-color: #999999;
  color: #564c52;
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

const TableRecord = ({ data }) => {
  const [isSelected, setIsSelected] = useState(false);
  const [isZap, setIsZap] = useState(true);
  const [token0, token1, stakingToken] = useGetPairToken(data.stakingRewards);
  const [reward, balance] = useFarmUserInfo(data.stakingRewards);
  // console.log(data.stakingRewards);

  // const usdtValue = useConvertToUsdt("0x554f074d9cCda8F483d1812d4874cBebD682644E", 10);

  return (
    <>
      <Tr onClick={() => setIsSelected((value) => !value)}>
        <Td style={{ textAlign: "left", paddingLeft: "20px" }}>
          {token0.symbol} - {token1.symbol}
        </Td>
        <Td>0%</Td>
        <Td>0%</Td>
        <Td>0$</Td>
        <Td>{!isSelected ? <FaAngleLeft /> : <FaAngleDown />}</Td>
      </Tr>
      {isSelected && (
        <Tr style={{ marginTop: "10px" }}>
          <TdSecond colSpan={2}>
            <DataRow>
              <div>Start date</div>
              <div>24 Step 2021 9:00 UTC</div>
            </DataRow>
            <DataRow>
              <div>Your Stake</div>
              <div>{balance}</div>
            </DataRow>
            <DataRow>
              <div>Reward</div>
              <div>
                {reward} <ClaimButton>Claim</ClaimButton>
              </div>
            </DataRow>
          </TdSecond>
          <TdSecond colSpan={3}>
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
                <ZapTab stakingToken={stakingToken} />
              ) : (
                <FarmingTab
                  stakingToken={stakingToken}
                  farmAddress={data.stakingRewards}
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
