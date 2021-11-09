import { useRef } from "react";
import styled from "styled-components";
import SelectTokenButton from "../SelecTokenButton";

const InputWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;

  button {
    margin-left: -120px;
  }

  input {
    box-sizing: border-box;
    width: 100%;
    border-radius: 6px;
    padding: 15px 20px;
    font-size: 20px;
    border: solid 1px white;
    background-color: #333333;
    color: ${(props) => props.color ?? "white"};
    font-weight: 500;
    &:focus {
      outline: 0;
    }
  }
`;

const InputNumber = ({
  color,
  withSelectToken = false,
  inputRef,
  onSetSelectedToken,
}) => {
  return (
    <InputWrapper color={color}>
      <input ref={inputRef} type="number" />
      {withSelectToken && (
        <SelectTokenButton onSetSelectedToken={onSetSelectedToken} />
      )}
    </InputWrapper>
  );
};

export default InputNumber;
