import styled from "styled-components";
import ConnectButton from "../../components/ConnectButton";
import TradingVolume from "../../components/TradingVolume";
import useVolume24h from "../../hooks/useVolume24h";
import WrappedFarm from "../../components/WrappedFarm";

const AppWrapper = styled.div`
  min-height: 100%;
  background-image: url("./images/matrix-number.png"),
    radial-gradient(54.3% 54.3% at 50.9% 45.7%, #0e2326 0%, #032115 100%);
  background-repeat: no-repeat, repeat;
  background-position: right bottom;
  background-attachment: fixed;
  padding: 0 50px;
`;

const HeaderWrapper = styled.div`
  padding: 50px 0;

  .logo {
    width: 300px;
  }

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChooseNetWork = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #021811;
  box-shadow: inset 2px 0px 11px rgba(0, 0, 0, 0.97);
  border-radius: 51px;
  min-width: 200px;
  min-height: 80px;
  font-size: 16px;
  line-height: 19px;
  color: #ffffff;
  border: 0;
  margin-right: 40px;

  .token {
    border-radius: 50%;
    width: 20px;
    height: 20px;
    margin-right: 10px;
  }

  .down {
    margin-left: 10px;
    width: 15px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VolumeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FarmList = () => {
  const [volume, refetchVolume] = useVolume24h();

  return (
    <AppWrapper>
      <HeaderWrapper>
        <img alt="" src="./images/matrix-logo.png" className="logo" />
        <ButtonGroup>
          <ChooseNetWork onClick={() => refetchVolume()}>
            <img src="./images/tokens/matic.jpg" alt="" className="token" />
            <span>Polygon</span>
            <img src="./images/icons/down.png" alt="" className="down" />
          </ChooseNetWork>
          <ConnectButton />
        </ButtonGroup>
      </HeaderWrapper>
      <VolumeWrapper>
        <TradingVolume
          type="total"
          label="Total Trading Volume"
          amount={volume.total}
        />
        <TradingVolume label="24h Trading Volume" amount={volume.total24h} />
      </VolumeWrapper>
      <WrappedFarm refetchVolume={refetchVolume} />
    </AppWrapper>
  );
};

export default FarmList;
