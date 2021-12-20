import styled from "styled-components";
import { AiOutlineLoading } from "react-icons/all";

const ButtonAction = styled.button`
  width: auto;
  min-width: 120px;
  text-align: center;
  background-color: ${(props) =>
    props.loading || props.disabled ? "gray" : "#3ee046"};
  cursor: ${(props) =>
    props.loading || props.disabled ? "not-allowed" : "pointer"};
  border: 0;
  padding: 6px 10px;
  border-radius: 6px;
  text-transform: capitalize;
  font-weight: 600;
  font-size: 16px;
  color: white;
  svg {
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    margin-left: 20px;
    animation: spin 2s linear infinite;
  }
`;

const SubmitButton = ({
  label,
  labelLoading,
  loading = false,
  onClick,
  disabled = false,
  style = {},
  className,
}) => {
  return (
    <ButtonAction
      className={className}
      style={style}
      disabled={disabled}
      loading={loading}
      onClick={() => !loading && onClick()}
    >
      {loading ? `${labelLoading}` : label}
      {loading ? <AiOutlineLoading /> : ""}
    </ButtonAction>
  );
};

export default SubmitButton;
