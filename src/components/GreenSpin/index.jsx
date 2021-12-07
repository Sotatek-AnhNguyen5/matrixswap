import styled from "styled-components";
import { AiOutlineLoading3Quarters } from "react-icons/all";

const StyledSpin = styled(AiOutlineLoading3Quarters)`
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  animation: spin 2s linear infinite;
  width: ${(props) => props.width ?? ""};
  height: ${(props) => props.height ?? ""};
  color: ${(props) => props.color ?? props.theme.colorMainGreen};
`;
const GreenSpin = ({ width, height, color }) => {
  return <StyledSpin alt="" width={width} height={height} />;
};

export default GreenSpin;
