import styled from "styled-components";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import {useEffect, useState} from "react";
import TableRecord from "../../WrappedTableRecords";
import { FlexRow } from "../../../theme/components";
import BigNumber from "bignumber.js";
import LazyLoad from "react-lazyload";
import { forceCheck } from 'react-lazyload';

const Table = styled.div`
  width: 95%;
  margin-left: auto;
`;

const WrappedSortImage = styled.div`
  display: flex;
  align-items: center;
  flex-flow: column;
`;

const SortSvgUp = styled(FaAngleUp)`
  color: ${(props) => (props.isActive ? "#fff" : props.theme.colorGray2)};
`;

const SortSvgDown = styled(FaAngleDown)`
  color: ${(props) => (props.isActive ? "#fff" : props.theme.colorGray2)};
`;

const FlexRowHeader = styled(FlexRow)`
  color: ${(props) => props.theme.colorGray2};

  span {
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    svg {
      margin-left: 10px;
    }
  }
`;

const HeaderItem = styled.div`
  padding: 0 20px;
  text-align: center;
  font-size: 16px;
`;

const DataTable = ({ data, setData, filterKey, refetchVolume }) => {
  const [sortKey, setSortKey] = useState();
  const [sortType, setSortType] = useState();

  const onChangeSort = (type) => {
    if (type !== sortKey) {
      setSortType("asc");
      setSortKey(type);
    } else if (sortType === "desc") {
      setSortKey("");
      setSortType("");
    } else {
      setSortType((old) => "desc");
    }
  };

  const compareFunction = (a, b) => {
    const key = (sortKey === "daily" ? "apr" : sortKey) || "deposited";
    const bigA = new BigNumber(a[key]);
    const bigB = new BigNumber(b[key]);
    if (bigA.lt(bigB)) {
      return -1;
    }
    if (bigA.gt(bigB)) {
      return 1;
    }

    return 0;
  };
  const renderLabelWithSort = (type, label) => {
    return (
      <span onClick={() => onChangeSort(type)}>
        {label}
        <WrappedSortImage>
          <SortSvgUp isActive={sortKey === type && sortType === "asc"} />
          <SortSvgDown isActive={sortKey === type && sortType === "desc"} />
        </WrappedSortImage>
      </span>
    );
  };

  let sortedData;

  if (!sortType || sortType === "desc") {
    sortedData = data.sort(compareFunction).reverse();
  } else if (sortType === "asc") {
    sortedData = data.sort(compareFunction);
  }

  useEffect(() => {
    forceCheck();
  }, [filterKey])

  return (
    <Table>
      <FlexRowHeader>
        <HeaderItem style={{ width: "20%" }} />
        <HeaderItem style={{ width: "10%" }}>
          {renderLabelWithSort("apr", "APR")}
        </HeaderItem>
        <HeaderItem style={{ width: "10%" }}>
          {renderLabelWithSort("daily", "Daily")}
        </HeaderItem>
        <HeaderItem style={{ width: "10%" }}>
          {renderLabelWithSort("tvl", "TVL")}
        </HeaderItem>
        <HeaderItem style={{ width: "15%" }}>
          {renderLabelWithSort("deposited", "Deposited")}
        </HeaderItem>
        <HeaderItem style={{ width: "15%" }}>
          {renderLabelWithSort("lpBalance", "LP Balance")}
        </HeaderItem>
        <HeaderItem style={{ width: "5%" }} />
      </FlexRowHeader>
      {sortedData.map((e, index) => {
        return (
          <LazyLoad
            key={`${e.rewardAddress}-${e.poolIndex}-${index}`}
            height={200}
          >
            <TableRecord
              filterKey={filterKey}
              data={e}
              type={e.appId}
              setParentData={setData}
              refetchVolume={refetchVolume}
            />
          </LazyLoad>
        );
      })}
    </Table>
  );
};

export default DataTable;
