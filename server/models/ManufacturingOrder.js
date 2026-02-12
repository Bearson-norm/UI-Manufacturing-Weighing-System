const { query } = require('../database/connection');

class ManufacturingOrder {
  constructor(data) {
    this.mo_id = data.mo_id;
    this.mo_code = data.mo_code;
    this.fg_sku_id = data.fg_sku_id;
    this.planned_qty = data.planned_qty;
    this.produced_qty = data.produced_qty;
    this.uom_id = data.uom_id;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.mo_status = data.mo_status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Get all Manufacturing Orders
  static async getAll() {
    try {
      const result = await query(`
        SELECT mo.*, 
               s.sku_code, s.sku_name,
               u.uom_code, u.uom_name
        FROM manufacturing_order mo
        JOIN sku s ON mo.fg_sku_id = s.sku_id
        JOIN uom u ON mo.uom_id = u.uom_id
        ORDER BY mo.created_at DESC
      `);
      return result.rows.map(row => ({
        ...new ManufacturingOrder(row),
        sku_code: row.sku_code,
        sku_name: row.sku_name,
        uom_code: row.uom_code,
        uom_name: row.uom_name
      }));
    } catch (error) {
      throw new Error(`Failed to fetch Manufacturing Orders: ${error.message}`);
    }
  }

  // Get Manufacturing Order by ID
  static async getById(id) {
    try {
      const result = await query(`
        SELECT mo.*, 
               s.sku_code, s.sku_name,
               u.uom_code, u.uom_name
        FROM manufacturing_order mo
        JOIN sku s ON mo.fg_sku_id = s.sku_id
        JOIN uom u ON mo.uom_id = u.uom_id
        WHERE mo.mo_id = $1
      `, [id]);
      if (result.rows.length === 0) {
        return null;
      }
      const row = result.rows[0];
      return {
        ...new ManufacturingOrder(row),
        sku_code: row.sku_code,
        sku_name: row.sku_name,
        uom_code: row.uom_code,
        uom_name: row.uom_name
      };
    } catch (error) {
      throw new Error(`Failed to fetch Manufacturing Order: ${error.message}`);
    }
  }

  // Get Manufacturing Orders by status
  static async getByStatus(status) {
    try {
      const result = await query(`
        SELECT mo.*, 
               s.sku_code, s.sku_name,
               u.uom_code, u.uom_name
        FROM manufacturing_order mo
        JOIN sku s ON mo.fg_sku_id = s.sku_id
        JOIN uom u ON mo.uom_id = u.uom_id
        WHERE mo.mo_status = $1
        ORDER BY mo.created_at DESC
      `, [status]);
      return result.rows.map(row => ({
        ...new ManufacturingOrder(row),
        sku_code: row.sku_code,
        sku_name: row.sku_name,
        uom_code: row.uom_code,
        uom_name: row.uom_name
      }));
    } catch (error) {
      throw new Error(`Failed to fetch Manufacturing Orders by status: ${error.message}`);
    }
  }

  // Generate next MO code
  static async generateMOCode() {
    try {
      const year = new Date().getFullYear();
      const result = await query(
        'SELECT mo_code FROM manufacturing_order WHERE mo_code LIKE $1 ORDER BY mo_code DESC LIMIT 1',
        [`MO-${year}-%`]
      );
      
      if (result.rows.length === 0) {
        return `MO-${year}-0001`;
      }
      
      const lastCode = result.rows[0].mo_code;
      const match = lastCode.match(/MO-\d+-(\d+)/);
      if (match) {
        const nextNum = String(parseInt(match[1]) + 1).padStart(4, '0');
        return `MO-${year}-${nextNum}`;
      }
      
      return `MO-${year}-0001`;
    } catch (error) {
      throw new Error(`Failed to generate MO code: ${error.message}`);
    }
  }

  // Create new Manufacturing Order
  static async create(data) {
    try {
      const { fg_sku_id, planned_qty, uom_id } = data;
      const mo_code = await ManufacturingOrder.generateMOCode();
      
      const result = await query(
        'INSERT INTO manufacturing_order (mo_code, fg_sku_id, planned_qty, uom_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [mo_code, fg_sku_id, planned_qty, uom_id]
      );
      return new ManufacturingOrder(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('MO code already exists');
      }
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Invalid SKU or UoM ID');
      }
      if (error.code === '23514') { // Check constraint violation
        throw new Error('Planned quantity must be greater than 0');
      }
      throw new Error(`Failed to create Manufacturing Order: ${error.message}`);
    }
  }

  // Update Manufacturing Order
  async update(data) {
    try {
      const { fg_sku_id, planned_qty, uom_id } = data;
      
      // Only allow updates if status is Draft
      if (this.mo_status !== 'Draft') {
        throw new Error('Only Draft Manufacturing Orders can be updated');
      }
      
      const result = await query(
        'UPDATE manufacturing_order SET fg_sku_id = $1, planned_qty = $2, uom_id = $3, updated_at = CURRENT_TIMESTAMP WHERE mo_id = $4 RETURNING *',
        [fg_sku_id, planned_qty, uom_id, this.mo_id]
      );
      if (result.rows.length === 0) {
        throw new Error('Manufacturing Order not found');
      }
      Object.assign(this, new ManufacturingOrder(result.rows[0]));
      return this;
    } catch (error) {
      if (error.code === '23503') { // Foreign key violation
        throw new Error('Invalid SKU or UoM ID');
      }
      if (error.code === '23514') { // Check constraint violation
        throw new Error('Planned quantity must be greater than 0');
      }
      throw new Error(`Failed to update Manufacturing Order: ${error.message}`);
    }
  }

  // Start production
  async startProduction() {
    try {
      if (this.mo_status !== 'Draft') {
        throw new Error('Only Draft Manufacturing Orders can be started');
      }
      
      const result = await query(
        'UPDATE manufacturing_order SET mo_status = $1, start_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE mo_id = $2 RETURNING *',
        ['In Progress', this.mo_id]
      );
      if (result.rows.length === 0) {
        throw new Error('Manufacturing Order not found');
      }
      Object.assign(this, new ManufacturingOrder(result.rows[0]));
      return this;
    } catch (error) {
      throw new Error(`Failed to start production: ${error.message}`);
    }
  }

  // Complete production
  async completeProduction() {
    try {
      if (this.mo_status !== 'In Progress') {
        throw new Error('Only In Progress Manufacturing Orders can be completed');
      }
      
      const result = await query(
        'UPDATE manufacturing_order SET mo_status = $1, end_date = CURRENT_TIMESTAMP, produced_qty = planned_qty, updated_at = CURRENT_TIMESTAMP WHERE mo_id = $2 RETURNING *',
        ['Completed', this.mo_id]
      );
      if (result.rows.length === 0) {
        throw new Error('Manufacturing Order not found');
      }
      Object.assign(this, new ManufacturingOrder(result.rows[0]));
      return this;
    } catch (error) {
      throw new Error(`Failed to complete production: ${error.message}`);
    }
  }

  // Cancel Manufacturing Order
  async cancel() {
    try {
      if (this.mo_status === 'Completed') {
        throw new Error('Completed Manufacturing Orders cannot be cancelled');
      }
      
      const result = await query(
        'UPDATE manufacturing_order SET mo_status = $1, updated_at = CURRENT_TIMESTAMP WHERE mo_id = $2 RETURNING *',
        ['Cancelled', this.mo_id]
      );
      if (result.rows.length === 0) {
        throw new Error('Manufacturing Order not found');
      }
      Object.assign(this, new ManufacturingOrder(result.rows[0]));
      return this;
    } catch (error) {
      throw new Error(`Failed to cancel Manufacturing Order: ${error.message}`);
    }
  }

  // Delete Manufacturing Order
  async delete() {
    try {
      if (this.mo_status !== 'Draft') {
        throw new Error('Only Draft Manufacturing Orders can be deleted');
      }
      
      const result = await query('DELETE FROM manufacturing_order WHERE mo_id = $1 RETURNING *', [this.mo_id]);
      if (result.rows.length === 0) {
        throw new Error('Manufacturing Order not found');
      }
      return true;
    } catch (error) {
      throw new Error(`Failed to delete Manufacturing Order: ${error.message}`);
    }
  }

  // Get BOM materials for this MO
  async getBOMMaterials() {
    try {
      const BOM = require('./BOM');
      return await BOM.getByFG(this.fg_sku_id);
    } catch (error) {
      throw new Error(`Failed to fetch BOM materials: ${error.message}`);
    }
  }

  // Get material consumption for this MO
  async getMaterialConsumption() {
    try {
      const result = await query(`
        SELECT mc.*, 
               s.sku_code, s.sku_name,
               u.uom_code, u.uom_name
        FROM material_consumption mc
        JOIN sku s ON mc.raw_sku_id = s.sku_id
        JOIN uom u ON mc.uom_id = u.uom_id
        WHERE mc.mo_id = $1
        ORDER BY mc.consumption_date
      `, [this.mo_id]);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to fetch material consumption: ${error.message}`);
    }
  }

  // Validate Manufacturing Order data
  static validate(data) {
    const errors = [];
    const validStatuses = ['Draft', 'In Progress', 'Completed', 'Cancelled'];

    if (!data.fg_sku_id || !Number.isInteger(Number(data.fg_sku_id))) {
      errors.push('Valid finished goods SKU ID is required');
    }

    if (!data.planned_qty || isNaN(Number(data.planned_qty)) || Number(data.planned_qty) <= 0) {
      errors.push('Valid planned quantity greater than 0 is required');
    }

    if (!data.uom_id || !Number.isInteger(Number(data.uom_id))) {
      errors.push('Valid UoM ID is required');
    }

    if (data.mo_status && !validStatuses.includes(data.mo_status)) {
      errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

module.exports = ManufacturingOrder;


