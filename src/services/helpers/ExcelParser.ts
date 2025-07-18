import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface ParseResult {
  success: boolean;
  recordsProcessed: number;
  errorMessage?: string;
}

export class ExcelParser {
  static async parseExcelFile(
    filePath: string,
    fileUploadId: number
  ): Promise<ParseResult> {
    try {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 2000 + 1000)
      );

      const isSuccess = Math.random() > 0.1;

      if (!isSuccess) {
        return {
          success: false,
          recordsProcessed: 0,
          errorMessage: "Simulasi parsing error: Invalid Excel format",
        };
      }

      const sampleData = this.generateSampleDataByFilename(filePath);

      let recordsProcessed = 0;

      if (sampleData.type === "product") {
        recordsProcessed = await this.saveProductData(
          sampleData.data,
          fileUploadId
        );
      } else if (sampleData.type === "person") {
        recordsProcessed = await this.savePersonData(
          sampleData.data,
          fileUploadId
        );
      } else if (sampleData.type === "sales") {
        recordsProcessed = await this.saveSalesData(
          sampleData.data,
          fileUploadId
        );
      }

      return {
        success: true,
        recordsProcessed,
      };
    } catch (error) {
      console.error("Error in mock Excel parser:", error);
      return {
        success: false,
        recordsProcessed: 0,
        errorMessage:
          error instanceof Error ? error.message : "Unknown parsing error",
      };
    }
  }

  private static generateSampleDataByFilename(filePath: string) {
    const filename = filePath.toLowerCase();
    console.log("DEBUG: Full filename:", filename);

    if (filename.includes("sales")) {
      console.log("DEBUG: Detected as SALES");
      return {
        type: "sales",
        data: [
          {
            productName: "Laptop Gaming",
            customerName: "PT. ABC",
            quantity: 2,
            unitPrice: 15000000,
            totalAmount: 30000000,
            region: "Jakarta",
          },
          {
            productName: "Mouse Wireless",
            customerName: "CV. XYZ",
            quantity: 10,
            unitPrice: 250000,
            totalAmount: 2500000,
            region: "Bandung",
          },
          {
            productName: "Keyboard Mechanical",
            customerName: "PT. DEF",
            quantity: 5,
            unitPrice: 800000,
            totalAmount: 4000000,
            region: "Surabaya",
          },
        ],
      };
    } else if (filename.includes("product")) {
      console.log("DEBUG: Detected as PRODUCT");
      return {
        type: "product",
        data: [
          {
            name: "Laptop Gaming",
            category: "Electronics",
            price: 15000000,
            quantity: 10,
            sku: "LG001",
          },
          {
            name: "Mouse Wireless",
            category: "Electronics",
            price: 250000,
            quantity: 50,
            sku: "MW002",
          },
          {
            name: "Keyboard Mechanical",
            category: "Electronics",
            price: 800000,
            quantity: 25,
            sku: "KM003",
          },
        ],
      };
    } else if (filename.includes("person") || filename.includes("user")) {
      console.log("DEBUG: Detected as PERSON");
      return {
        type: "person",
        data: [
          {
            fullName: "John Doe",
            email: "john@example.com",
            phone: "081234567890",
            address: "Jakarta",
            department: "IT",
          },
          {
            fullName: "Jane Smith",
            email: "jane@example.com",
            phone: "081234567891",
            address: "Bandung",
            department: "HR",
          },
          {
            fullName: "Bob Johnson",
            email: "bob@example.com",
            phone: "081234567892",
            address: "Surabaya",
            department: "Finance",
          },
        ],
      };
    }
    return {
      type: "product",
      data: [
        {
          name: "Default Product",
          category: "General",
          price: 100000,
          quantity: 1,
          sku: "DEF001",
        },
      ],
    };
  }

  private static async saveProductData(
    data: any[],
    fileUploadId: number
  ): Promise<number> {
    const productData = data.map((item) => ({
      name: item.name,
      category: item.category || null,
      price: item.price || null,
      quantity: item.quantity || null,
      sku: item.sku || null,
      description: item.description || null,
      fileUploadId,
    }));

    await prisma.productData.createMany({
      data: productData,
    });

    return productData.length;
  }

  private static async savePersonData(
    data: any[],
    fileUploadId: number
  ): Promise<number> {
    const personData = data.map((item) => ({
      fullName: item.fullName,
      email: item.email,
      phone: item.phone || null,
      address: item.address || null,
      dateOfBirth: item.dateOfBirth ? new Date(item.dateOfBirth) : null,
      department: item.department || null,
      fileUploadId,
    }));

    await prisma.personData.createMany({
      data: personData,
    });

    return personData.length;
  }

  private static async saveSalesData(
    data: any[],
    fileUploadId: number
  ): Promise<number> {
    const salesData = data.map((item) => ({
      productName: item.productName,
      customerName: item.customerName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalAmount: item.totalAmount,
      saleDate: item.saleDate ? new Date(item.saleDate) : new Date(),
      region: item.region || null,
      fileUploadId,
    }));

    await prisma.salesData.createMany({
      data: salesData,
    });

    return salesData.length;
  }
}
