import { Request, Response, NextFunction } from 'express';

export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        status: false,
        message: 'No file uploaded'
      });
    }

    // File size validation (100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      return res.status(400).json({
        status: false,
        message: 'File size too large. Maximum 100MB allowed'
      });
    }

    // File type validation
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed'
      });
    }

    // File extension validation
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.originalname.toLowerCase();
    const hasValidExtension = allowedExtensions.some(ext => fileExtension.endsWith(ext));

    if (!hasValidExtension) {
      return res.status(400).json({
        status: false,
        message: 'Invalid file extension. Only .xlsx, .xls, and .csv files are allowed'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: 'File validation error'
    });
  }
};

export const validateFileId = (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: false,
        message: 'File ID is required'
      });
    }

    const fileId = parseInt(id);
    if (isNaN(fileId) || fileId <= 0) {
      return res.status(400).json({
        status: false,
        message: 'Invalid file ID'
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