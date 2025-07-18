import { Request, Response, NextFunction } from 'express';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, confirmPassword, firstName, lastName } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: 'Email is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        status: false,
        message: 'Password is required'
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        status: false,
        message: 'Confirm password is required'
      });
    }

    if (!firstName) {
      return res.status(400).json({
        status: false,
        message: 'First name is required'
      });
    }

    if (!lastName) {
      return res.status(400).json({
        status: false,
        message: 'Last name is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid email format'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: false,
        message: 'Password and confirm password do not match'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Validation error'
    });
  }
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: 'Email is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        status: false,
        message: 'Password is required'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid email format'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'Validation error'
    });
  }
};