const express = require('express');
const router = express.Router();
const MaterialConsumption = require('../models/MaterialConsumption');

// Get all material consumption records
router.get('/', async (req, res) => {
  try {
    const consumption = await MaterialConsumption.getAll();
    res.json({
      success: true,
      data: consumption
    });
  } catch (error) {
    console.error('Error fetching material consumption:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch material consumption',
      error: error.message
    });
  }
});

// Get consumption records by MO ID
router.get('/mo/:mo_id', async (req, res) => {
  try {
    const { mo_id } = req.params;
    const consumption = await MaterialConsumption.getByMO(mo_id);
    res.json({
      success: true,
      data: consumption
    });
  } catch (error) {
    console.error('Error fetching consumption by MO:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consumption by MO',
      error: error.message
    });
  }
});

// Get consumption records by raw material SKU
router.get('/material/:raw_sku_id', async (req, res) => {
  try {
    const { raw_sku_id } = req.params;
    const consumption = await MaterialConsumption.getByRawMaterial(raw_sku_id);
    res.json({
      success: true,
      data: consumption
    });
  } catch (error) {
    console.error('Error fetching consumption by material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consumption by material',
      error: error.message
    });
  }
});

// Get consumption summary by MO
router.get('/summary/mo/:mo_id', async (req, res) => {
  try {
    const { mo_id } = req.params;
    const summary = await MaterialConsumption.getSummaryByMO(mo_id);
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching consumption summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consumption summary',
      error: error.message
    });
  }
});

// Get consumption record by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const consumption = await MaterialConsumption.getById(id);
    
    if (!consumption) {
      return res.status(404).json({
        success: false,
        message: 'Consumption record not found'
      });
    }
    
    res.json({
      success: true,
      data: consumption
    });
  } catch (error) {
    console.error('Error fetching consumption record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consumption record',
      error: error.message
    });
  }
});

// Create new consumption record
router.post('/', async (req, res) => {
  try {
    const validation = MaterialConsumption.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    const consumption = await MaterialConsumption.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Consumption record created successfully',
      data: consumption
    });
  } catch (error) {
    console.error('Error creating consumption record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create consumption record',
      error: error.message
    });
  }
});

// Update consumption record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const consumption = await MaterialConsumption.getById(id);
    
    if (!consumption) {
      return res.status(404).json({
        success: false,
        message: 'Consumption record not found'
      });
    }
    
    const validation = MaterialConsumption.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    await consumption.update(req.body);
    res.json({
      success: true,
      message: 'Consumption record updated successfully',
      data: consumption
    });
  } catch (error) {
    console.error('Error updating consumption record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consumption record',
      error: error.message
    });
  }
});

// Delete consumption record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const consumption = await MaterialConsumption.getById(id);
    
    if (!consumption) {
      return res.status(404).json({
        success: false,
        message: 'Consumption record not found'
      });
    }
    
    await consumption.delete();
    res.json({
      success: true,
      message: 'Consumption record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting consumption record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete consumption record',
      error: error.message
    });
  }
});

module.exports = router;


