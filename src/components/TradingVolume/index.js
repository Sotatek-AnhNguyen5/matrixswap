import styled from "styled-components";

const Wrapper = styled.div`
  padding: 10px 60px 10px 30px;
  display: flex;
  align-items: center;
  background: linear-gradient(90.08deg, #0a1c1f 2.09%, #0f2a2e 86.26%);
  border: 2px dashed rgba(62, 224, 70, 0.6);
  box-sizing: border-box;
  border-radius: 20px;
  width: 49%;

  .label-wrapper {
    img {
      width: 24px;
      height: 24px;
      margin-right: 15px;
    }

    color: ${(props) => props.theme.colorGray};
    font-weight: 400;
    font-size: 16px;
    display: flex;
    align-items: center;
  }

  .volume-wrapper {
    margin-left: auto;
    color: ${(props) => props.theme.colorMainGreen};
    font-size: 24px;
    text-align: right;
    font-family: "ChakraPetch", sans-serif;
  }
`;

const TradingVolume = ({ type, label, amount }) => {
  return (
    <Wrapper>
      <div className="label-wrapper">
        <img
          src={
            type === "total"
              ? "./images/icons/sync.png"
              : "./images/icons/clock.png"
          }
          alt=""
        />
        {label}
      </div>
      <div className="volume-wrapper">${amount}</div>
    </Wrapper>
  );
};

export default TradingVolume;
