import { Router } from 'express';
import * as UploadController from '$controllers/rest/UploadController';
import authentication from '$middlewares/Authentication';
import upload from '$middlewares/Multer';
import { validateFileUpload, validateFileId } from '$validations/fileUploadValidation';

const UploadRoutes = Router({ mergeParams: true });

UploadRoutes.post("/", authentication.userAuthentication, upload.single("file"), validateFileUpload, UploadController.upload);
UploadRoutes.get("/files", authentication.userAuthentication, UploadController.getFiles);
UploadRoutes.get("/file/:id", authentication.userAuthentication, validateFileId, UploadController.getFileById);

export default UploadRoutes;