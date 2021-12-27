import styled from "styled-components";
import "react-toastify/dist/ReactToastify.css";
import "react-input-range/lib/css/index.css";
import FarmList from "./pages/FarmList";
import "rc-tooltip/assets/bootstrap.css";

const AppWrapper = styled.div`
  color: white;
  height: 100%;
`;

function App() {
  return (
    <AppWrapper className="App">
      <FarmList />
    </AppWrapper>
  );
}

export default App;
