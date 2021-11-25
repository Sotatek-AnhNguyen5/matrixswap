import { gql } from "@apollo/client";

export const GET_ZAPS = gql`
  query GetZaps($createTime: Int!) {
    zaps(where: { createTime_gt: $createTime }) {
      id
      input
      output
      protocol
      amount
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
    pools {
      id
      miniChef {
        id
      }
      pair
      rewarder {
        id
        rewardToken
      }
    }
  }
`;
