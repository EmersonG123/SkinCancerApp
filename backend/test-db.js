const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'eng947750',
  database: 'SkinDB'
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Connection error:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
    process.exit(0);
  }
});
