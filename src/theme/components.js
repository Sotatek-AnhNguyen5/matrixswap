import styled from "styled-components";
import SubmitButton from "../components/SubmitButton";
import ReactPaginate from "react-paginate";

export const ProtocolBadger = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  background: ${(props) => (props.isActive ? "#2a7b81" : "#182f32")};
  border-radius: 71px;
  opacity: 0.88;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;

  img {
    width: 24px;
    height: 24px;
    margin-right: 10px;
  }
`;

export const FlexRow = styled.div`
  display: flex;
  z-index: 0;
  justify-content: ${(props) => props.justify ?? "space-between"};
  margin-top: ${(props) => props.marginTop ?? "0"};
  align-items: ${(props) => props.alignItems ?? "center"};
  height: ${(props) => props.height ?? "auto"};
  flex-flow: ${(props) => props.flexFlow ?? "row"};
  padding: ${(props) => props.padding ?? "0"};
  width: ${(props) => props.width ?? "100%"};
`;

export const GridContainer = styled.div`
  width: ${(props) => props.width ?? "100%"};
  display: grid;
  grid-template-columns: ${(props) => props.templateColumns};
  margin-top: ${(props) => props.marginTop ?? "auto"};
  grid-gap: ${(props) => props.gridGap ?? "auto"};
`;

export const GrayLabelText = styled.div`
  font-size: 16px;
  color: ${(props) => props.theme.colorGray};
  font-weight: 400;
  min-width: ${(props) => props.minWidth ?? "auto"};
`;

export const WhiteLabelText = styled.div`
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.02em;
  font-family: "ChakraPetch", sans-serif;
`;

export const StyledButton = styled.button`
  cursor: pointer;
`;

export const ActiveButton = styled(SubmitButton)`
  background: ${(props) =>
    props.disabled ? "#0F2A2E" : props.theme.colorMainGreen};
  border-radius: 26px;
  padding: 15px 20px;
  width: ${(props) => props.width ?? "100%"};
  margin-top: ${(props) => props.marginTop ?? "0"};
  color: ${(props) => (props.disabled ? props.theme.colorMainGreen : "#fff")};

  &:hover {
    background: ${(props) => (props.disabled ? "#0F2A2E" : "#2ba132")};
  }

  &:active {
    background: ${(props) => (props.disabled ? "#0F2A2E" : "#0e4513")};
  }
`;

export const BalanceLine = styled.div`
  font-size: 14px;
  font-family: ${(props) =>
    props.isNumber ? "ChakraPetch, sans-serif" : "Ocr-A, serif"};
  color: ${(props) =>
    props.danger ? props.theme.colorDanger : "rgba(18, 70, 46, 0.6)"};

  span {
    cursor: pointer;
    font-family: ${(props) =>
      props.isNumber ? "ChakraPetch, sans-serif" : "Ocr-A, serif"};
  }
`;

export const MaxButton = styled.button`
  background: #38d740;
  padding: 10px 15px;
  font-size: 14px;
  color: rgba(18, 70, 46, 0.6);
  outline: 0;
  border: 0;
  box-shadow: 0px 6px 6px rgba(1, 3, 4, 0.1);
  border-radius: 7px;
  cursor: pointer;
  margin-right: auto;
  opacity: 0.6;
  margin-top: ${(props) => props.marginTop ?? "0"};

  &:hover {
    color: rgba(8, 29, 21, 0.6);
    opacity: 1;
  }

  background: ${(props) =>
    props.isActive
      ? "#38d740"
      : "linear-gradient(90deg, #0A1C1F 0%, #0F2A2E 96.22%)"};
`;

export const StyledReactPaginate = styled(ReactPaginate)`
  display: flex;
  justify-content: flex-end;

  li {
    list-style-type: none;
    background: #182f32;
    opacity: 0.88;
    font-size: 16px;
    cursor: pointer;
    border-radius: 6px;
    margin: 0px 5px;
    padding: 2px 0px;

    a {
      padding: 10px 10px;
    }

    &.selected {
      background: #2a7b81;
    }
  }

  .previous,
  .next {
    width: auto;
  }
`;
