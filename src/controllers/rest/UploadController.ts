import { Request, Response } from "express";
import * as UploadService from "$services/UploadService";
import { handleServiceErrorWithResponse, response_success } from "$utils/response.utils";
import { FilteringQueryV2 } from "$entities/Query";
import Logger from "$pkg/logger";

export async function upload(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;
    const { file } = req;

    if (!file) {
      return res.status(400).json({
        status: false,
        message: "No file uploaded. Please upload the file!",
      });
    }

    const serviceUpload = await UploadService.uploadFile(file, userId);

    if (!serviceUpload.status)
      return handleServiceErrorWithResponse(res, serviceUpload);

    return response_success(
      res,
      serviceUpload.data,
      "File uploaded successfully!"
    );
  } catch (error) {
    Logger.error(`UploadController.upload: ${error}`);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
}

export async function getFiles(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;

    const filteringQuery: FilteringQueryV2 = {
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      rows: req.query.rows ? parseInt(req.query.rows as string) : 10,
      orderKey: "createdAt",
      orderRule: "desc",
      filters: {},
      searchFilters: {},
      rangedFilters: [],
    };

    if (req.query.status) {
      filteringQuery.filters!.status = req.query.status;
    }

    const serviceResponse = await UploadService.getFileByUserId(
      userId,
      filteringQuery
    );

    if (!serviceResponse.status)
      return handleServiceErrorWithResponse(res, serviceResponse);

    return response_success(
      res,
      serviceResponse.data,
      "Files retrieved successfully!"
    );
  } catch (error) {
    Logger.error(`UploadController.getFiles: ${error}`);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
}

export async function getFileById(req: Request, res: Response): Promise<Response> {
  try {
    const userId = req.user!.id;
    const fileId = parseInt(req.params.id);

    if (isNaN(fileId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid type id",
      });
    }

    const fileRecord = await UploadService.getFileById(fileId, userId);

    if (!fileRecord.status)
      return handleServiceErrorWithResponse(res, fileRecord);

    return response_success(res, fileRecord.data, "File retrieved succefully!");
  } catch (error) {
    Logger.error(`UploadController.upload: ${error}`);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
}
