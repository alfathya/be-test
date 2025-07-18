import { PrismaClient, ProcessStatus } from "@prisma/client";
import {
  ServiceResponse,
  INTERNAL_SERVER_ERROR_SERVICE_RESPONSE,
} from "$entities/Service";
import { processExcelFile } from "./helpers/BackgroundProcessor";
import Logger from "$pkg/logger";
import { FilteringQueryV2 } from "$entities/Query";
import { buildFilterQueryLimitOffsetV2 } from "./helpers/FilterQueryV2";

const prisma = new PrismaClient();

export async function uploadFile(
  fileData: any,
  userId: number
): Promise<ServiceResponse<any>> {
  try {
    // Generate filename untuk memory storage
    const timestamp = Date.now();
    const filename = `${timestamp}-${fileData.originalname}`;

    const data = {
      filename: filename,
      originalName: fileData.originalname,
      filePath: fileData.path || null,
      fileUrl: `/uploads/${filename}`,
      uploadedBy: userId,
      status: ProcessStatus.PENDING,
    };

    const recordFile = await prisma.fileUpload.create({ data });

    processExcelFile(recordFile.id);

    return {
      status: true,
      data: {
        id: recordFile.id,
        filename: recordFile.filename,
        originalName: recordFile.originalName,
        status: recordFile.status,
        uploadedAt: recordFile.createdAt,
      },
    };
  } catch (err) {
    Logger.error(`FileUploadService.uploadFile: ${err}`);
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE;
  }
}

export async function getFileByUserId(
  userId: number,
  filteringQuery: FilteringQueryV2
): Promise<ServiceResponse<any>> {
  try {
    const whereCondition = { uploadedBy: userId };

    const dynamicFilter = buildFilterQueryLimitOffsetV2(filteringQuery);

    const finalWhere = {
      AND: [whereCondition, ...(dynamicFilter.where.AND || [])],
    };

    const totalFiles = await prisma.fileUpload.count({
      where: finalWhere,
    });

    const files = await prisma.fileUpload.findMany({
      where: finalWhere,
      select: {
        id: true,
        filename: true,
        originalName: true,
        status: true,
        recordsProcessed: true,
        errorMessage: true,
        processedAt: true,
        createdAt: true,
      },
      orderBy: dynamicFilter.orderBy,
      skip: dynamicFilter.skip,
      take: dynamicFilter.take,
    });

    const page = filteringQuery.page || 1;
    const rows = filteringQuery.rows || 10;
    const totalPages = Math.ceil(totalFiles / rows);

    return {
      status: true,
      data: {
        files,
        pagination: {
          page,
          rows,
          total: totalFiles,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    };
  } catch (err) {
    Logger.error(`UploadService.getFileById: ${err}`);
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE;
  }
}

export async function getFileById(
  fileId: number,
  userId: number
): Promise<ServiceResponse<any>> {
  try {
    const fileRecord = await prisma.fileUpload.findFirst({
      where: {
        id: fileId,
        uploadedBy: userId,
      },
    });

    if (!fileRecord) {
      return {
        status: false,
        err: {
          message: "file not found",
          code: 404,
        },
      };
    }

    return {
      status: true,
      data: fileRecord,
    };
  } catch (err) {
    Logger.error(`UploadService.getFileById: ${err}`);
    return INTERNAL_SERVER_ERROR_SERVICE_RESPONSE;
  }
}
