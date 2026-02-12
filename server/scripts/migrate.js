const fs = require('fs');
const path = require('path');
const { query, testConnection } = require('../database/connection');

const migrate = async () => {
  try {
    console.log('🔄 Starting PostgreSQL database migration...');
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('PostgreSQL database connection failed');
    }
    
    // Verify PostgreSQL version
    const { query } = require('../database/connection');
    const versionResult = await query('SELECT version()');
    const pgVersion = versionResult.rows[0].version;
    console.log('📊 PostgreSQL Version:', pgVersion.split(',')[0]);

    // Read schema file
    const schemaPath = path.join(__dirname, '../database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
        await query(statement);
      }
    }

    // Verify tables were created
    const tablesResult = await query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log('✅ PostgreSQL database migration completed successfully!');
    console.log(`📋 Created ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => console.log(`   - ${row.table_name}`));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ PostgreSQL migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  }
};

migrate();


