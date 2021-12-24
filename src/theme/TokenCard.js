import styled from "styled-components";

export const SelectTokenWrapper = styled.div`
  display: flex;
  flex-flow: column;
  padding: 10px 20px;
  width: 50%;
  box-sizing: border-box;
`;

export const SliderWrapper = styled.div`
  display: flex;
  flex-flow: column;
  padding: 10px 20px 10px 0;
  width: 40%;
  box-sizing: border-box;
`;

export const InputSlideRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(18, 70, 46, 0.6);
  font-size: 16px;
  padding-left: 10px;
  white-space: nowrap;

  span {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    width: 80px;
    font-size: 14px;
    font-family: "ChakraPetch", sans-serif;
    color: ${(props) =>
      props.danger ? props.theme.colorDanger : "rgba(18, 70, 46, 0.6)"};
  }

  input {
    font-family: "ChakraPetch", sans-serif;
    text-align: right;
    font-weight: 400;
    font-size: 18px;
    color: rgba(255, 255, 255, 0.6);
    background: transparent;
    border: 0;
    outline: 0;
    padding: 10px 20px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
  }
`;

export const SliderInputWrapper = styled.div`
  background: rgba(1, 3, 4, 0.1);
  border-radius: 16px;
  width: 100%;
  display: flex;
  flex-flow: column;
  min-height: 65px;

  .input-wrapper {
    width: 90%;
    margin-left: auto;
  }

  .rc-slider {
    margin-bottom: -5px;
  }
`;

export const WrappedStyledImage = styled.div`
  border-bottom-right-radius: 16px;
  border-top-right-radius: 16px;
  background: rgba(1, 3, 4, 0.15);
  height: 55px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  cursor: pointer;

  img {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background: rgba(81, 139, 167, 0.15);
  }
`;

export const TokenCard = styled.div`
  display: flex;
  background: ${(props) =>
    props.isActiveBg
      ? "linear-gradient(270deg, #3ee046 8.98%, #27bc2e 92.35%)"
      : "linear-gradient(90.04deg, #0a1c1f 0.96%, #0f2a2e 91.92%)"};
  border-radius: 26px;
  width: 100%;
  margin-top: 20px;
`;

export const SelectTokenButton = styled.button`
  background: rgba(1, 3, 4, 0.15);
  cursor: pointer;
  font-size: 16px;
  color: #fff;
  border-radius: ${(props) => (props.isCloseAble ? "16px 0 0 16px" : "16px")};
  padding: 0 20px;
  width: 150px;
  height: 55px;
  border: 0;

  &:hover {
    background: rgba(81, 139, 167, 0.15);
  }
`;
export const TokenLogoWrapper = styled.div`
  background: rgba(1, 3, 4, 0.2);
  border-radius: 26px 0px 0px 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px 15px;
  width: 10%;
`;
