const { body } = require('express-validator');

exports.productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required')
    .isLength({ max: 150 }).withMessage('Name cannot exceed 150 characters'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('discountPrice')
    .optional({ nullable: true })
    .isFloat({ min: 0 }).withMessage('Discount price must be a positive number'),
  body('category').notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category id'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

exports.reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required')
    .isLength({ max: 1000 }).withMessage('Comment cannot exceed 1000 characters'),
];
