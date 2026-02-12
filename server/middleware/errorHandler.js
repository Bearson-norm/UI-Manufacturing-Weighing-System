const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  };

  // Database errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        error.message = 'Duplicate entry';
        error.statusCode = 400;
        break;
      case '23503': // Foreign key violation
        error.message = 'Referenced record not found';
        error.statusCode = 400;
        break;
      case '23514': // Check constraint violation
        error.message = 'Invalid data provided';
        error.statusCode = 400;
        break;
      case '42P01': // Undefined table
        error.message = 'Database table not found';
        error.statusCode = 500;
        break;
      case 'ECONNREFUSED': // Connection refused
        error.message = 'Database connection failed';
        error.statusCode = 500;
        break;
      default:
        error.message = 'Database error';
        error.statusCode = 500;
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    error.message = 'Validation failed';
    error.errors = err.details || err.message;
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // Syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    error.message = 'Invalid JSON';
    error.statusCode = 400;
  }

  const statusCode = error.statusCode || err.statusCode || 500;
  res.status(statusCode).json(error);
};

module.exports = errorHandler;


