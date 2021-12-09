import styled from "styled-components";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { useCallback, useEffect, useState } from "react";
import TableRecord from "../../WrappedTableRecords";
import { FlexRow } from "../../../theme/components";
import BigNumber from "bignumber.js";
import LazyLoad from "react-lazyload";

const Table = styled.div`
  width: 95%;
  margin-left: auto;
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
`;

const DataTable = ({ data, setData, filterKey }) => {
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
      return 1;
    }
    if (bigA.gt(bigB)) {
      return -1;
    }

    return 0;
  };
  const renderLabelWithSort = (type, label) => {
    return (
      <span onClick={() => onChangeSort(type)}>
        {label}
        {sortKey === type &&
          (sortType === "desc" ? <FaAngleDown /> : <FaAngleUp />)}
      </span>
    );
  };

  let sortedData;

  if (!sortType || sortType === "asc") {
    sortedData = data.sort(compareFunction);
  } else if (sortType === "desc") {
    sortedData = data.sort(compareFunction).reverse();
  }

  return (
    <Table>
      <FlexRowHeader>
        <HeaderItem style={{ width: "25%" }} />
        <HeaderItem style={{ width: "15%" }}>
          {renderLabelWithSort("apr", "APR")}
        </HeaderItem>
        <HeaderItem style={{ width: "15%" }}>
          {renderLabelWithSort("daily", "Daily")}
        </HeaderItem>
        <HeaderItem style={{ width: "20%" }}>
          {renderLabelWithSort("tvl", "TVL")}
        </HeaderItem>
        <HeaderItem style={{ width: "20%" }}>
          {renderLabelWithSort("deposited", "Deposited")}
        </HeaderItem>
        <HeaderItem style={{ width: "5%" }} />
      </FlexRowHeader>
      {sortedData.map((e, index) => {
        return (
          <LazyLoad
            key={`${e.rewardAddress}-${e.poolIndex}-${index}`}
            height={300}
            offset={1300}
          >
            <TableRecord
              filterKey={filterKey}
              data={e}
              type={e.appId}
              setParentData={setData}
            />
          </LazyLoad>
        );
      })}
    </Table>
  );
};

export default DataTable;
