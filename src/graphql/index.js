import { gql } from "@apollo/client";

export const GET_ZAPS = gql(`
  query GetZaps($createTime: Int!) {
    zaps(where : {createTime_gt: $createTime}) {
      id
      input
      output
      protocol
      amount
    }
  }
`);
