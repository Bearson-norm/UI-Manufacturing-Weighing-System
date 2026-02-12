const Joi = require('joi');

// Generic validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// UoM validation schemas
const uomSchemas = {
  create: Joi.object({
    uom_code: Joi.string().max(10).required(),
    uom_name: Joi.string().max(50).required()
  }),
  update: Joi.object({
    uom_code: Joi.string().max(10),
    uom_name: Joi.string().max(50)
  })
};

// SKU validation schemas
const skuSchemas = {
  create: Joi.object({
    sku_code: Joi.string().max(50).required(),
    sku_name: Joi.string().max(100).required(),
    sku_type: Joi.string().valid('Raw Material', 'Finished Goods', 'Semi Finished Goods').required(),
    base_uom_id: Joi.number().integer().positive().required()
  }),
  update: Joi.object({
    sku_code: Joi.string().max(50),
    sku_name: Joi.string().max(100),
    sku_type: Joi.string().valid('Raw Material', 'Finished Goods', 'Semi Finished Goods'),
    base_uom_id: Joi.number().integer().positive()
  })
};

// BOM validation schemas
const bomSchemas = {
  create: Joi.object({
    fg_sku_id: Joi.number().integer().positive().required(),
    raw_sku_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().positive().required(),
    uom_id: Joi.number().integer().positive().required()
  }),
  update: Joi.object({
    raw_sku_id: Joi.number().integer().positive(),
    quantity: Joi.number().positive(),
    uom_id: Joi.number().integer().positive()
  })
};

// Manufacturing Order validation schemas
const moSchemas = {
  create: Joi.object({
    fg_sku_id: Joi.number().integer().positive().required(),
    planned_qty: Joi.number().positive().required(),
    uom_id: Joi.number().integer().positive().required()
  }),
  update: Joi.object({
    fg_sku_id: Joi.number().integer().positive(),
    planned_qty: Joi.number().positive(),
    uom_id: Joi.number().integer().positive()
  })
};

// Material Consumption validation schemas
const consumptionSchemas = {
  create: Joi.object({
    mo_id: Joi.number().integer().positive().required(),
    raw_sku_id: Joi.number().integer().positive().required(),
    consumed_qty: Joi.number().positive().required(),
    uom_id: Joi.number().integer().positive().required()
  }),
  update: Joi.object({
    consumed_qty: Joi.number().positive(),
    uom_id: Joi.number().integer().positive()
  })
};

module.exports = {
  validateRequest,
  uomSchemas,
  skuSchemas,
  bomSchemas,
  moSchemas,
  consumptionSchemas
};


