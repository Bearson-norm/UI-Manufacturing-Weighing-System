const express = require('express');
const router = express.Router();
const ManufacturingOrder = require('../models/ManufacturingOrder');

// Get all Manufacturing Orders
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let mo;
    
    if (status) {
      mo = await ManufacturingOrder.getByStatus(status);
    } else {
      mo = await ManufacturingOrder.getAll();
    }
    
    res.json({
      success: true,
      data: mo
    });
  } catch (error) {
    console.error('Error fetching Manufacturing Orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Manufacturing Orders',
      error: error.message
    });
  }
});

// Get Manufacturing Order by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mo = await ManufacturingOrder.getById(id);
    
    if (!mo) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturing Order not found'
      });
    }
    
    res.json({
      success: true,
      data: mo
    });
  } catch (error) {
    console.error('Error fetching Manufacturing Order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch Manufacturing Order',
      error: error.message
    });
  }
});

// Get BOM materials for a Manufacturing Order
router.get('/:id/bom', async (req, res) => {
  try {
    const { id } = req.params;
    const mo = await ManufacturingOrder.getById(id);
    
    if (!mo) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturing Order not found'
      });
    }
    
    const bomMaterials = await mo.getBOMMaterials();
    res.json({
      success: true,
      data: bomMaterials
    });
  } catch (error) {
    console.error('Error fetching BOM materials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BOM materials',
      error: error.message
    });
  }
});

// Get material consumption for a Manufacturing Order
router.get('/:id/consumption', async (req, res) => {
  try {
    const { id } = req.params;
    const mo = await ManufacturingOrder.getById(id);
    
    if (!mo) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturing Order not found'
      });
    }
    
    const consumption = await mo.getMaterialConsumption();
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

// Create new Manufacturing Order
router.post('/', async (req, res) => {
  try {
    const validation = ManufacturingOrder.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    const mo = await ManufacturingOrder.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Manufacturing Order created successfully',
      data: mo
    });
  } catch (error) {
    console.error('Error creating Manufacturing Order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Manufacturing Order',
      error: error.message
    });
  }
});

// Update Manufacturing Order
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mo = await ManufacturingOrder.getById(id);
    
    if (!mo) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturing Order not found'
      });
    }
    
    const validation = ManufacturingOrder.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    await mo.update(req.body);
    res.json({
      success: true,
      message: 'Manufacturing Order updated successfully',
      data: mo
    });
  } catch (error) {
    console.error('Error updating Manufacturing Order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update Manufacturing Order',
      error: error.message
    });
  }
});

// Start production
router.post('/:id/start', async (req, res) => {
  try {
    const { id } = req.params;
    const mo = await ManufacturingOrder.getById(id);
    
    if (!mo) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturing Order not found'
      });
    }
    
    await mo.startProduction();
    res.json({
      success: true,
      message: 'Production started successfully',
      data: mo
    });
  } catch (error) {
    console.error('Error starting production:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start production',
      error: error.message
    });
  }
});

// Complete production
router.post('/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const mo = await ManufacturingOrder.getById(id);
    
    if (!mo) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturing Order not found'
      });
    }
    
    await mo.completeProduction();
    res.json({
      success: true,
      message: 'Production completed successfully',
      data: mo
    });
  } catch (error) {
    console.error('Error completing production:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete production',
      error: error.message
    });
  }
});

// Cancel Manufacturing Order
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const mo = await ManufacturingOrder.getById(id);
    
    if (!mo) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturing Order not found'
      });
    }
    
    await mo.cancel();
    res.json({
      success: true,
      message: 'Manufacturing Order cancelled successfully',
      data: mo
    });
  } catch (error) {
    console.error('Error cancelling Manufacturing Order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel Manufacturing Order',
      error: error.message
    });
  }
});

// Delete Manufacturing Order
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mo = await ManufacturingOrder.getById(id);
    
    if (!mo) {
      return res.status(404).json({
        success: false,
        message: 'Manufacturing Order not found'
      });
    }
    
    await mo.delete();
    res.json({
      success: true,
      message: 'Manufacturing Order deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting Manufacturing Order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete Manufacturing Order',
      error: error.message
    });
  }
});

module.exports = router;


