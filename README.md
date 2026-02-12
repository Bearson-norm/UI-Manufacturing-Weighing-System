# Manufacturing Dashboard

A professional Manufacturing Order Management System with PostgreSQL integration, built with React, TypeScript, Express.js, and PostgreSQL. This system provides comprehensive management of manufacturing operations including SKU management, Bill of Materials (BOM), Manufacturing Orders, and real-time production monitoring with digital scale integration.

## 🚀 Features

### Core Functionality
- **SKU Management**: Complete CRUD operations for Stock Keeping Units
- **Bill of Materials (BOM)**: Define and manage product recipes
- **Manufacturing Orders**: Create, track, and manage production orders
- **Real-time Production**: AND Digital scale integration for weight capture
- **Material Consumption Tracking**: Monitor raw material usage
- **Print Integration**: XPrinter 420 label printing support
- **Scale Management**: Complete AND scales integration with multiple connection methods

### Technical Features
- **TypeScript**: Full type safety across frontend and backend
- **PostgreSQL**: Robust database with proper relationships and constraints
- **RESTful API**: Well-structured API with proper error handling
- **Real-time Updates**: Live data synchronization
- **Responsive Design**: Modern UI with Tailwind CSS
- **Professional Architecture**: Clean separation of concerns

## 🏗️ Architecture

```
manufacturing-dashboard/
├── server/                 # Backend API
│   ├── database/          # Database schema and connection
│   ├── models/            # Data models with validation
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── scripts/           # Migration and seeding scripts
├── client/                # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # React context for state management
│   │   ├── services/      # API service layer
│   │   ├── types/         # TypeScript type definitions
│   │   └── tabs/          # Main application tabs
│   └── public/            # Static assets
└── docs/                  # Documentation
```

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** database
- **Joi** for data validation
- **Helmet** for security
- **CORS** for cross-origin requests
- **Morgan** for logging
- **SerialPort** for AND scales communication
- **TCP/IP** for network scale communication

### Frontend
- **React 18** with TypeScript
- **React Query** for data fetching
- **React Hook Form** for form management
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher)
- **PostgreSQL** (v12 or higher)
- **npm** or **yarn**

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd manufacturing-dashboard
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Database Setup

#### Create PostgreSQL Database

```sql
CREATE DATABASE kmi_manufacturing_db;
```

#### Set up Environment Variables

Copy the example environment file:

```bash
cp env.example .env
```

Update the `.env` file with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kmi_manufacturing_db
DB_USER=your_username
DB_PASSWORD=your_password

# Server Configuration
PORT=6657
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=https://kmi-mows.moof-set.web.id
```

#### Run Database Migration

```bash
npm run db:migrate
```

#### Seed Sample Data

```bash
npm run db:seed
```

### 4. Start the Application

#### Development Mode (Both Frontend and Backend)

```bash
npm run dev
```

This will start:
- Backend API on `http://localhost:6657`
- Frontend React app on `http://localhost:3000`
- Production domain: `https://kmi-mows.moof-set.web.id`

#### Production Mode

```bash
# Build the frontend
npm run build

# Start the server
npm start
```

## 📊 Database Schema

The application uses the following main tables:

- **uom**: Unit of Measure definitions
- **sku**: Stock Keeping Units (Raw Materials, Finished Goods, Semi-Finished Goods)
- **bom**: Bill of Materials relationships
- **manufacturing_order**: Production orders
- **material_consumption**: Raw material usage tracking
- **users**: User authentication (for future use)
- **audit_log**: Change tracking

## 🔧 API Endpoints

### UoM Management
- `GET /api/uom` - Get all units of measure
- `POST /api/uom` - Create new UoM
- `PUT /api/uom/:id` - Update UoM
- `DELETE /api/uom/:id` - Delete UoM

### SKU Management
- `GET /api/sku` - Get all SKUs
- `GET /api/sku/type/:type` - Get SKUs by type
- `POST /api/sku` - Create new SKU
- `PUT /api/sku/:id` - Update SKU
- `DELETE /api/sku/:id` - Delete SKU

### BOM Management
- `GET /api/bom/fg/:fg_sku_id` - Get BOM for finished goods
- `POST /api/bom` - Create BOM item
- `PUT /api/bom/:id` - Update BOM item
- `DELETE /api/bom/:id` - Delete BOM item

### Manufacturing Orders
- `GET /api/manufacturing-order` - Get all MOs
- `POST /api/manufacturing-order` - Create new MO
- `POST /api/manufacturing-order/:id/start` - Start production
- `POST /api/manufacturing-order/:id/complete` - Complete production

### Material Consumption
- `GET /api/consumption` - Get consumption history
- `POST /api/consumption` - Record material consumption

### Scale Management
- `GET /api/scale/status` - Get scale status
- `POST /api/scale/connect` - Connect to scale
- `POST /api/scale/disconnect` - Disconnect from scale
- `POST /api/scale/tare` - Tare scale
- `POST /api/scale/zero` - Zero scale
- `POST /api/scale/weight` - Request weight reading
- `GET /api/scale/test` - Test scale connection
- `GET /api/scale/ports` - Get available serial ports

## 🎯 Usage Guide

### 1. Setting Up Master Data

1. **Create UoMs**: Go to SKU Management → Add UoMs (KG, PC, L, etc.)
2. **Create SKUs**: Add raw materials and finished goods
3. **Define BOMs**: Set up recipes for finished goods

### 2. Scale Setup

1. **Configure Scale**: Go to Scale tab → Configure Scale
2. **Select Connection Type**:
   - **Simulation**: For testing without hardware
   - **Serial/USB**: For direct scale connection
   - **TCP/IP**: For network-enabled scales
3. **Connect Scale**: Test and establish connection
4. **Calibrate**: Use tare/zero functions as needed

### 3. Production Workflow

1. **Create MO**: Create a new manufacturing order
2. **Start Production**: Begin the production process
3. **Weigh Materials**: Use the AND digital scale to capture weights
4. **Complete MO**: Finish the production order
5. **Print Labels**: Generate production labels

### 4. Monitoring

- **Real-time Dashboard**: Monitor active production
- **Scale Status**: Monitor scale connection and readings
- **History**: View consumption and production history
- **Reports**: Track efficiency and material usage

## 🔒 Security Features

- **Input Validation**: Comprehensive data validation on both client and server
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin access
- **Rate Limiting**: API request throttling
- **Error Handling**: Secure error messages without sensitive data exposure

## 🧪 Testing

### Backend Testing

```bash
# Run database tests
npm run test:db

# Run API tests
npm run test:api
```

### Frontend Testing

```bash
cd client
npm test
```

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Connection Pooling**: Efficient database connections
- **React Query Caching**: Smart data caching and synchronization
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Compressed assets

## 🚀 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Set up production database**:
   ```bash
   NODE_ENV=production npm run db:migrate
   ```

3. **Start the server**:
   ```bash
   NODE_ENV=production npm start
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the API documentation at `/api/docs` (when running)

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete manufacturing order management
- PostgreSQL integration
- Real-time production monitoring
- Digital scale integration
- Print label functionality

## 📞 Contact

For more information about this project, please contact the development team.

---

**Note**: This is a professional manufacturing management system designed for production environments. Ensure proper testing and security measures before deploying to production.
