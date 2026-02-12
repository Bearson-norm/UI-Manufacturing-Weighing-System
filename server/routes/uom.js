const express = require('express');
const router = express.Router();
const UoM = require('../models/UoM');
const { validateRequest } = require('../middleware/validation');

// Get all UoMs
router.get('/', async (req, res) => {
  try {
    const uoms = await UoM.getAll();
    res.json({
      success: true,
      data: uoms
    });
  } catch (error) {
    console.error('Error fetching UoMs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch UoMs',
      error: error.message
    });
  }
});

// Get UoM by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const uom = await UoM.getById(id);
    
    if (!uom) {
      return res.status(404).json({
        success: false,
        message: 'UoM not found'
      });
    }
    
    res.json({
      success: true,
      data: uom
    });
  } catch (error) {
    console.error('Error fetching UoM:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch UoM',
      error: error.message
    });
  }
});

// Create new UoM
router.post('/', async (req, res) => {
  try {
    const validation = UoM.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    const uom = await UoM.create(req.body);
    res.status(201).json({
      success: true,
      message: 'UoM created successfully',
      data: uom
    });
  } catch (error) {
    console.error('Error creating UoM:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create UoM',
      error: error.message
    });
  }
});

// Update UoM
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const uom = await UoM.getById(id);
    
    if (!uom) {
      return res.status(404).json({
        success: false,
        message: 'UoM not found'
      });
    }
    
    const validation = UoM.validate(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
    
    await uom.update(req.body);
    res.json({
      success: true,
      message: 'UoM updated successfully',
      data: uom
    });
  } catch (error) {
    console.error('Error updating UoM:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update UoM',
      error: error.message
    });
  }
});

// Delete UoM
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const uom = await UoM.getById(id);
    
    if (!uom) {
      return res.status(404).json({
        success: false,
        message: 'UoM not found'
      });
    }
    
    await uom.delete();
    res.json({
      success: true,
      message: 'UoM deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting UoM:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete UoM',
      error: error.message
    });
  }
});

module.exports = router;


