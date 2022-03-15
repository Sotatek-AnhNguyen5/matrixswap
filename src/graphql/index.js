import { gql } from "@apollo/client";

export const GET_ZAPS = gql`
  query GetZaps {
    zaps {
      id
      input
      output
      protocol
      amount
      createTime
    }
    zapOutEntities {
      id
      lpToken
      protocol
      amount
      createTime
    }
  }
`;

export const GET_SUSHI_FARMS = gql`
  query GetSushiFarms {
    miniChefs {
      id
      sushi
      sushiPerSecond
      totalAllocPoint
    }
    pools(where: {allocPoint_gt: 0}) {
      id
      allocPoint
      miniChef {
        id
      }
      pair
      rewarder {
        id
        rewardToken
        rewardPerSecond
      }
    }
  }
`;

export const GET_APESWAP_FARMS = gql`
  query GetApesFarms {
    miniChefs {
      id
      banana
      bananaPerSecond
      totalAllocPoint
    }
    pools(where: {allocPoint_gt: 0}) {
      id
      allocPoint
      miniChef {
        id
      }
      pair
      rewarder {
        id
        rewardToken
        rewardPerSecond
      }
    }
  }
`;
