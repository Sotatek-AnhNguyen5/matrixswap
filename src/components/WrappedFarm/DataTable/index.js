import styled from "styled-components";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { useEffect, useState } from "react";
import TableRecord from "../../WrappedTableRecords";
import { FlexRow } from "../../../theme/components";
import { sortBy } from "lodash";

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

const DataTable = ({ data }) => {
  const [sortKey, setSortKey] = useState();
  const [sortType, setSortType] = useState();
  const [cloneData, setCloneData] = useState([]);

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

  const renderLabelWithSort = (type, label) => {
    return (
      <span onClick={() => onChangeSort(type)}>
        {label}
        {sortKey === type &&
          (sortType === "desc" ? <FaAngleDown /> : <FaAngleUp />)}
      </span>
    );
  };

  useEffect(() => {
    setCloneData(data);
  }, [data]);

  let sortedData;
  const key = sortKey === "daily" ? "apr" : sortKey;
  if (!sortType || sortType === "asc") {
    sortedData = sortBy(cloneData, [(o) => parseInt(o[key || "deposited"])]);
  } else if (sortType === "desc") {
    sortedData = sortBy(cloneData, [
      (o) => parseInt(o[key || "deposited"]),
    ]).reverse();
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
          <TableRecord
            key={index}
            // filterKey={filterKey}
            data={e}
            type={e.appId}
            setParentData={setCloneData}
          />
        );
      })}
    </Table>
  );
};

export default DataTable;
