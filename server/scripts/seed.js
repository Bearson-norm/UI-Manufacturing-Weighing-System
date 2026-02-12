const { query, testConnection } = require('../database/connection');

const seed = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Test database connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Database connection failed');
    }

    // Seed UoM data
    console.log('📏 Seeding UoM data...');
    const uomData = [
      { uom_code: 'KG', uom_name: 'Kilogram' },
      { uom_code: 'PC', uom_name: 'Pieces' },
      { uom_code: 'L', uom_name: 'Liter' },
      { uom_code: 'GR', uom_name: 'Gram' },
      { uom_code: 'ML', uom_name: 'Milliliter' },
      { uom_code: 'BOX', uom_name: 'Box' }
    ];

    for (const uom of uomData) {
      await query(
        'INSERT INTO uom (uom_code, uom_name) VALUES ($1, $2) ON CONFLICT (uom_code) DO NOTHING',
        [uom.uom_code, uom.uom_name]
      );
    }

    // Seed SKU data
    console.log('📦 Seeding SKU data...');
    const skuData = [
      { sku_code: 'RM-001', sku_name: 'Tepung Terigu', sku_type: 'Raw Material', base_uom_id: 1 },
      { sku_code: 'RM-002', sku_name: 'Gula Pasir', sku_type: 'Raw Material', base_uom_id: 1 },
      { sku_code: 'RM-003', sku_name: 'Telur', sku_type: 'Raw Material', base_uom_id: 2 },
      { sku_code: 'RM-004', sku_name: 'Mentega', sku_type: 'Raw Material', base_uom_id: 1 },
      { sku_code: 'RM-005', sku_name: 'Susu Cair', sku_type: 'Raw Material', base_uom_id: 3 },
      { sku_code: 'RM-006', sku_name: 'Vanilla Extract', sku_type: 'Raw Material', base_uom_id: 5 },
      { sku_code: 'FG-001', sku_name: 'Kue Kering Premium', sku_type: 'Finished Goods', base_uom_id: 1 },
      { sku_code: 'FG-002', sku_name: 'Kue Lapis', sku_type: 'Finished Goods', base_uom_id: 1 },
      { sku_code: 'SFG-001', sku_name: 'Adonan Kue', sku_type: 'Semi Finished Goods', base_uom_id: 1 }
    ];

    for (const sku of skuData) {
      await query(
        'INSERT INTO sku (sku_code, sku_name, sku_type, base_uom_id) VALUES ($1, $2, $3, $4) ON CONFLICT (sku_code) DO NOTHING',
        [sku.sku_code, sku.sku_name, sku.sku_type, sku.base_uom_id]
      );
    }

    // Seed BOM data
    console.log('🔧 Seeding BOM data...');
    const bomData = [
      { fg_sku_id: 7, raw_sku_id: 1, quantity: 2.5, uom_id: 1 }, // Kue Kering Premium - Tepung Terigu
      { fg_sku_id: 7, raw_sku_id: 2, quantity: 1.0, uom_id: 1 }, // Kue Kering Premium - Gula Pasir
      { fg_sku_id: 7, raw_sku_id: 3, quantity: 10, uom_id: 2 },  // Kue Kering Premium - Telur
      { fg_sku_id: 7, raw_sku_id: 4, quantity: 0.5, uom_id: 1 }, // Kue Kering Premium - Mentega
      { fg_sku_id: 7, raw_sku_id: 5, quantity: 0.2, uom_id: 3 }, // Kue Kering Premium - Susu Cair
      { fg_sku_id: 7, raw_sku_id: 6, quantity: 0.01, uom_id: 5 }, // Kue Kering Premium - Vanilla Extract
      { fg_sku_id: 8, raw_sku_id: 1, quantity: 3.0, uom_id: 1 }, // Kue Lapis - Tepung Terigu
      { fg_sku_id: 8, raw_sku_id: 2, quantity: 1.5, uom_id: 1 }, // Kue Lapis - Gula Pasir
      { fg_sku_id: 8, raw_sku_id: 3, quantity: 8, uom_id: 2 },   // Kue Lapis - Telur
      { fg_sku_id: 8, raw_sku_id: 4, quantity: 0.8, uom_id: 1 }, // Kue Lapis - Mentega
      { fg_sku_id: 9, raw_sku_id: 1, quantity: 1.0, uom_id: 1 }, // Adonan Kue - Tepung Terigu
      { fg_sku_id: 9, raw_sku_id: 2, quantity: 0.5, uom_id: 1 }, // Adonan Kue - Gula Pasir
      { fg_sku_id: 9, raw_sku_id: 3, quantity: 3, uom_id: 2 }    // Adonan Kue - Telur
    ];

    for (const bom of bomData) {
      await query(
        'INSERT INTO bom (fg_sku_id, raw_sku_id, quantity, uom_id) VALUES ($1, $2, $3, $4) ON CONFLICT (fg_sku_id, raw_sku_id) DO NOTHING',
        [bom.fg_sku_id, bom.raw_sku_id, bom.quantity, bom.uom_id]
      );
    }

    // Seed Manufacturing Order data
    console.log('📋 Seeding Manufacturing Order data...');
    const moData = [
      { fg_sku_id: 7, planned_qty: 10, uom_id: 1 }, // Kue Kering Premium - 10 KG
      { fg_sku_id: 8, planned_qty: 5, uom_id: 1 },  // Kue Lapis - 5 KG
      { fg_sku_id: 7, planned_qty: 20, uom_id: 1 }  // Kue Kering Premium - 20 KG
    ];

    for (const mo of moData) {
      // Generate MO code
      const year = new Date().getFullYear();
      const result = await query(
        'SELECT mo_code FROM manufacturing_order WHERE mo_code LIKE $1 ORDER BY mo_code DESC LIMIT 1',
        [`MO-${year}-%`]
      );
      
      let nextNum = '0001';
      if (result.rows.length > 0) {
        const lastCode = result.rows[0].mo_code;
        const match = lastCode.match(/MO-\d+-(\d+)/);
        if (match) {
          nextNum = String(parseInt(match[1]) + 1).padStart(4, '0');
        }
      }
      
      const mo_code = `MO-${year}-${nextNum}`;
      
      await query(
        'INSERT INTO manufacturing_order (mo_code, fg_sku_id, planned_qty, uom_id) VALUES ($1, $2, $3, $4)',
        [mo_code, mo.fg_sku_id, mo.planned_qty, mo.uom_id]
      );
    }

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Sample data has been inserted:');
    console.log('   - 6 UoM records');
    console.log('   - 9 SKU records');
    console.log('   - 13 BOM records');
    console.log('   - 3 Manufacturing Order records');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seed();


