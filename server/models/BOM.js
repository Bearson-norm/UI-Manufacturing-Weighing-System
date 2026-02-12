const { query } = require('../database/connection');

class BOM {
  constructor(data) {
    this.bom_id = data.bom_id;
    this.fg_sku_id = data.fg_sku_id;
    this.raw_sku_id = data.raw_sku_id;
    this.quantity = data.quantity;
    this.uom_id = data.uom_id;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Get all BOM items for a finished goods SKU
  static async getByFG(fg_sku_id, includeInactive = false) {
    try {
      let sql = `
        SELECT b.*, 
               fg.sku_code as fg_sku_code, fg.sku_name as fg_sku_name,
               rm.sku_code as raw_sku_code, rm.sku_name as raw_sku_name,
               u.uom_code, u.uom_name
        FROM bom b
        JOIN sku fg ON b.fg_sku_id = fg.sku_id
        JOIN sku rm ON b.raw_sku_id = rm.sku_id
        JOIN uom u ON b.uom_id = u.uom_id
        WHERE b.fg_sku_id = $1
      `;
      const params = [fg_sku_id];
      
      if (!includeInactive) {
        sql += ' AND b.is_active = true';
      }
      
      sql += ' ORDER BY rm.sku_name';
      
      const result = await query(sql, params);
      return result.rows.map(row => ({
        ...new BOM(row),
        fg_sku_code: row.fg_sku_code,
        fg_sku_name: row.fg_sku_name,
        raw_sku_code: row.raw_sku_code,
        raw_sku_name: row.raw_sku_name,
        uom_code: row.uom_code,
        uom_name: row.uom_name
      }));
    } catch (error) {
      throw new Error(`Failed to fetch BOM items: ${error.message}`);
    }
  }

  // Get BOM by ID
  static async getById(id) {
    try {
      const result = await query(
        `SELECT b.*, 
                fg.sku_code as fg_sku_code, fg.sku_name as fg_sku_name,
                rm.sku_code as raw_sku_code, rm.sku_name as raw_sku_name,
                u.uom_code, u.uom_name
         FROM bom b
         JOIN sku fg ON b.fg_sku_id = fg.sku_id
         JOIN sku rm ON b.raw_sku_id = rm.sku_id
         JOIN uom u ON b.uom_id = u.uom_id
         WHERE b.bom_id = $1`,
        [id]
      );
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      return {
        ...new BOM(row),
        fg_sku_code: row.fg_sku_code,
        fg_sku_name: row.fg_sku_name,
        raw_sku_code: row.raw_sku_code,
        raw_sku_name: row.raw_sku_name,
        uom_code: row.uom_code,
        uom_name: row.uom_name
      };
    } catch (error) {
      throw new Error(`Failed to fetch BOM item: ${error.message}`);
    }
  }

  // Create new BOM item
  static async create(data) {
    try {
      const { fg_sku_id, raw_sku_id, quantity, uom_id } = data;
      
      // Check if the combination already exists
      const existing = await query(
        'SELECT bom_id FROM bom WHERE fg_sku_id = $1 AND raw_sku_id = $2',
        [fg_sku_id, raw_sku_id]
      );
      
      if (existing.rows.length > 0) {
        throw new Error('BOM item already exists for this combination');
      }
      
      const result = await query(
        'INSERT INTO bom (fg_sku_id, raw_sku_id, quantity, uom_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [fg_sku_id, raw_sku_id, quantity, uom_id]
      );
      return new BOM(result.rows[0]);
    } catch (error) {
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Invalid SKU or UoM ID');
      }
      if (error.code === '23514') { // Check constraint violation
        throw new Error('Quantity must be greater than 0');
      }
      throw new Error(`Failed to create BOM item: ${error.message}`);
    }
  }

  // Update BOM item
  async update(data) {
    try {
      const { raw_sku_id, quantity, uom_id } = data;
      
      // Check if the new combination already exists (excluding current record)
      const existing = await query(
        'SELECT bom_id FROM bom WHERE fg_sku_id = $1 AND raw_sku_id = $2 AND bom_id != $3',
        [this.fg_sku_id, raw_sku_id, this.bom_id]
      );
      
      if (existing.rows.length > 0) {
        throw new Error('BOM item already exists for this combination');
      }
      
      const result = await query(
        'UPDATE bom SET raw_sku_id = $1, quantity = $2, uom_id = $3, updated_at = CURRENT_TIMESTAMP WHERE bom_id = $4 RETURNING *',
        [raw_sku_id, quantity, uom_id, this.bom_id]
      );
      if (result.rows.length === 0) {
        throw new Error('BOM item not found');
      }
      Object.assign(this, new BOM(result.rows[0]));
      return this;
    } catch (error) {
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Invalid SKU or UoM ID');
      }
      if (error.code === '23514') { // Check constraint violation
        throw new Error('Quantity must be greater than 0');
      }
      throw new Error(`Failed to update BOM item: ${error.message}`);
    }
  }

  // Soft delete BOM item (set is_active to false)
  async softDelete() {
    try {
      const result = await query(
        'UPDATE bom SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE bom_id = $1 RETURNING *',
        [this.bom_id]
      );
      if (result.rows.length === 0) {
        throw new Error('BOM item not found');
      }
      this.is_active = false;
      return this;
    } catch (error) {
      throw new Error(`Failed to delete BOM item: ${error.message}`);
    }
  }

  // Hard delete BOM item
  async delete() {
    try {
      const result = await query('DELETE FROM bom WHERE bom_id = $1 RETURNING *', [this.bom_id]);
      if (result.rows.length === 0) {
        throw new Error('BOM item not found');
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to delete BOM item: ${error.message}`);
    }
  }

  // Validate BOM data
  static validate(data) {
    const errors = [];

    if (!data.fg_sku_id || !Number.isInteger(Number(data.fg_sku_id))) {
      errors.push('Valid finished goods SKU ID is required');
    }

    if (!data.raw_sku_id || !Number.isInteger(Number(data.raw_sku_id))) {
      errors.push('Valid raw material SKU ID is required');
    }

    if (data.fg_sku_id && data.raw_sku_id && data.fg_sku_id === data.raw_sku_id) {
      errors.push('Finished goods and raw material cannot be the same');
    }

    if (!data.quantity || isNaN(Number(data.quantity)) || Number(data.quantity) <= 0) {
      errors.push('Valid quantity greater than 0 is required');
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

module.exports = BOM;


