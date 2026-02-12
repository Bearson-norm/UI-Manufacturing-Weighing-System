const express = require('express');
const router = express.Router();
const SKU = require('../models/SKU');

// Get all SKUs
router.get('/', async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const skus = await SKU.getAll(includeInactive === 'true');
    res.json({
      success: true,
      data: skus
    });
  } catch (error) {
    console.error('Error fetching SKUs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SKUs',
      error: error.message
    });
  }
});

// Get SKU by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sku = await SKU.getById(id);
    
    if (!sku) {
      return res.status(404).json({
        success: false,
        message: 'SKU not found'
      });
    }
    
    res.json({
      success: true,
      data: sku
    });
  } catch (error) {
    console.error('Error fetching SKU:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SKU',
      error: error.message
    });
  }
});

// Get SKUs by type
router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const skus = await SKU.getByType(type);
    res.json({
      success: true,
      data: skus
    });
  } catch (error) {
    console.error('Error fetching SKUs by type:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SKUs by type',
      error: error.message
    });
  }
});

// Create new SKU
router.post('/', async (req, res) => {
  try {
    const validation = SKU.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    const sku = await SKU.create(req.body);
    res.status(201).json({
      success: true,
      message: 'SKU created successfully',
      data: sku
    });
  } catch (error) {
    console.error('Error creating SKU:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create SKU',
      error: error.message
    });
  }
});

// Update SKU
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sku = await SKU.getById(id);
    
    if (!sku) {
      return res.status(404).json({
        success: false,
        message: 'SKU not found'
      });
    }
    
    const validation = SKU.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    await sku.update(req.body);
    res.json({
      success: true,
      message: 'SKU updated successfully',
      data: sku
    });
  } catch (error) {
    console.error('Error updating SKU:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update SKU',
      error: error.message
    });
  }
});

// Soft delete SKU
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sku = await SKU.getById(id);
    
    if (!sku) {
      return res.status(404).json({
        success: false,
        message: 'SKU not found'
      });
    }
    
    await sku.softDelete();
    res.json({
      success: true,
      message: 'SKU deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting SKU:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete SKU',
      error: error.message
    });
  }
});

// Hard delete SKU
router.delete('/:id/hard', async (req, res) => {
  try {
    const { id } = req.params;
    const sku = await SKU.getById(id);
    
    if (!sku) {
      return res.status(404).json({
        success: false,
        message: 'SKU not found'
      });
    }
    
    await sku.delete();
    res.json({
      success: true,
      message: 'SKU permanently deleted'
    });
  } catch (error) {
    console.error('Error hard deleting SKU:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete SKU',
      error: error.message
    });
  }
});

module.exports = router;


