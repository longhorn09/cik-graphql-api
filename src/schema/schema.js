'use strict';

export const buildSchema = () => `
  type Stock {
    id: ID!
    symbol: String!
    name: String!
    price: Float
    cik: Int!
    updatedAt: String!
  }

  type Query {
    stocks: [Stock!]!
    stock(id: ID!): Stock
    stockBySymbol(symbol: String!): Stock
    stockByCik(cik: Int!): Stock
  }

  type Mutation {
    upsertStock(input: UpsertStockInput!): Stock!
    upsertStockByCik(input: UpsertStockByCikInput!): Stock!
  }

  input UpsertStockInput {
    symbol: String!
    name: String!
    price: Float
  }

  input UpsertStockByCikInput {
    cik: Int!
    name: String!
    price: Float
  }
`; 