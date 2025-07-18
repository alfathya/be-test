import { PrismaClient, ProcessStatus } from "@prisma/client";
import Logger from "$pkg/logger";

const prisma = new PrismaClient();

export function processExcelFile(fileId: number) {
  Logger.info(`Starting background processing for file ID: ${fileId}`);

  updateFileStatus(fileId, ProcessStatus.PROCESSING);

  const processingTime = Math.random() * 2000 + 3000;

  setTimeout(async () => {
    try {
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        const recordsProcessed = Math.floor(Math.random() * 100) + 10;

        await updateFileStatus(fileId, ProcessStatus.SUCCESS, recordsProcessed);
        Logger.info(
          `File ${fileId} processed successfully. Records: ${recordsProcessed}`
        );
      } else {
        await updateFileStatus(
          fileId,
          ProcessStatus.FAILED,
          0,
          "Simulation error: Invalid Excel format"
        );
        Logger.error(`File ${fileId} processing failed`);
      }
    } catch (error) {
      await updateFileStatus(
        fileId,
        ProcessStatus.FAILED,
        0,
        "Unexpected processing error"
      );
      Logger.error(`File ${fileId} processing error: ${error}`);
    }
  }, processingTime);
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
