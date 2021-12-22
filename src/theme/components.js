import styled from "styled-components";
import SubmitButton from "../components/SubmitButton";

export const ProtocolBadger = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 10px;
  background: ${props => props.isActive ? "#2a7b81" : "#182f32"};
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
  font-family: ${props => props.isNumber ? "ChakraPetch, sans-serif" : "Ocr-A, serif"};
  color: ${(props) =>
  props.danger ? props.theme.colorDanger : "rgba(18, 70, 46, 0.6)"};

  span {
    cursor: pointer;
    font-family: ${props => props.isNumber ? "ChakraPetch, sans-serif" : "Ocr-A, serif"};
  }
`;
