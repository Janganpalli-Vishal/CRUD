# User Authentication & Product Management Backend API

A comprehensive Express.js backend with MongoDB for user authentication and product management, featuring login/register functionality without tokens and complete CRUD operations for products.

## Features

- User registration and login (without tokens)
- Complete CRUD operations for products
- Product search and filtering capabilities
- Password hashing with bcrypt
- MongoDB integration with Mongoose
- Input validation and error handling
- CORS enabled
- Soft delete functionality
- Pagination support

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the root directory:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/userdb
```

3. Make sure MongoDB is running on your system.

## Running the Application

Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm install -g nodemon
npm run dev
```

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "age": 25,
  "mobilenumber": "+1234567890",
  "password": "password123"
}
```

#### Login User
- **POST** `/api/auth/login`
- **Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Product Management

#### Get All Products
- **GET** `/api/products`
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `limit`: Products per page (default: 10)
  - `category`: Filter by category
  - `minPrice`: Minimum price filter
  - `maxPrice`: Maximum price filter
  - `search`: Search products

#### Get Product by ID
- **GET** `/api/products/:id`

#### Create Product
- **POST** `/api/products`
- **Body:**
```json
{
  "name": "Wireless Headphones",
  "description": "High-quality wireless headphones with noise cancellation",
  "price": 99.99,
  "category": "electronics",
  "stock": 50,
  "brand": "TechBrand",
  "sku": "WH-001",
  "images": ["image1.jpg", "image2.jpg"],
  "tags": ["wireless", "bluetooth", "audio"]
}
```

#### Update Product
- **PUT** `/api/products/:id`
- **Body:** Same as create product (all fields optional)

#### Delete Product (Soft Delete)
- **DELETE** `/api/products/:id`

#### Get Products by Category
- **GET** `/api/products/category/:category`
- **Categories:** electronics, clothing, food, books, toys, sports, home, other

#### Search Products
- **GET** `/api/products/search/:query`

### Health Check

#### Server Status
- **GET** `/health`

#### API Documentation
- **GET** `/` (Shows all available endpoints)

## Data Schemas

### User Schema
```javascript
{
  username: String (unique, required, min 3 chars),
  email: String (unique, required, valid email),
  age: Number (required, 1-120),
  mobilenumber: String (required, valid phone),
  password: String (required, min 6 chars, hashed),
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Product Schema
```javascript
{
  name: String (required, max 100 chars),
  description: String (required, max 500 chars),
  price: Number (required, min 0),
  category: String (required, enum: electronics/clothing/food/books/toys/sports/home/other),
  stock: Number (required, min 0, default: 0),
  brand: String (optional, max 50 chars),
  sku: String (required, unique, uppercase),
  isActive: Boolean (default: true),
  images: [String] (optional),
  tags: [String] (optional),
  timestamps: true
}
```

## Response Format

All responses follow this format:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Paginated Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50,
    "productsPerPage": 10
  }
}
```

## Testing with Postman/curl

### Register a user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "age": 25,
    "mobilenumber": "+1234567890",
    "password": "password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create a product:
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Laptop",
    "description": "High-performance laptop",
    "price": 999.99,
    "category": "electronics",
    "stock": 25,
    "sku": "LP-001"
  }'
```

### Get all products:
```bash
curl http://localhost:3000/api/products
```

### Search products:
```bash
curl http://localhost:3000/api/products/search/laptop
```

## Security Notes

- Passwords are hashed using bcrypt
- No token-based authentication (as requested)
- Input validation on all endpoints
- CORS enabled for cross-origin requests
- Soft delete functionality for data integrity

## Project Structure

```
├── config/
│   └── database.js     # MongoDB connection
├── models/
│   ├── User.js         # User schema and methods
│   └── Product.js      # Product schema and methods
├── routes/
│   ├── auth.js         # Authentication routes
│   └── products.js     # Product CRUD routes
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
├── server.js           # Main server file
└── README.md           # This file
```
