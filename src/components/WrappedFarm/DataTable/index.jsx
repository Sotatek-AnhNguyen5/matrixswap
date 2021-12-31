import styled from "styled-components";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { useEffect, useState } from "react";
import TableRecord from "../../WrappedTableRecords";
import { FlexRow, StyledReactPaginate } from "../../../theme/components";
import BigNumber from "bignumber.js";
import { find, isEmpty } from "lodash";

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
  padding: 0 10px;
  text-align: center;
  font-size: 16px;
`;

const ITEM_PER_PAGE = 10;

const DataTable = ({ data, setData, filterKey, refetchVolume }) => {
  const [sortKey, setSortKey] = useState();
  const [sortType, setSortType] = useState();
  const [sortedData, setSortedData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const [currentItems, setCurrentItems] = useState([]);
  const [selectedPage, setSelectedPage] = useState(0);

  const onChangeSort = async (type) => {
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

  useEffect(() => {
    let newSortedData = [...data];
    if (sortType === "desc") {
      newSortedData = newSortedData.sort(compareFunction).reverse();
    } else if (sortType === "asc") {
      newSortedData = newSortedData.sort(compareFunction);
    }
    if (filterKey.length > 0) {
      newSortedData = newSortedData.filter((farm) => {
        const isExists = find(
          filterKey,
          (item) =>
            [farm.symbol0.toUpperCase(), farm.symbol1.toUpperCase()].indexOf(
              item.value.toUpperCase()
            ) !== -1
        );

        const noSymbol = find(
          filterKey,
          (e) => ["quickswap", "sushiswap", "apeswap"].indexOf(e.value) === -1
        );
        const isMatchProtocol = find(filterKey, (e) => e.value === farm.appId);
        const noProtocol = find(
          filterKey,
          (e) => ["quickswap", "sushiswap", "apeswap"].indexOf(e.value) !== -1
        );

        return (!!isExists || !noSymbol) && (!!isMatchProtocol || !noProtocol);
      });
    }
    setSortedData(newSortedData);
  }, [sortType, filterKey]);

  //
  useEffect(() => {
    setItemOffset(0)
    setCurrentItems(sortedData.slice(0, ITEM_PER_PAGE));
    setPageCount(Math.ceil(sortedData.length / ITEM_PER_PAGE));
    setSelectedPage(0)
  }, [sortedData]);
  //

  useEffect(() => {
    // Fetch items from another resources.
    const endOffset = itemOffset + ITEM_PER_PAGE;
    setCurrentItems(sortedData.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(sortedData.length / ITEM_PER_PAGE));
  }, [itemOffset]);

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * ITEM_PER_PAGE) % data.length;
    setSelectedPage(event.selected);
    setItemOffset(newOffset);
  };

  return (
    <>
      <Table>
        <FlexRowHeader>
          <HeaderItem style={{ width: "25%" }} />
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
        {currentItems.map((e, index) => {
          return (
            <TableRecord
              key={`${e.rewardAddress}-${e.poolIndex}-${index}`}
              data={e}
              type={e.appId}
              setParentData={setData}
              refetchVolume={refetchVolume}
            />
          );
        })}
      </Table>
      <StyledReactPaginate
        breakLabel="..."
        nextLabel="Next >"
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        pageCount={pageCount}
        previousLabel="< Previous"
        renderOnZeroPageCount={null}
        forcePage={selectedPage}
      />
    </>
  );
};

export default DataTable;
