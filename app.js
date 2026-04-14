const express = require('express');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'ADS App running',
    timestamp: new Date().toISOString()
  });
});

// Conectar ao banco de dados
app.get('/db-status', async (req, res) => {
  const client = new Client({
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'prova_ads',
    password: process.env.DB_PASSWORD || 'ads2026',
    database: process.env.DB_NAME || 'ads_app'
  });

  try {
    await client.connect();
    const result = await client.query('SELECT now() as current_time;');
    await client.end();
    
    res.json({
      status: 'connected',
      database: 'PostgreSQL',
      currentTime: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: err.message
    });
  }
});

// Rota para listar versão do PostgreSQL
app.get('/db-version', async (req, res) => {
  const client = new Client({
    host: process.env.DB_HOST || 'postgres',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'prova_ads',
    password: process.env.DB_PASSWORD || 'ads2026',
    database: process.env.DB_NAME || 'ads_app'
  });

  try {
    await client.connect();
    const result = await client.query('SELECT version();');
    await client.end();
    
    res.json({
      version: result.rows[0].version
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to get database version',
      error: err.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ ADS App started on port ${PORT}`);
  console.log(`📡 Environment:`);
  console.log(`   - DB_HOST: ${process.env.DB_HOST || 'postgres'}`);
  console.log(`   - DB_PORT: ${process.env.DB_PORT || 5432}`);
  console.log(`   - DB_USER: ${process.env.DB_USER || 'prova_ads'}`);
  console.log(`   - DB_NAME: ${process.env.DB_NAME || 'ads_app'}`);
});
