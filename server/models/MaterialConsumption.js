const { query } = require('../database/connection');

class MaterialConsumption {
  constructor(data) {
    this.consumption_id = data.consumption_id;
    this.mo_id = data.mo_id;
    this.raw_sku_id = data.raw_sku_id;
    this.consumed_qty = data.consumed_qty;
    this.uom_id = data.uom_id;
    this.consumption_date = data.consumption_date;
    this.created_at = data.created_at;
  }

  // Get all material consumption records
  static async getAll() {
    try {
      const result = await query(`
        SELECT mc.*, 
               mo.mo_code,
               s.sku_code, s.sku_name,
               u.uom_code, u.uom_name
        FROM material_consumption mc
        JOIN manufacturing_order mo ON mc.mo_id = mo.mo_id
        JOIN sku s ON mc.raw_sku_id = s.sku_id
        JOIN uom u ON mc.uom_id = u.uom_id
        ORDER BY mc.consumption_date DESC
      `);
      return result.rows.map(row => ({
        ...new MaterialConsumption(row),
        mo_code: row.mo_code,
        sku_code: row.sku_code,
        sku_name: row.sku_name,
        uom_code: row.uom_code,
        uom_name: row.uom_name
      }));
    } catch (error) {
      throw new Error(`Failed to fetch material consumption records: ${error.message}`);
    }
  }

  // Get consumption records by MO ID
  static async getByMO(mo_id) {
    try {
      const result = await query(`
        SELECT mc.*, 
               mo.mo_code,
               s.sku_code, s.sku_name,
               u.uom_code, u.uom_name
        FROM material_consumption mc
        JOIN manufacturing_order mo ON mc.mo_id = mo.mo_id
        JOIN sku s ON mc.raw_sku_id = s.sku_id
        JOIN uom u ON mc.uom_id = u.uom_id
        WHERE mc.mo_id = $1
        ORDER BY mc.consumption_date
      `, [mo_id]);
      return result.rows.map(row => ({
        ...new MaterialConsumption(row),
        mo_code: row.mo_code,
        sku_code: row.sku_code,
        sku_name: row.sku_name,
        uom_code: row.uom_code,
        uom_name: row.uom_name
      }));
    } catch (error) {
      throw new Error(`Failed to fetch consumption records for MO: ${error.message}`);
    }
  }

  // Get consumption records by raw material SKU
  static async getByRawMaterial(raw_sku_id) {
    try {
      const result = await query(`
        SELECT mc.*, 
               mo.mo_code,
               s.sku_code, s.sku_name,
               u.uom_code, u.uom_name
        FROM material_consumption mc
        JOIN manufacturing_order mo ON mc.mo_id = mo.mo_id
        JOIN sku s ON mc.raw_sku_id = s.sku_id
        JOIN uom u ON mc.uom_id = u.uom_id
        WHERE mc.raw_sku_id = $1
        ORDER BY mc.consumption_date DESC
      `, [raw_sku_id]);
      return result.rows.map(row => ({
        ...new MaterialConsumption(row),
        mo_code: row.mo_code,
        sku_code: row.sku_code,
        sku_name: row.sku_name,
        uom_code: row.uom_code,
        uom_name: row.uom_name
      }));
    } catch (error) {
      throw new Error(`Failed to fetch consumption records for raw material: ${error.message}`);
    }
  }

  // Get consumption summary by MO
  static async getSummaryByMO(mo_id) {
    try {
      const result = await query(`
        SELECT 
          mc.raw_sku_id,
          s.sku_code,
          s.sku_name,
          u.uom_code,
          SUM(mc.consumed_qty) as total_consumed,
          COUNT(mc.consumption_id) as consumption_count
        FROM material_consumption mc
        JOIN sku s ON mc.raw_sku_id = s.sku_id
        JOIN uom u ON mc.uom_id = u.uom_id
        WHERE mc.mo_id = $1
        GROUP BY mc.raw_sku_id, s.sku_code, s.sku_name, u.uom_code
        ORDER BY s.sku_name
      `, [mo_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to fetch consumption summary: ${error.message}`);
    }
  }

  // Create new consumption record
  static async create(data) {
    try {
      const { mo_id, raw_sku_id, consumed_qty, uom_id } = data;
      
      // Verify MO exists and is in progress
      const moCheck = await query(
        'SELECT mo_status FROM manufacturing_order WHERE mo_id = $1',
        [mo_id]
      );
      
      if (moCheck.rows.length === 0) {
        throw new Error('Manufacturing Order not found');
      }
      
      if (moCheck.rows[0].mo_status !== 'In Progress') {
        throw new Error('Material consumption can only be recorded for Manufacturing Orders in progress');
      }
      
      const result = await query(
        'INSERT INTO material_consumption (mo_id, raw_sku_id, consumed_qty, uom_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [mo_id, raw_sku_id, consumed_qty, uom_id]
      );
      return new MaterialConsumption(result.rows[0]);
    } catch (error) {
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Invalid MO, SKU, or UoM ID');
      }
      if (error.code === '23514') { // Check constraint violation
        throw new Error('Consumed quantity must be greater than 0');
      }
      throw new Error(`Failed to create consumption record: ${error.message}`);
    }
  }

  // Get consumption by ID
  static async getById(id) {
    try {
      const result = await query(`
        SELECT mc.*, 
               mo.mo_code,
               s.sku_code, s.sku_name,
               u.uom_code, u.uom_name
        FROM material_consumption mc
        JOIN manufacturing_order mo ON mc.mo_id = mo.mo_id
        JOIN sku s ON mc.raw_sku_id = s.sku_id
        JOIN uom u ON mc.uom_id = u.uom_id
        WHERE mc.consumption_id = $1
      `, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      return {
        ...new MaterialConsumption(row),
        mo_code: row.mo_code,
        sku_code: row.sku_code,
        sku_name: row.sku_name,
        uom_code: row.uom_code,
        uom_name: row.uom_name
      };
    } catch (error) {
      throw new Error(`Failed to fetch consumption record: ${error.message}`);
    }
  }

  // Update consumption record
  async update(data) {
    try {
      const { consumed_qty, uom_id } = data;
      
      const result = await query(
        'UPDATE material_consumption SET consumed_qty = $1, uom_id = $2 WHERE consumption_id = $3 RETURNING *',
        [consumed_qty, uom_id, this.consumption_id]
      );
      if (result.rows.length === 0) {
        throw new Error('Consumption record not found');
      }
      Object.assign(this, new MaterialConsumption(result.rows[0]));
      return this;
    } catch (error) {
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Invalid UoM ID');
      }
      if (error.code === '23514') { // Check constraint violation
        throw new Error('Consumed quantity must be greater than 0');
      }
      throw new Error(`Failed to update consumption record: ${error.message}`);
    }
  }

  // Delete consumption record
  async delete() {
    try {
      const result = await query('DELETE FROM material_consumption WHERE consumption_id = $1 RETURNING *', [this.consumption_id]);
      if (result.rows.length === 0) {
        throw new Error('Consumption record not found');
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to delete consumption record: ${error.message}`);
    }
  }

  // Validate consumption data
  static validate(data) {
    const errors = [];

    if (!data.mo_id || !Number.isInteger(Number(data.mo_id))) {
      errors.push('Valid Manufacturing Order ID is required');
    }

    if (!data.raw_sku_id || !Number.isInteger(Number(data.raw_sku_id))) {
      errors.push('Valid raw material SKU ID is required');
    }

    if (!data.consumed_qty || isNaN(Number(data.consumed_qty)) || Number(data.consumed_qty) <= 0) {
      errors.push('Valid consumed quantity greater than 0 is required');
    }

    if (!data.uom_id || !Number.isInteger(Number(data.uom_id))) {
      errors.push('Valid UoM ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = MaterialConsumption;


