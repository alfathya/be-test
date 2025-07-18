import { PrismaClient, ProcessStatus } from "@prisma/client";
import Logger from "$pkg/logger";
import { ExcelParser } from "./ExcelParser";

const prisma = new PrismaClient();

export async function processExcelFile(fileId: number) {
  Logger.info(`Starting background processing for file ID: ${fileId}`);

  await updateFileStatus(fileId, ProcessStatus.PROCESSING);

  try {
    const fileRecord = await prisma.fileUpload.findUnique({
      where: { id: fileId },
      select: { id: true, filePath: true, fileUrl: true, filename: true },
    });

    if (!fileRecord) {
      throw new Error("File not found");
    }

    let actualFilePath = fileRecord.filePath;
    if (!actualFilePath && fileRecord.fileUrl) {
      actualFilePath = fileRecord.fileUrl.replace("/uploads/", "uploads/");
      actualFilePath = actualFilePath.startsWith("./")
        ? actualFilePath
        : `./${actualFilePath}`;
    }

    if (!actualFilePath) {
      throw new Error("File path is missing");
    }

    Logger.info(
      `Processing Excel file: ${fileRecord.filename} at ${actualFilePath}`
    );

    const parseResult = await ExcelParser.parseExcelFile(
      actualFilePath,
      fileId
    );

    if (parseResult.success) {
      await updateFileStatus(
        fileId,
        ProcessStatus.SUCCESS,
        parseResult.recordsProcessed
      );
      Logger.info(
        `File ${fileId} processed successfully. Records: ${parseResult.recordsProcessed}`
      );
    } else {
      await updateFileStatus(
        fileId,
        ProcessStatus.FAILED,
        0,
        parseResult.errorMessage || "Unknown parsing error"
      );
      Logger.error(
        `File ${fileId} processing failed: ${parseResult.errorMessage}`
      );
    }
  } catch (error) {
    await updateFileStatus(
      fileId,
      ProcessStatus.FAILED,
      0,
      error instanceof Error ? error.message : "Unexpected processing error"
    );
    Logger.error(`File ${fileId} processing error:`, error);
  }
}

async function updateFileStatus(
  fileId: number,
  status: ProcessStatus,
  recordsProcessed?: number,
  errorMessage?: string
) {
  try {
    await prisma.fileUpload.update({
      where: { id: fileId },
      data: {
        status,
        recordsProcessed,
        errorMessage,
        processedAt: status !== ProcessStatus.PENDING ? new Date() : null,
      },
    });
  } catch (error) {
    Logger.error(`Failed to update file status: ${error}`);
  }
}

export async function getFileStatus(fileId: number) {
  try {
    const file = await prisma.fileUpload.findUnique({
      where: { id: fileId },
      select: {
        id: true,
        filename: true,
        status: true,
        recordsProcessed: true,
        errorMessage: true,
        processedAt: true,
        createdAt: true,
      },
    });
    return file;
  } catch (error) {
    Logger.error(`Failed to get file status: ${error}`);
    return null;
  }
}
