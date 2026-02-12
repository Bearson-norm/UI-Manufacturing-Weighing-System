const { query } = require('../database/connection');

class UoM {
  constructor(data) {
    this.uom_id = data.uom_id;
    this.uom_code = data.uom_code;
    this.uom_name = data.uom_name;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Get all UoMs
  static async getAll() {
    try {
      const result = await query('SELECT * FROM uom ORDER BY uom_name');
      return result.rows.map(row => new UoM(row));
    } catch (error) {
      throw new Error(`Failed to fetch UoMs: ${error.message}`);
    }
  }

  // Get UoM by ID
  static async getById(id) {
    try {
      const result = await query('SELECT * FROM uom WHERE uom_id = $1', [id]);
      if (result.rows.length === 0) {
        return null;
      }
      return new UoM(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to fetch UoM: ${error.message}`);
    }
  }

  // Get UoM by code
  static async getByCode(code) {
    try {
      const result = await query('SELECT * FROM uom WHERE uom_code = $1', [code]);
      if (result.rows.length === 0) {
        return null;
      }
      return new UoM(result.rows[0]);
    } catch (error) {
      throw new Error(`Failed to fetch UoM by code: ${error.message}`);
    }
  }

  // Create new UoM
  static async create(data) {
    try {
      const { uom_code, uom_name } = data;
      const result = await query(
        'INSERT INTO uom (uom_code, uom_name) VALUES ($1, $2) RETURNING *',
        [uom_code, uom_name]
      );
      return new UoM(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('UoM code already exists');
      }
      throw new Error(`Failed to create UoM: ${error.message}`);
    }
  }

  // Update UoM
  async update(data) {
    try {
      const { uom_code, uom_name } = data;
      const result = await query(
        'UPDATE uom SET uom_code = $1, uom_name = $2, updated_at = CURRENT_TIMESTAMP WHERE uom_id = $3 RETURNING *',
        [uom_code, uom_name, this.uom_id]
      );
      if (result.rows.length === 0) {
        throw new Error('UoM not found');
      }
      Object.assign(this, new UoM(result.rows[0]));
      return this;
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('UoM code already exists');
      }
      throw new Error(`Failed to update UoM: ${error.message}`);
    }
  }

  // Delete UoM
  async delete() {
    try {
      // Check if UoM is being used by SKUs
      const skuCheck = await query('SELECT COUNT(*) FROM sku WHERE base_uom_id = $1', [this.uom_id]);
      if (parseInt(skuCheck.rows[0].count) > 0) {
        throw new Error('Cannot delete UoM: It is being used by SKUs');
      }

      const result = await query('DELETE FROM uom WHERE uom_id = $1 RETURNING *', [this.uom_id]);
      if (result.rows.length === 0) {
        throw new Error('UoM not found');
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to delete UoM: ${error.message}`);
    }
  }

  // Validate UoM data
  static validate(data) {
    const errors = [];

    if (!data.uom_code || data.uom_code.trim().length === 0) {
      errors.push('UoM code is required');
    } else if (data.uom_code.length > 10) {
      errors.push('UoM code must be 10 characters or less');
    }

    if (!data.uom_name || data.uom_name.trim().length === 0) {
      errors.push('UoM name is required');
    } else if (data.uom_name.length > 50) {
      errors.push('UoM name must be 50 characters or less');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = UoM;


