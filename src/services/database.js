'use strict';

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

class DatabaseService {
  constructor() {
    this.pool = null;
    this.connection = null;
  }

  async initialize() {
    try {
      // GCP CloudSQL MySQL connection configuration
      const dbConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'cik_database',
        ssl: process.env.DB_SSL === 'true' ? {
          rejectUnauthorized: false
        } : false,
        // Connection pool configuration
        connectionLimit: parseInt(process.env.DB_POOL_SIZE) || 10,
        acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT) || 60000,
        timeout: parseInt(process.env.DB_TIMEOUT) || 60000,
        // Reconnection settings
        reconnect: true,
        // Query timeout
        queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT) || 30000
      };

      // Create connection pool
      this.pool = mysql.createPool(dbConfig);

      // Test connection
      this.connection = await this.pool.getConnection();
      await this.connection.ping();
      this.connection.release();

      console.log('Database connection pool initialized successfully');
      
      // Initialize database schema if needed
      await this.initializeSchema();
      
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async initializeSchema() {
    try {
      const connection = await this.pool.getConnection();
      
      // Create stocks table if it doesn't exist
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS stocks (
          id INT AUTO_INCREMENT PRIMARY KEY,
          symbol VARCHAR(10) UNIQUE,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2),
          cik INT UNIQUE,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);

      // Insert sample data if table is empty
      const [stocks] = await connection.execute('SELECT COUNT(*) as count FROM stocks');
      if (stocks[0].count === 0) {
        await connection.execute(`
          INSERT INTO stocks (symbol, name, price, cik) VALUES 
          ('AAPL', 'Apple Inc.', 150.00, 320193),
          ('GOOGL', 'Alphabet Inc.', 2800.00, 1652044),
          ('MSFT', 'Microsoft Corporation', 300.00, 789019)
        `);
      }

      connection.release();
      console.log('Database schema initialized successfully');
      
    } catch (error) {
      console.error('Schema initialization failed:', error);
      throw error;
    }
  }

  async query(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  async getConnection() {
    return await this.pool.getConnection();
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('Database connection pool closed');
    }
  }

  // Helper methods for common operations
  async findById(table, id) {
    const sql = `SELECT * FROM ${table} WHERE id = ?`;
    const results = await this.query(sql, [id]);
    return results[0] || null;
  }

  async findAll(table, limit = 100, offset = 0) {
    const sql = `SELECT * FROM ${table} LIMIT ? OFFSET ?`;
    return await this.query(sql, [limit, offset]);
  }

  async create(table, data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const values = Object.values(data);
    
    const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const result = await this.query(sql, values);
    
    return { id: result.insertId, ...data };
  }

  async update(table, id, data) {
    const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    await this.query(sql, values);
    
    return { id, ...data };
  }

  async delete(table, id) {
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    await this.query(sql, [id]);
    return { id };
  }
}

export const databaseService = new DatabaseService(); 