# 🚀 Contentful Products Report API

![NestJS](https://img.shields.io/badge/NestJS-11.x-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-24.x-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Test Coverage](https://img.shields.io/badge/Coverage-100%25-success?style=for-the-badge)

> **Enterprise-grade REST API** for managing and reporting on products from Contentful CMS. Built with NestJS, featuring JWT authentication, automated synchronization, comprehensive analytics, and exceptional test coverage.

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [API Endpoints](#-api-endpoints)
- [Authentication Flow](#-authentication-flow)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

### Core Functionality
- ✅ **Product Management**: CRUD operations with soft delete functionality
- ✅ **Contentful Integration**: Automated product synchronization from Contentful CMS
- ✅ **Scheduled Sync**: Automatic product updates every hour using cron jobs
- ✅ **Advanced Filtering**: Filter products by name, brand, category, color, price range, and SKU
- ✅ **Pagination**: Efficient pagination with customizable page size (default: 5 items)

### Analytics & Reporting
- 📊 **Deleted Products Report**: Percentage and statistics of deleted vs active products
- 📊 **Non-Deleted Products Stats**: Filtered statistics by date range and price availability
- 📊 **Products by Category**: Distribution and statistics grouped by category
- 📊 **Price Distribution**: Product distribution across different price ranges

### Security & Quality
- 🔐 **JWT Authentication**: Secure token-based authentication using API Key exchange
- 🔐 **Protected Endpoints**: Private reports and sensitive operations require authentication
- ✅ **100% Test Coverage**: Comprehensive unit tests with 93 test cases
- ✅ **Input Validation**: Global validation pipes with class-validator
- 📚 **API Documentation**: Interactive Swagger/OpenAPI documentation

### DevOps & Infrastructure
- 🐳 **Docker Support**: Full containerization with Docker Compose
- 🏥 **Health Checks**: MongoDB and Contentful API health monitoring
- 📝 **Structured Logging**: Comprehensive logging with NestJS Logger
- 🎯 **API Versioning**: URI-based versioning (v1)

---

## 🛠 Tech Stack

### Backend Framework
- **NestJS 11.x** - Progressive Node.js framework
- **TypeScript 5.7** - Type-safe development
- **Node.js 20.x** - Runtime environment

### Database & ODM
- **MongoDB 7.0** - NoSQL database
- **Mongoose 8.x** - MongoDB object modeling

### Authentication & Security
- **Passport JWT** - JWT authentication strategy
- **@nestjs/jwt** - JWT token generation and validation
- **class-validator** - Input validation

### External Integrations
- **Contentful CMS** - Headless CMS for product data
- **Axios** - HTTP client for API calls

### Scheduling & Automation
- **@nestjs/schedule** - Cron job management

### Documentation & API
- **Swagger/OpenAPI** - Interactive API documentation
- **@nestjs/swagger** - Swagger integration

### Testing
- **Jest** - Testing framework
- **@nestjs/testing** - NestJS testing utilities
- **SuperTest** - HTTP assertions

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

---

## 📦 Prerequisites

Before running this project, ensure you have the following installed:

### Required
- **Node.js**: v20.x or higher ([Download](https://nodejs.org/))
- **npm**: v10.x or higher (comes with Node.js)
- **MongoDB**: v7.x ([Download](https://www.mongodb.com/try/download/community)) OR **Docker** (recommended)
- **Docker** (Optional but recommended): v24.x or higher ([Download](https://www.docker.com/get-started))
- **Docker Compose** (Optional): v2.x or higher (comes with Docker Desktop)

### Contentful Account
You'll need a **Contentful account** with:
- Space ID
- Content Delivery API Access Token
- Content Type configured as "product" (or custom)

To get these credentials:
1. Create a free account at [contentful.com](https://www.contentful.com/)
2. Create a new Space
3. Go to **Settings > API Keys**
4. Create a new Content Delivery API key
5. Copy the **Space ID** and **Content Delivery API - access token**

---

## 📥 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd contentfull-products-report-api
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including NestJS, MongoDB drivers, JWT libraries, and testing utilities.

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory. You can use `.env.example` as a template:

```bash
cp .env.example .env
```

### Required Environment Variables

Edit the `.env` file with your configuration:

```bash
# ==========================================
# APPLICATION CONFIGURATION
# ==========================================
PORT=3000
NODE_ENV=development

# ==========================================
# MONGODB CONNECTION
# ==========================================
# For Docker: use service name 'mongo'
MONGODB_URI=mongodb://mongo:27017/contentful_products_db

# For local MongoDB: use localhost
# MONGODB_URI=mongodb://localhost:27017/contentful_products_db

# ==========================================
# CONTENTFUL API CONFIGURATION (REQUIRED!)
# ==========================================
# Get these from: https://app.contentful.com/spaces/<your-space-id>/api/keys
CONTENTFUL_API_URL=https://cdn.contentful.com
CONTENTFUL_SPACE_ID=your_space_id_here           # ⚠️ REQUIRED: Get from Contentful
CONTENTFUL_ACCESS_TOKEN=your_access_token_here   # ⚠️ REQUIRED: Get from Contentful
CONTENTFUL_ENVIRONMENT=master                     # Optional: defaults to 'master'
CONTENTFUL_CONTENT_TYPE=product                   # Optional: defaults to 'product'

# ==========================================
# JWT AUTHENTICATION CONFIGURATION
# ==========================================
# Change these in production!
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=24h

# ==========================================
# API KEY FOR TOKEN GENERATION
# ==========================================
# This key is used to generate JWT tokens
# Share this with authorized users
API_KEY=apply-digital-secret-key-2024
```

### ⚠️ Important Notes About Configuration

#### Contentful Credentials (MANDATORY)
The **CONTENTFUL_SPACE_ID** and **CONTENTFUL_ACCESS_TOKEN** are **mandatory** for the API to function. Without these:
- The product sync will fail
- Health checks will fail
- You won't be able to fetch products from Contentful

**How to get Contentful credentials:**
1. Log in to [Contentful](https://app.contentful.com)
2. Select your Space
3. Go to **Settings → API Keys**
4. Create or select an API key
5. Copy the **Space ID** and **Content Delivery API access token**

#### API Key for Authentication
The `API_KEY` is used to generate JWT tokens. Users need to:
1. Make a POST request to `/api/v1/auth/token` with the API Key
2. Receive a JWT token
3. Use that token to access protected endpoints (reports, sync, etc.)

**Example:**
```bash
# 1. Get JWT token
curl -X POST http://localhost:3000/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{"apiKey": "apply-digital-secret-key-2024"}'

# Response: {"access_token": "eyJhbGc..."}

# 2. Use token to access protected endpoints
curl http://localhost:3000/api/v1/reports/deleted-percentage \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## 🚀 Running the Application

You can run the application in two ways: **with Docker** (recommended) or **without Docker**.

### Option 1: Running with Docker (Recommended) 🐳

This is the **easiest and recommended** way to run the application. Docker will handle MongoDB setup automatically.

#### Prerequisites
- Docker and Docker Compose installed

#### Steps

1. **Ensure your `.env` file is configured** (especially Contentful credentials)

2. **Start the application:**

```bash
docker-compose up -d
```

This command will:
- Build the NestJS application image
- Start MongoDB 7 container
- Start the API container
- Create a network for inter-container communication
- Set up health checks

3. **View logs:**

```bash
# View all logs
docker-compose logs -f

# View only API logs
docker-compose logs -f api

# View only MongoDB logs
docker-compose logs -f mongo
```

4. **Check container status:**

```bash
docker-compose ps
```

You should see:
```
NAME                        STATUS                   PORTS
contentful-products-api     Up (healthy)             0.0.0.0:3000->3000/tcp
contentful-products-mongo   Up (healthy)             0.0.0.0:27017->27017/tcp
```

5. **Stop the application:**

```bash
docker-compose down
```

6. **Stop and remove volumes (⚠️ deletes all data):**

```bash
docker-compose down -v
```

#### Docker Compose Features

Our `docker-compose.yml` includes:
- **Health checks**: Automatic container health monitoring
- **Restart policies**: Containers restart automatically on failure
- **Volume persistence**: MongoDB data persists between restarts
- **Network isolation**: Containers communicate on a private network
- **Multi-stage builds**: Optimized production images

---

### Option 2: Running without Docker (Local Development)

If you prefer to run without Docker, you'll need to set up MongoDB manually.

#### Prerequisites
- MongoDB 7.0 installed and running locally
- Node.js 20.x installed

#### Steps

1. **Start MongoDB:**

```bash
# On macOS with Homebrew
brew services start mongodb-community@7.0

# On Linux
sudo systemctl start mongod

# On Windows
net start MongoDB
```

2. **Verify MongoDB is running:**

```bash
mongosh
# Should connect to MongoDB shell
```

3. **Update `.env` file for local MongoDB:**

```bash
MONGODB_URI=mongodb://localhost:27017/contentful_products_db
```

4. **Install dependencies (if not done already):**

```bash
npm install
```

5. **Run the application:**

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod

# Debug mode
npm run start:debug
```

6. **The API will be available at:**
- API: http://localhost:3000
- Swagger Docs: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/api/v1/health

---

## 📚 API Documentation

### Interactive Documentation (Swagger)

Once the application is running, access the interactive API documentation:

**URL**: http://localhost:3000/api/docs

The Swagger UI provides:
- 📖 Complete endpoint documentation
- 🧪 Interactive API testing
- 📋 Request/response schemas
- 🔐 Built-in JWT authentication testing

### Using Swagger UI

1. **Get JWT Token:**
   - Expand the `POST /api/v1/auth/token` endpoint
   - Click "Try it out"
   - Enter the API Key: `apply-digital-secret-key-2024`
   - Click "Execute"
   - Copy the `access_token` from the response

2. **Authenticate:**
   - Click the "Authorize" button (🔓) at the top
   - Paste the token in the format: `Bearer <your-token>`
   - Click "Authorize"

3. **Test Protected Endpoints:**
   - Now you can test any protected endpoint (reports, sync, etc.)

---

## 🧪 Testing

This project has **exceptional test coverage** with 93 test cases covering all critical functionality.

### Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with coverage report
npm run test:cov

# Run specific test file
npm test -- src/products/products.service.spec.ts
```

### Test Coverage

Our test suite achieves:
- ✅ **100% Statement Coverage**
- ✅ **89% Branch Coverage**
- ✅ **100% Function Coverage**
- ✅ **100% Line Coverage**

```
Test Suites: 11 passed, 11 total
Tests:       93 passed, 93 total
Snapshots:   0 total
Time:        7-8 seconds

Coverage Summary:
---------------------------------|---------|----------|---------|---------|
File                             | % Stmts | % Branch | % Funcs | % Lines |
---------------------------------|---------|----------|---------|---------|
All files                        |     100 |    89.28 |     100 |     100 |
 auth                            |     100 |      100 |     100 |     100 |
 auth/strategies                 |     100 |      100 |     100 |     100 |
 contentful                      |     100 |      100 |     100 |     100 |
 health                          |     100 |      100 |     100 |     100 |
 health/indicators               |     100 |      100 |     100 |     100 |
 products                        |     100 |    85.71 |     100 |     100 |
 reports                         |     100 |    93.75 |     100 |     100 |
---------------------------------|---------|----------|---------|---------|
```

### View Detailed Coverage Report

After running `npm run test:cov`, open the HTML report:

```bash
# The coverage report is generated in the /coverage directory
open coverage/lcov-report/index.html
```

---

## 📁 Project Structure

```
contentfull-products-report-api/
├── src/
│   ├── auth/                          # Authentication module
│   │   ├── dto/                       # Data Transfer Objects
│   │   ├── guards/                    # JWT Auth Guard
│   │   ├── strategies/                # Passport JWT Strategy
│   │   ├── auth.controller.ts         # Auth endpoints
│   │   ├── auth.service.ts            # Auth business logic
│   │   └── auth.module.ts
│   │
│   ├── common/                        # Shared resources
│   │   └── interfaces/                # TypeScript interfaces
│   │
│   ├── contentful/                    # Contentful integration
│   │   ├── contentful.service.ts      # Contentful API client
│   │   └── contentful.module.ts
│   │
│   ├── health/                        # Health check module
│   │   ├── indicators/                # Custom health indicators
│   │   ├── health.controller.ts       # Health endpoints
│   │   └── health.module.ts
│   │
│   ├── products/                      # Products module
│   │   ├── dto/                       # DTOs for products
│   │   ├── schemas/                   # Mongoose schemas
│   │   ├── products.controller.ts     # Product endpoints
│   │   ├── products.service.ts        # Product business logic
│   │   ├── products-scheduler.service.ts  # Cron jobs
│   │   └── products.module.ts
│   │
│   ├── reports/                       # Reports module
│   │   ├── dto/                       # Report DTOs
│   │   ├── reports.controller.ts      # Report endpoints
│   │   ├── reports.service.ts         # Report business logic
│   │   └── reports.module.ts
│   │
│   ├── app.module.ts                  # Root application module
│   └── main.ts                        # Application entry point
│
├── test/                              # E2E tests
├── coverage/                          # Test coverage reports
├── .env                               # Environment variables (create from .env.example)
├── .env.example                       # Environment variables template
├── docker-compose.yml                 # Docker Compose configuration
├── Dockerfile                         # Docker image definition
├── .dockerignore                      # Docker ignore file
├── package.json                       # Dependencies and scripts
├── tsconfig.json                      # TypeScript configuration
├── jest.config.json                   # Jest configuration (in package.json)
└── README.md                          # This file
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/token` | ❌ No | Generate JWT token with API Key |

### Products (Public & Protected)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/products` | ❌ No | List products with pagination & filters |
| GET | `/api/v1/products/:id` | ✅ JWT | Get product by ID |
| DELETE | `/api/v1/products/:id` | ❌ No | Soft delete a product |
| POST | `/api/v1/products/sync` | ✅ JWT | Manually trigger Contentful sync |
| DELETE | `/api/v1/products/truncate` | ✅ JWT | Delete all products (⚠️ dangerous) |

### Reports (Protected - JWT Required)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/reports/deleted-percentage` | ✅ JWT | Deleted products statistics |
| GET | `/api/v1/reports/non-deleted-stats` | ✅ JWT | Non-deleted products with filters |
| GET | `/api/v1/reports/by-category` | ✅ JWT | Products grouped by category |
| GET | `/api/v1/reports/price-distribution` | ✅ JWT | Price range distribution |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/health` | ❌ No | Check API, MongoDB & Contentful health |

---

## 🔐 Authentication Flow

### Step 1: Get JWT Token

```bash
curl -X POST http://localhost:3000/api/v1/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "apply-digital-secret-key-2024"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Step 2: Use Token for Protected Endpoints

```bash
curl http://localhost:3000/api/v1/reports/deleted-percentage \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "totalProducts": 100,
  "deletedProducts": 25,
  "activeProducts": 75,
  "deletedPercentage": 25.0
}
```

### Token Details

- **Algorithm**: HS256 (HMAC SHA-256)
- **Expiration**: 5 hours (configurable via `JWT_EXPIRATION`)
- **Payload**: `{ sub: 'api-user', role: 'admin', iat: timestamp }`

---

## 📊 Example Usage

### 1. List Products with Filters

```bash
curl "http://localhost:3000/api/v1/products?page=1&limit=5&category=Footwear&minPrice=50&maxPrice=200"
```

**Response:**
```json
{
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "sku": 19996,
      "name": "Nike Performance NLQ3UY",
      "brand": "Nike",
      "category": "Footwear",
      "color": "Pink",
      "price": 52,
      "currency": "CAD",
      "stock": 490,
      "isDeleted": false
    }
  ],
  "meta": {
    "currentPage": 1,
    "itemsPerPage": 5,
    "totalItems": 45,
    "totalPages": 9,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 2. Get Products by Category Report

```bash
curl http://localhost:3000/api/v1/reports/by-category \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response:**
```json
{
  "totalActiveProducts": 75,
  "totalCategories": 3,
  "categories": [
    {
      "category": "Footwear",
      "totalProducts": 40,
      "percentage": 53.33,
      "averagePrice": 85.50,
      "minPrice": 40,
      "maxPrice": 150,
      "totalStock": 1200
    }
  ]
}
```

### 3. Manually Trigger Product Sync

```bash
curl -X POST http://localhost:3000/api/v1/products/sync \
  -H "Authorization: Bearer <your-jwt-token>"
```

**Response:**
```json
{
  "message": "Products synced successfully",
  "count": 30
}
```

---

## 🔧 Available Scripts

```bash
# Development
npm run start          # Start in production mode
npm run start:dev      # Start with hot-reload (recommended for development)
npm run start:debug    # Start in debug mode

# Building
npm run build          # Build for production
npm run format         # Format code with Prettier
npm run lint           # Lint and fix code with ESLint

# Testing
npm test               # Run unit tests
npm run test:watch     # Run tests in watch mode
npm run test:cov       # Run tests with coverage
npm run test:debug     # Debug tests

# Docker
docker-compose up -d           # Start with Docker
docker-compose down            # Stop containers
docker-compose down -v         # Stop and remove volumes
docker-compose logs -f api     # View API logs
docker-compose ps              # Check container status
```

---

## 🌟 Key Features Explained

### Automatic Product Synchronization

The API automatically syncs products from Contentful every hour using a cron job:

```typescript
@Cron('0 * * * *')  // Every hour
async handleProductSync() {
  await this.productsService.syncProductsFromContentful();
}
```

**What happens during sync:**
1. Fetches products from Contentful API
2. Upserts products into MongoDB (updates existing, creates new)
3. Preserves soft delete status during sync
4. Logs sync results

### Soft Delete Pattern

Products are never permanently deleted. Instead, they're marked as deleted:

```typescript
{
  isDeleted: true,
  deletedAt: "2025-11-17T12:00:00Z"
}
```

**Benefits:**
- Data preservation for analytics
- Ability to restore deleted products
- Historical reporting

### Health Monitoring

The health endpoint checks:
- ✅ MongoDB connection status
- ✅ Contentful API reachability
- ✅ Application status

```bash
curl http://localhost:3000/api/v1/health
```

---

## 🐛 Troubleshooting

### Issue: "Invalid API Key" error

**Solution:** Verify your `.env` file has the correct `API_KEY` value and restart the application.

### Issue: "Failed to fetch products from Contentful"

**Possible causes:**
1. Invalid `CONTENTFUL_SPACE_ID` or `CONTENTFUL_ACCESS_TOKEN`
2. Contentful API is down
3. Network connectivity issues

**Solution:**
1. Verify credentials in Contentful dashboard
2. Check health endpoint: `/api/v1/health`
3. Check API logs for detailed error messages

### Issue: MongoDB connection failed

**For Docker:**
```bash
# Check if MongoDB container is running
docker-compose ps

# View MongoDB logs
docker-compose logs mongo

# Restart containers
docker-compose restart
```

**For local MongoDB:**
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB service
brew services start mongodb-community@7.0  # macOS
sudo systemctl start mongod                # Linux
```

### Issue: Tests failing

**Solution:**
```bash
# Clear Jest cache
npm test -- --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run tests again
npm test
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change the port in .env
PORT=3001
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Standards

- Follow existing code style
- Write unit tests for new features
- Maintain test coverage above 80%
- Update documentation as needed
- Use conventional commits

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 👥 Authors

- **Juan David Reina** - Lead Developer & Architect
  - Email: [judareiro@gmail.com](mailto:judareiro@gmail.com)
  - GitHub: [@judareiro](https://github.com/judareiro)

---

## 🤖 AI Disclosure

This project was developed with the assistance of **Claude Code** by Anthropic, an AI-powered coding assistant that helped with:
- 🏗️ **Architecture Design**: Modular structure following NestJS best practices
- 💻 **Code Implementation**: Services, controllers, DTOs, and business logic
- 🧪 **Testing**: Comprehensive unit tests achieving 100% statement coverage
- 🐳 **DevOps**: Docker containerization and multi-stage builds
- 📚 **Documentation**: Complete API documentation and comprehensive README

While AI was instrumental in accelerating development, all architectural decisions, business logic, and final implementations were reviewed, validated, and approved by the development team.

**AI Tool Used**: [Claude Code](https://claude.ai/code) - AI pair programming assistant

---

## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - The progressive Node.js framework
- [Contentful](https://www.contentful.com/) - Headless CMS platform
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [Jest](https://jestjs.io/) - Testing framework
- [Claude Code by Anthropic](https://claude.ai/code) - AI development assistant

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review Swagger API docs at `/api/docs`

---

<div align="center">

**Built with ❤️ using NestJS and TypeScript**

⭐ **Star this repo if you find it useful!** ⭐

</div>
