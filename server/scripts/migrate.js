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

    // Parse SQL statements properly, handling functions with $$ delimiters
    const statements = [];
    let currentStatement = '';
    let inFunction = false;
    let functionDelimiter = null;
    
    // Process character by character to handle $$ delimiters correctly
    let i = 0;
    while (i < schema.length) {
      const char = schema[i];
      const nextChar = i + 1 < schema.length ? schema[i + 1] : '';
      
      // Check for start of function delimiter $$
      if (char === '$' && nextChar === '$' && !inFunction) {
        inFunction = true;
        functionDelimiter = '$$';
        currentStatement += '$$';
        i += 2;
        continue;
      }
      
      // Check for end of function delimiter $$
      if (char === '$' && nextChar === '$' && inFunction && functionDelimiter === '$$') {
        currentStatement += '$$';
        inFunction = false;
        functionDelimiter = null;
        i += 2;
        continue;
      }
      
      // Check for semicolon (statement terminator)
      if (char === ';' && !inFunction) {
        currentStatement += ';';
        const stmt = currentStatement.trim();
        // Skip empty statements and comments
        if (stmt && stmt !== ';' && !stmt.startsWith('--')) {
          statements.push(stmt);
        }
        currentStatement = '';
        i++;
        continue;
      }
      
      // Skip comment lines
      if (char === '-' && nextChar === '-' && !inFunction) {
        // Skip until end of line
        while (i < schema.length && schema[i] !== '\n') {
          i++;
        }
        continue;
      }
      
      // Add character to current statement
      currentStatement += char;
      i++;
    }
    
    // Add any remaining statement
    if (currentStatement.trim() && !inFunction) {
      const stmt = currentStatement.trim();
      if (stmt && stmt !== ';' && !stmt.startsWith('--')) {
        if (!stmt.endsWith(';')) {
          statements.push(stmt + ';');
        } else {
          statements.push(stmt);
        }
      }
    }

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim() && statement.trim() !== ';') {
        // Show first 50 chars of statement for debugging
        const preview = statement.substring(0, 50).replace(/\s+/g, ' ').trim();
        console.log(`📝 Executing statement ${i + 1}/${statements.length}: ${preview}...`);
        try {
          await query(statement);
        } catch (error) {
          // If it's a "already exists" error, skip it (idempotent migration)
          if (error.code === '42P07' || error.code === '42710' || 
              error.code === '42723' || // function already exists
              error.message.includes('already exists') || 
              error.message.includes('duplicate key') ||
              error.message.includes('relation') && error.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1} skipped (already exists): ${error.message.split('\n')[0]}`);
            continue;
          }
          // Log the statement that failed for debugging
          console.error(`❌ Failed statement preview: ${statement.substring(0, 150)}...`);
          throw error;
        }
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


