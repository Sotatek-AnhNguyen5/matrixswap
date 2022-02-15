import { InjectedConnector } from "@web3-react/injected-connector";

export const supportedChainIds = [137];

class MyInjectedConnector extends InjectedConnector {
  deactivate() {
    localStorage.setItem("isConnected", "");
  }
}

export const injected = new MyInjectedConnector({
  supportedChainIds,
});
