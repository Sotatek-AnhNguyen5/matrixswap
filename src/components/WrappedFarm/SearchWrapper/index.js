import Select, { components } from "react-select";
import { uniqBy } from "lodash";
import FilterOptions from "../../../json/FilterOptions.json";
import styled from "styled-components";

const Wrapper = styled.div`
  width: 45%;

  .basic-multi-select {
    width: 100%;
    margin-left: auto;

    .select__control {
      background: ${(props) => props.theme.colorDarkerGray};
      border-radius: 12px;
      box-shadow: inset 0px 0px 5px rgba(0, 0, 0, 0.25);
      border: 0;
      padding: 10px 20px;

      .select__placeholder {
        color: ${(props) => props.theme.colorGray};
        font-size: 14px;
      }

      .select__input-container {
        color: #fff;
        font-size: 14px;
      }

      .select__multi-value {
        background: #2a7b81;
        padding: 5px 10px;
        border-radius: 71px;

        .select__multi-value__label {
          color: #fff;
        }
      }

      .select__indicators {
        display: none;
      }
    }

    .select__option {
      color: ${(props) => props.theme.colorGray};
    }
  }
`;
const filterOption = (candidate, input) => {
  return (
    (candidate.data.__isNew__ ||
      candidate.label.toLowerCase().includes(input.toLowerCase())) &&
    input
  );
};

const Control = ({ children, ...props }) => {
  const styles = {
    width: "20px",
    height: "20px",
  };

  return (
    <components.Control {...props}>
      <img src="./images/icons/search.png" alt="" style={styles} />
      {children}
    </components.Control>
  );
};

const SearchWrapper = ({ onChange, filterKey }) => {
  return (
    <Wrapper>
      <Select
        components={{ Control }}
        value={filterKey}
        placeholder="Filter by token, protocol"
        isMulti
        name="colors"
        options={uniqBy(FilterOptions, "value")}
        classNamePrefix="select"
        className="basic-multi-select"
        openMenuOnClick={false}
        filterOption={filterOption}
        onChange={(value) => onChange(value)}
        selectProps={{ openMenuOnClick: false }}
      />
    </Wrapper>
  );
};

export default SearchWrapper;
