const express = require('express');
const router = express.Router();
const BOM = require('../models/BOM');

// Get BOM items for a finished goods SKU
router.get('/fg/:fg_sku_id', async (req, res) => {
  try {
    const { fg_sku_id } = req.params;
    const { includeInactive } = req.query;
    const bomItems = await BOM.getByFG(fg_sku_id, includeInactive === 'true');
    res.json({
      success: true,
      data: bomItems
    });
  } catch (error) {
    console.error('Error fetching BOM items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BOM items',
      error: error.message
    });
  }
});

// Get BOM item by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bomItem = await BOM.getById(id);
    
    if (!bomItem) {
      return res.status(404).json({
        success: false,
        message: 'BOM item not found'
      });
    }
    
    res.json({
      success: true,
      data: bomItem
    });
  } catch (error) {
    console.error('Error fetching BOM item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BOM item',
      error: error.message
    });
  }
});

// Create new BOM item
router.post('/', async (req, res) => {
  try {
    const validation = BOM.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    const bomItem = await BOM.create(req.body);
    res.status(201).json({
      success: true,
      message: 'BOM item created successfully',
      data: bomItem
    });
  } catch (error) {
    console.error('Error creating BOM item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create BOM item',
      error: error.message
    });
  }
});

// Update BOM item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bomItem = await BOM.getById(id);
    
    if (!bomItem) {
      return res.status(404).json({
        success: false,
        message: 'BOM item not found'
      });
    }
    
    const validation = BOM.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    await bomItem.update(req.body);
    res.json({
      success: true,
      message: 'BOM item updated successfully',
      data: bomItem
    });
  } catch (error) {
    console.error('Error updating BOM item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update BOM item',
      error: error.message
    });
  }
});

// Soft delete BOM item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bomItem = await BOM.getById(id);
    
    if (!bomItem) {
      return res.status(404).json({
        success: false,
        message: 'BOM item not found'
      });
    }
    
    await bomItem.softDelete();
    res.json({
      success: true,
      message: 'BOM item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting BOM item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete BOM item',
      error: error.message
    });
  }
});

// Hard delete BOM item
router.delete('/:id/hard', async (req, res) => {
  try {
    const { id } = req.params;
    const bomItem = await BOM.getById(id);
    
    if (!bomItem) {
      return res.status(404).json({
        success: false,
        message: 'BOM item not found'
      });
    }
    
    await bomItem.delete();
    res.json({
      success: true,
      message: 'BOM item permanently deleted'
    });
  } catch (error) {
    console.error('Error hard deleting BOM item:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete BOM item',
      error: error.message
    });
  }
});

module.exports = router;


