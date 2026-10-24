# Dgate Homes

A luxury real estate platform built with **React + Vite** and **Node.js + Express** with **MySQL**.

## Project Structure

```text
Dgate Homes/
├── backend/                  # Node.js + Express backend
│   ├── src/
│   │   ├── config/           # Database pool & environment config
│   │   ├── controllers/      # Route controllers (health, properties, enquiries)
│   │   ├── middleware/       # Rate limiting, request logger, error handling
│   │   ├── repositories/     # Parameterized SQL database queries
│   │   ├── routes/           # Express router endpoints
│   │   ├── services/         # Business logic layer
│   │   ├── utils/            # Validators and custom error classes
│   │   └── app.js            # Express app assembly
│   ├── server.js             # HTTP server entry point & graceful shutdown
│   ├── .env                  # Backend environment variables
│   ├── .env.example          # Environment variables template
│   └── package.json          # Backend dependencies and scripts
│
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── assets/           # Icons and graphics
│   │   ├── components/       # Shared & home page components (Header, Navbar, Footer, etc.)
│   │   ├── hooks/            # Custom hooks (useFeaturedProperties)
│   │   ├── layouts/          # MainLayout wrapper
│   │   ├── pages/            # HomePage, PropertiesPage (/properties), PropertyDetailPage (/properties/:slug)
│   │   ├── services/         # API service layer (apiClient, propertyService, enquiryService)
│   │   ├── styles/           # CSS design tokens (yellow, white, black) and global styles
│   │   ├── utils/            # Currency and area formatters
│   │   ├── App.jsx           # App component
│   │   └── main.jsx          # Vite React entry point
│   ├── index.html            # HTML template
│   ├── vite.config.js        # Vite build configuration (Port 3000)
│   ├── .env                  # Frontend environment variables
│   ├── .env.example          # Frontend environment variables template
│   └── package.json          # Frontend dependencies and scripts
│
├── package.json              # Monorepo root coordination scripts
└── .gitignore                # Git ignore configuration
```

## Quick Start

### 1. Install Dependencies
```bash
npm run install:all
```

### 2. Configure Environment Variables
- In [`backend/.env`](backend/.env):
  ```env
  PORT=5000
  NODE_ENV=development
  DB_HOST=localhost
  DB_PORT=3306
  DB_USER=root
  DB_PASSWORD=your_mysql_password
  DB_NAME=dgate_home_db
  CLIENT_ORIGIN=http://localhost:3000
  CLERK_PUBLISHABLE_KEY=pk_test_...
  CLERK_SECRET_KEY=sk_test_...
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  ```
- In [`frontend/.env`](frontend/.env):
  ```env
  VITE_API_BASE_URL=http://localhost:5000/api
  VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
  ```

### 3. Start Development Servers

You can run both from the root:
```bash
# Terminal 1: Start Backend (Port 5000)
npm run dev:backend

# Terminal 2: Start Frontend (Port 3000)
npm run dev:frontend
```

Alternatively, navigate into each directory directly:
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

## API Endpoints Available
- `GET  /api/health` - Health check & MySQL connectivity verification
- `GET  /api/property-types` - Active property types ordered by sort_order and name
- `GET  /api/amenities` - Active amenities ordered by category, sort_order, and name
- `GET  /api/properties` - Public property listing with filters, pagination, and sorting
- `GET  /api/properties/:slug` - Single public property details with images, amenities, and tags
- `POST /api/enquiries` - Public lead enquiry submission with anti-spam rate limiting
- `GET  /api/admin/me` - Authenticated & authorized admin profile verification (requires Clerk JWT & active admin_profiles record)
- `GET  /api/admin/dashboard/summary` - Protected admin metrics (inventory breakdown, lead statuses, recent 5 enquiries and properties)
- `GET  /api/admin/properties` - Protected admin property list with search, filters, pagination, and sorting
- `GET  /api/admin/properties/:id` - Protected admin property details with type, project, unitType, tags, amenities, and images
- `POST /api/admin/properties` - Protected admin property creation in MySQL transaction (defaults to draft)
- `PUT  /api/admin/properties/:id` - Protected admin property update with price history & activity logs
- `PATCH /api/admin/properties/:id/status` - Protected admin status transition (draft / published / archived)
- `POST   /api/admin/properties/:propertyId/images` - Protected multi-image upload to Cloudinary (`dgate-homes/properties/{propertyId}`) + MySQL `property_images` insert
- `PATCH  /api/admin/properties/:propertyId/images/reorder` - Protected atomic image gallery reordering in MySQL transaction
- `PATCH  /api/admin/properties/:propertyId/images/:imageId` - Protected image metadata (`caption`, `alt_text`) update
- `PATCH  /api/admin/properties/:propertyId/images/:imageId/cover` - Protected single cover image assignment (`is_cover = 1`)
- `DELETE /api/admin/properties/:propertyId/images/:imageId` - Protected Cloudinary asset deletion + MySQL row deletion with automatic cover promotion
- `GET  /api/admin/enquiries` - Protected admin lead enquiry list with customer search, filters, pagination, and sorting
- `GET  /api/admin/enquiries/:id` - Protected admin single enquiry details with property summary, assigned admin, and activity timeline
- `PATCH /api/admin/enquiries/:id/status` - Protected admin enquiry status transition (`new`, `contacted`, `in_progress`, `closed`) with activity logging
- `PATCH /api/admin/enquiries/:id/assign` - Protected admin lead assignment to active administrator
- `POST  /api/admin/enquiries/:id/follow-up` - Protected enquiry follow-up scheduling
- `POST  /api/admin/enquiries/:id/note` - Protected internal CRM note addition
- `GET  /api/admin/admins` - Protected active administrators selector
- `GET  /api/admin/amenities` - Protected admin amenities management list with category & active filters
- `POST /api/admin/amenities` - Protected amenity creation (unique slug, category, icon key, sort order)
- `PUT  /api/admin/amenities/:id` - Protected amenity update with conflict validation
- `PATCH /api/admin/amenities/:id/status` - Protected amenity activation/deactivation toggle (safely preserves historical property links)
- `GET  /api/admin/property-types` - Protected admin property types list with segment & active filters
- `POST /api/admin/property-types` - Protected property type creation (`residential`, `commercial`, `land`)
- `PUT  /api/admin/property-types/:id` - Protected property type update with segment validation
- `PATCH /api/admin/property-types/:id/status` - Protected property type activation/deactivation toggle
- `GET  /api/admin/tags` - Protected admin tags management list
- `POST /api/admin/tags` - Protected property tag creation
- `PUT  /api/admin/tags/:id` - Protected property tag update
- `PATCH /api/admin/tags/:id/status` - Protected property tag activation/deactivation toggle
- `GET  /api/admin/projects` - Protected admin projects list (with selector mode support for property forms)
- `GET  /api/admin/projects/:id` - Protected admin project details with linked properties count
- `POST /api/admin/projects` - Protected project creation (defaults to `draft`)
- `PUT  /api/admin/projects/:id` - Protected project update (location, address, dates, description)
- `PATCH /api/admin/projects/:id/status` - Protected project status transition (`draft`, `published`, `archived`)
- `GET  /api/admin/projects/:projectId/unit-types` - Protected list of unit types under a project
- `POST /api/admin/projects/:projectId/unit-types` - Protected unit type creation with `units_available <= units_total` validation
- `PUT  /api/admin/projects/:projectId/unit-types/:unitTypeId` - Protected unit type update
- `GET  /api/admin/settings` - Protected admin application settings & environment telemetry (zero secrets exposed)
- `GET  /api/admin/audit-logs` - Protected forensic audit logs from `admin_activity_logs` (requires `super_admin`)
- `GET  /api/admin/audit-logs/filters` - Protected distinct actions & entities for audit log filtering (requires `super_admin`)
- `GET  /api/admin/security-events` - Protected security incident events from `security_events` (requires `super_admin`)
- `GET  /api/admin/security-events/filters` - Protected distinct security event types and severities (requires `super_admin`)

## Admin Master Data Pages
- `/admin/amenities` - Community & property amenities management (add, edit, category filtering, safe deactivation)
- `/admin/property-types` - Real-estate property segments and categories (residential, commercial, land)
- `/admin/tags` - Property marketing tags & highlights management
- `/admin/projects` - Master development communities management (draft/publish/archive workflow)
- `/admin/projects/:id` - Project details and nested floor plan / unit type inventory management

## Admin Operational & Security Pages
- `/admin/settings` - Application configuration overview (company details, primary channels, runtime telemetry)
- `/admin/audit-logs` - Audit log viewer with filter toolbar, JSON state diffs, and request tracing (super_admin only)
- `/admin/security-events` - Security event viewer with severity indicators (info, warning, critical) (super_admin only)




