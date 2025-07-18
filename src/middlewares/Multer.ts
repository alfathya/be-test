import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
  // Hanya terima Excel dan CSV
  if (
    file.mimetype.includes("excel") ||
    file.mimetype.includes("csv") ||
    file.originalname.endsWith(".xlsx") ||
    file.originalname.endsWith(".xls")
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter,
});

export default upload;
