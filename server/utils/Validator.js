import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  res.status(400).json({ message: 'Bad request', errors: errors.array() });
};

export const roomCreationValidation = [
  body('title', 'Title is either too short or too long').isLength({ min: 3, max: 128 }),
  body('video').isURL(),
];
