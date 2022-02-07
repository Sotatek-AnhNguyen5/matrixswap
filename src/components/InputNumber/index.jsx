import styled from "styled-components";
import {
  isNotValidASCIINumber,
  isPreventASCIICharacters,
} from "../../utils/input";
import BigNumber from "bignumber.js";

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
    background-color: ${(props) => (props.disabled ? "gray" : "#333333")};
    color: ${(props) => props.color ?? "white"};
    font-weight: 500;

    &:focus {
      outline: 0;
    }
  }
`;

const InputNumber = ({
  color,
  inputRef,
  onChange,
  disabled,
  value,
  placeholder,
  suffix,
  className,
}) => {
  return (
    <InputWrapper disabled={disabled} color={color} className={`input-wrapper ${className}`}>
      <input
        onKeyDown={(e) =>
          isNotValidASCIINumber(e.keyCode, true) && e.preventDefault()
        }
        onKeyPress={(e) =>
          isPreventASCIICharacters(e.key) && e.preventDefault()
        }
        onChange={(e) => {
          if (new BigNumber(e.target.value).isPositive() || !e.target.value) {
            onChange(e.target.value);
          }
        }}
        className="input-number"
        ref={inputRef}
        type="number"
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        min="0"
      />
      {suffix && <span>{suffix}</span>}
    </InputWrapper>
  );
};

export default InputNumber;
