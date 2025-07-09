'use strict';

import { databaseService } from '../services/database.js';

export const resolvers = {
  Query: {
    stocks: async () => {
      try {
        return await databaseService.findAll('stocks');
      } catch (error) {
        throw new Error(`Failed to fetch stocks: ${error.message}`);
      }
    },

    stock: async (_, { id }) => {
      try {
        return await databaseService.findById('stocks', id);
      } catch (error) {
        throw new Error(`Failed to fetch stock: ${error.message}`);
      }
    },

    stockBySymbol: async (_, { symbol }) => {
      try {
        const sql = 'SELECT * FROM stocks WHERE symbol = ?';
        const results = await databaseService.query(sql, [symbol]);
        return results[0] || null;
      } catch (error) {
        throw new Error(`Failed to fetch stock by symbol: ${error.message}`);
      }
    },

    stockByCik: async (_, { cik }) => {
      try {
        const sql = 'SELECT * FROM stocks WHERE cik = ?';
        const results = await databaseService.query(sql, [cik]);
        return results[0] || null;
      } catch (error) {
        throw new Error(`Failed to fetch stock by CIK: ${error.message}`);
      }
    }
  },

  Mutation: {
    upsertStock: async (_, { input }) => {
      try {
        const { symbol, name, price } = input;
        
        // Check if stock exists by symbol
        const existingStock = await databaseService.query(
          'SELECT * FROM stocks WHERE symbol = ?',
          [symbol]
        );
        
        if (existingStock.length > 0) {
          // Update existing stock
          const updatedStock = await databaseService.update('stocks', existingStock[0].id, {
            name,
            price,
            updated_at: new Date()
          });
          return updatedStock;
        } else {
          // Create new stock
          const newStock = await databaseService.create('stocks', {
            symbol,
            name,
            price,
            updated_at: new Date()
          });
          return newStock;
        }
      } catch (error) {
        throw new Error(`Failed to upsert stock: ${error.message}`);
      }
    },

    upsertStockByCik: async (_, { input }) => {
      try {
        const { cik, name, price } = input;
        
        // Check if stock exists by CIK
        const existingStock = await databaseService.query(
          'SELECT * FROM stocks WHERE cik = ?',
          [cik]
        );
        
        if (existingStock.length > 0) {
          // Update existing stock
          const updatedStock = await databaseService.update('stocks', existingStock[0].id, {
            name,
            price,
            updated_at: new Date()
          });
          return updatedStock;
        } else {
          // Create new stock
          const newStock = await databaseService.create('stocks', {
            cik,
            name,
            price,
            updated_at: new Date()
          });
          return newStock;
        }
      } catch (error) {
        throw new Error(`Failed to upsert stock by CIK: ${error.message}`);
      }
    }
  }
}; 