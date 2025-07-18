# 🧪 Testing Guide - Real Excel Parser API

## Overview

Panduan ini akan membantu Anda testing complete flow dari upload Excel file sampai parsing dan saving data ke database.

## 📋 Prerequisites

1. ✅ Database sudah running (MySQL)
2. ✅ Prisma migration sudah dijalankan
3. ✅ Sample Excel files sudah di-generate
4. ✅ Development server running

## 🚀 Step-by-Step Testing

### Step 1: Start Development Server

```bash
npm run dev
```

Server akan running di `http://localhost:3000`

### Step 2: Register/Login User

**POST** `http://localhost:3000/api/auth/register`

```json
{
  "email": "test@example.com",
  "password": "password123",
  "fullName": "Test User"
}
```

**POST** `http://localhost:3000/api/auth/login`

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

📝 **Simpan token JWT** yang dikembalikan untuk request selanjutnya.

### Step 3: Upload Excel File dengan Real Parser

**POST** `http://localhost:3000/api/upload`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data
```

**Body (form-data):**

- Key: `file`
- Type: File
- Value: Pilih salah satu file Excel:
  - `uploads/sample-products.xlsx` (Product Data)
  - `uploads/sample-persons.xlsx` (Person Data)
  - `uploads/sample-sales.xlsx` (Sales Data)

**Expected Response:**

```json
{
  "status": true,
  "message": "File uploaded successfully!",
  "data": {
    "id": 1,
    "filename": "sample-products_1642512345678.xlsx",
    "originalName": "sample-products.xlsx",
    "status": "PENDING",
    "uploadedBy": 1,
    "createdAt": "2025-01-18T...",
    "updatedAt": "2025-01-18T..."
  }
}
```

### Step 4: Monitor Processing Status

**GET** `http://localhost:3000/api/upload/{fileId}`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Expected Response (Processing):**

```json
{
  "status": true,
  "message": "File retrieved successfully!",
  "data": {
    "id": 1,
    "filename": "sample-products_1642512345678.xlsx",
    "status": "PROCESSING",
    "recordsProcessed": null,
    "errorMessage": null,
    "processedAt": null
  }
}
```

**Expected Response (Success):**

```json
{
  "status": true,
  "message": "File retrieved successfully!",
  "data": {
    "id": 1,
    "filename": "sample-products_1642512345678.xlsx",
    "status": "SUCCESS",
    "recordsProcessed": 3,
    "errorMessage": null,
    "processedAt": "2025-01-18T..."
  }
}
```

### Step 5: Verify Data in Database

Setelah status `SUCCESS`, data Excel sudah ter-parse dan tersimpan di database.

**Check Product Data:**

```sql
SELECT * FROM product_data WHERE fileUploadId = 1;
```

**Check Person Data:**

```sql
SELECT * FROM user_data WHERE fileUploadId = 1;
```

**Check Sales Data:**

```sql
SELECT * FROM sales_data WHERE fileUploadId = 1;
```

### Step 6: Get All User Files with Filtering

**GET** `http://localhost:3000/api/upload?status=SUCCESS&page=1&rows=10`

**Headers:**

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🧪 Test Scenarios

### Scenario 1: Product Data Upload

1. Upload `sample-products.xlsx`
2. Verify automatic detection as "product" type
3. Check if 3 products ter-parse dengan benar
4. Verify price, quantity dalam format yang benar

### Scenario 2: Person Data Upload

1. Upload `sample-persons.xlsx`
2. Verify automatic detection as "person" type
3. Check if 3 persons ter-parse dengan benar
4. Verify date parsing untuk `dateOfBirth`

### Scenario 3: Sales Data Upload

1. Upload `sample-sales.xlsx`
2. Verify automatic detection as "sales" type
3. Check if 3 sales records ter-parse dengan benar
4. Verify calculations (totalAmount = quantity \* unitPrice)

### Scenario 4: Invalid File Upload

1. Upload file non-Excel (misalnya .txt)
2. Verify error handling yang proper
3. Check status `FAILED` dengan error message

### Scenario 5: Empty Excel File

1. Upload Excel file kosong
2. Verify error "File Excel kosong atau tidak valid"

## 📊 Expected Data After Parsing

### Product Data (sample-products.xlsx)

```json
[
  {
    "name": "Laptop Gaming",
    "category": "Electronics",
    "price": 15000000,
    "quantity": 10,
    "sku": "LG001",
    "description": "High performance gaming laptop"
  },
  {
    "name": "Mouse Wireless",
    "category": "Electronics",
    "price": 250000,
    "quantity": 50,
    "sku": "MW002",
    "description": "Ergonomic wireless mouse"
  },
  {
    "name": "Keyboard Mechanical",
    "category": "Electronics",
    "price": 800000,
    "quantity": 25,
    "sku": "KM003",
    "description": "RGB mechanical keyboard"
  }
]
```

### Person Data (sample-persons.xlsx)

```json
[
  {
    "fullName": "John Doe",
    "email": "john@example.com",
    "phone": "081234567890",
    "address": "Jakarta",
    "department": "IT",
    "dateOfBirth": "1990-01-15"
  },
  {
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "phone": "081234567891",
    "address": "Bandung",
    "department": "HR",
    "dateOfBirth": "1985-05-20"
  },
  {
    "fullName": "Bob Johnson",
    "email": "bob@example.com",
    "phone": "081234567892",
    "address": "Surabaya",
    "department": "Finance",
    "dateOfBirth": "1988-03-10"
  }
]
```

### Sales Data (sample-sales.xlsx)

```json
[
  {
    "productName": "Laptop Gaming",
    "customerName": "PT. ABC",
    "quantity": 2,
    "unitPrice": 15000000,
    "totalAmount": 30000000,
    "saleDate": "2025-01-15",
    "region": "Jakarta"
  },
  {
    "productName": "Mouse Wireless",
    "customerName": "CV. XYZ",
    "quantity": 10,
    "unitPrice": 250000,
    "totalAmount": 2500000,
    "saleDate": "2025-01-16",
    "region": "Bandung"
  },
  {
    "productName": "Keyboard Mechanical",
    "customerName": "PT. DEF",
    "quantity": 5,
    "unitPrice": 800000,
    "totalAmount": 4000000,
    "saleDate": "2025-01-17",
    "region": "Surabaya"
  }
]
```

## 🔧 Advanced Testing

### Custom Excel Files

Buat Excel file sendiri dengan:

- Column names yang berbeda (ex: "Product Name" vs "name")
- Format data yang bervariasi
- Test robustness parser dalam mendeteksi jenis data

### Error Handling

- Upload file corrupt Excel
- Upload Excel dengan format yang tidak dikenali
- Test dengan data yang invalid (ex: text di kolom numeric)

## 📝 Notes

- Background processing berjalan real-time (tidak pakai setTimeout lagi)
- Auto-detection berdasarkan column names
- Parsing mendukung berbagai format date dan number
- Error handling yang comprehensive untuk berbagai edge cases

## 🎯 Success Criteria

✅ File ter-upload dengan status PENDING
✅ Background processing mengubah status ke PROCESSING lalu SUCCESS
✅ Data ter-parse dan tersimpan di database dengan benar
✅ Auto-detection type berkerja untuk 3 jenis data
✅ Error handling proper untuk invalid files
✅ API endpoints memberikan response yang konsisten
