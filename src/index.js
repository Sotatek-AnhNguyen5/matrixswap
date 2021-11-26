import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
} from "@apollo/client";
import { Web3ReactProvider } from "@web3-react/core";
import { getLibrary } from "./utils";
import { ApolloLink } from "apollo-link";

const zapData = new HttpLink({
  uri: "https://api.thegraph.com/subgraphs/name/sotatek-cuongtran/bla-bla",
});

const sushiFarms = new HttpLink({
  uri: "https://api.thegraph.com/subgraphs/name/sushiswap/matic-minichef",
});

const apesFarms = new HttpLink({
  uri: "https://api.thegraph.com/subgraphs/name/ape-swap/minichef-polygon",
});

const client = new ApolloClient({
  link: ApolloLink.split(
    (operation) => operation.getContext().clientName === "zapData",
    zapData,
    ApolloLink.split(
      (operation) => operation.getContext().clientName === "apesFarm",
      apesFarms,
      sushiFarms,
    )
  ),
  cache: new InMemoryCache(),
});

ReactDOM.render(
  <Web3ReactProvider getLibrary={getLibrary}>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </Web3ReactProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
