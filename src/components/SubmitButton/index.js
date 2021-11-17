import styled from "styled-components";

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
`;

const SubmitButton = ({
  label,
  labelLoading,
  loading = false,
  onClick,
  disabled = false,
  style = {},
}) => {
  return (
    <ButtonAction
      style={style}
      disabled={disabled}
      loading={loading}
      onClick={() => !loading && onClick()}
    >
      {loading ? `${labelLoading}...` : label}
    </ButtonAction>
  );
};

export default SubmitButton;
