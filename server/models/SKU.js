const { query } = require('../database/connection');

class SKU {
  constructor(data) {
    this.sku_id = data.sku_id;
    this.sku_code = data.sku_code;
    this.sku_name = data.sku_name;
    this.sku_type = data.sku_type;
    this.base_uom_id = data.base_uom_id;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Get all SKUs
  static async getAll(includeInactive = false) {
    try {
      let sql = 'SELECT s.*, u.uom_code, u.uom_name FROM sku s JOIN uom u ON s.base_uom_id = u.uom_id';
      const params = [];
      
      if (!includeInactive) {
        sql += ' WHERE s.is_active = true';
      }
      
      sql += ' ORDER BY s.sku_name';
      
      const result = await query(sql, params);
      return result.rows.map(row => ({
        ...new SKU(row),
        uom_code: row.uom_code,
        uom_name: row.uom_name
      }));
    } catch (error) {
      throw new Error(`Failed to fetch SKUs: ${error.message}`);
    }
  }

  // Get SKU by ID
  static async getById(id) {
    try {
      const result = await query(
        'SELECT s.*, u.uom_code, u.uom_name FROM sku s JOIN uom u ON s.base_uom_id = u.uom_id WHERE s.sku_id = $1',
        [id]
      );
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      return {
        ...new SKU(row),
        uom_code: row.uom_code,
        uom_name: row.uom_name
      };
    } catch (error) {
      throw new Error(`Failed to fetch SKU: ${error.message}`);
    }
  }

  // Get SKUs by type
  static async getByType(type) {
    try {
      const result = await query(
        'SELECT s.*, u.uom_code, u.uom_name FROM sku s JOIN uom u ON s.base_uom_id = u.uom_id WHERE s.sku_type = $1 AND s.is_active = true ORDER BY s.sku_name',
        [type]
      );
      return result.rows.map(row => ({
        ...new SKU(row),
        uom_code: row.uom_code,
        uom_name: row.uom_name
      }));
    } catch (error) {
      throw new Error(`Failed to fetch SKUs by type: ${error.message}`);
    }
  }

  // Create new SKU
  static async create(data) {
    try {
      const { sku_code, sku_name, sku_type, base_uom_id } = data;
      const result = await query(
        'INSERT INTO sku (sku_code, sku_name, sku_type, base_uom_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [sku_code, sku_name, sku_type, base_uom_id]
      );
      return new SKU(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('SKU code already exists');
      }
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Invalid UoM ID');
      }
      if (error.code === '23514') { // Check constraint violation
        throw new Error('Invalid SKU type');
      }
      throw new Error(`Failed to create SKU: ${error.message}`);
    }
  }

  // Update SKU
  async update(data) {
    try {
      const { sku_code, sku_name, sku_type, base_uom_id } = data;
      const result = await query(
        'UPDATE sku SET sku_code = $1, sku_name = $2, sku_type = $3, base_uom_id = $4, updated_at = CURRENT_TIMESTAMP WHERE sku_id = $5 RETURNING *',
        [sku_code, sku_name, sku_type, base_uom_id, this.sku_id]
      );
      if (result.rows.length === 0) {
        throw new Error('SKU not found');
      }
      Object.assign(this, new SKU(result.rows[0]));
      return this;
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('SKU code already exists');
      }
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Invalid UoM ID');
      }
      if (error.code === '23514') { // Check constraint violation
        throw new Error('Invalid SKU type');
      }
      throw new Error(`Failed to update SKU: ${error.message}`);
    }
  }

  // Soft delete SKU (set is_active to false)
  async softDelete() {
    try {
      const result = await query(
        'UPDATE sku SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE sku_id = $1 RETURNING *',
        [this.sku_id]
      );
      if (result.rows.length === 0) {
        throw new Error('SKU not found');
      }
      this.is_active = false;
      return this;
    } catch (error) {
      throw new Error(`Failed to delete SKU: ${error.message}`);
    }
  }

  // Hard delete SKU
  async delete() {
    try {
      // Check if SKU is being used in BOMs
      const bomCheck = await query(
        'SELECT COUNT(*) FROM bom WHERE fg_sku_id = $1 OR raw_sku_id = $1',
        [this.sku_id]
      );
      if (parseInt(bomCheck.rows[0].count) > 0) {
        throw new Error('Cannot delete SKU: It is being used in BOMs');
      }

      // Check if SKU is being used in Manufacturing Orders
      const moCheck = await query(
        'SELECT COUNT(*) FROM manufacturing_order WHERE fg_sku_id = $1',
        [this.sku_id]
      );
      if (parseInt(moCheck.rows[0].count) > 0) {
        throw new Error('Cannot delete SKU: It is being used in Manufacturing Orders');
      }

      const result = await query('DELETE FROM sku WHERE sku_id = $1 RETURNING *', [this.sku_id]);
      if (result.rows.length === 0) {
        throw new Error('SKU not found');
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to delete SKU: ${error.message}`);
    }
  }

  // Validate SKU data
  static validate(data) {
    const errors = [];
    const validTypes = ['Raw Material', 'Finished Goods', 'Semi Finished Goods'];

    if (!data.sku_code || data.sku_code.trim().length === 0) {
      errors.push('SKU code is required');
    } else if (data.sku_code.length > 50) {
      errors.push('SKU code must be 50 characters or less');
    }

    if (!data.sku_name || data.sku_name.trim().length === 0) {
      errors.push('SKU name is required');
    } else if (data.sku_name.length > 100) {
      errors.push('SKU name must be 100 characters or less');
    }

    if (!data.sku_type || !validTypes.includes(data.sku_type)) {
      errors.push(`SKU type must be one of: ${validTypes.join(', ')}`);
    }

    if (!data.base_uom_id || !Number.isInteger(Number(data.base_uom_id))) {
      errors.push('Valid UoM ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = SKU;


