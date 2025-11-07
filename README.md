# Dashboard

**Dashboard** is a modern, customizable widget management platform that allows users to integrate and monitor various services through a unified interface. Built with React and powered by a NestJS microservices architecture, Dashboard enables seamless data visualization and real-time monitoring in an elegant macOS-inspired design.

## Overview

Dashboard transforms the way you monitor and interact with your favorite services. Whether it's email, calendar, weather, or custom integrations, Dashboard provides a centralized hub for all your widgets with real-time updates and beautiful visualizations.

### Why Dashboard?

- **Universal Connectors**: Integrate any service with custom connectors
- **Real-time Widgets**: Auto-refreshing widgets with regular intervals
- **Beautiful Interface**: macOS-inspired floating dock with glassmorphism effects
- **Multi-Window Support**: Open and manage multiple services simultaneously
- **Secure Authentication**: JWT-based auth with email verification
- **Microservices Architecture**: Scalable and maintainable backend
- **Fully Responsive**: Seamless experience across all devices
- **Extensible**: Easy to add new connectors and widgets

## Screenshots

### Dashboard Home
![Dashboard home view](./docs/screenshots/dashboard_home.png)

### User profile
![User space](./docs/screenshots/dashboard_profile.png)

### Widget Windows
![Multiple widget windows](./docs/screenshots/dashboard_windows.png)

### Widget Details
![Widget data display](./docs/screenshots/dashboard_widget_details.png)

## Project Structure

```
dashboard/
├── auth-service/                    # NestJS authentication microservice
│   ├── src/
│   │   ├── auth/                   # Authentication logic
│   │   ├── users/                  # User management
│   │   ├── gateway/                # API gateway integration
│   │   ├── common/                 # Shared utilities
│   │   ├── email-templates/        # Email templates
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma           # Database schema
│   ├── lib/
│   │   └── prisma.ts               # Prisma client
│   └── package.json
│
├── connectors-service/              # NestJS connectors microservice
│   ├── src/
│   │   ├── modules/                # Feature modules
│   │   ├── database/               # Database configuration
│   │   ├── app.module.ts
│   │   └── main.ts
│   └── package.json
│
├── dashboard-client/                # React frontend
│   ├── src/
│   │   ├── assets/                 # Images and static files
│   │   ├── components/             # React components
│   │   │   └── Dashboard.jsx       # Main dashboard
│   │   ├── pages/                  # Page components
│   │   ├── controllers/            # Business logic
│   │   │   └── userController.js
│   │   ├── services/               # API services
│   │   │   └── apiService.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── vite.config.js
│   └── package.json
│
├── docs/                            # Documentation
│   ├── screenshots/
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── LICENSE.txt
└── README.md                        # This file
```

## Features

### For Users

#### Authentication & Profile
- Secure registration with email verification
- JWT-based authentication
- Password reset functionality
- Profile customization
- Session management

#### Connector System
- Browse available connectors
- Add connectors to personal dock
- Remove unwanted connectors
- Visual connector organization
- Connector configuration

#### Widget Management
- View available widgets per connector
- Real-time data updates
- Auto-refresh configuration (configurable intervals)
- Multiple widget windows
- Widget data visualization
- JSON formatted display

#### Interactive Interface
- macOS-style floating dock with hover effects
- Smooth animations and transitions
- Glassmorphism and gradient backgrounds
- Responsive grid layout
- Loading states and error handling
- Tooltip labels on hover


### Technical Features

#### Frontend (React + Vite)
- React 18 with modern hooks
- Component-based architecture
- Vite for fast development
- Tailwind CSS for styling
- Responsive design
- Client-side state management
- Dynamic imports
- Optimized production builds

#### Backend (NestJS Microservices)
- **Auth Service**: User authentication and authorization
- **Connectors Service**: Connector and widget management
- Microservices communication
- Prisma ORM for database
- JWT authentication with Passport
- Email service integration
- RESTful API architecture
- CORS configuration
- Request validation with class-validator
- Error handling middleware

## Tech Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **HTTP Client**: Fetch API
- **State Management**: React Hooks

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL / MySQL
- **Authentication**: Passport JWT
- **Validation**: class-validator
- **API Documentation**: Swagger (optional)

### DevOps & Tools
- **Version Control**: Git
- **Package Manager**: npm
- **Linting**: ESLint
- **Testing**: Jest
- **Process Manager**: PM2 (production)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- PostgreSQL 14+ or MySQL 8+
- Git

### Backend Setup

#### 1. Auth Service

```bash
# Navigate to auth service
cd auth-service

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

**Configure `auth-service/.env`:**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dashboard_auth"

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Service Configuration
PORT=3001
```

**Setup database:**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Optional: Seed database
npx prisma db seed
```

**Start auth service:**
```bash
npm run start:dev
```

#### 2. Connectors Service

```bash
# Navigate to connectors service
cd connectors-service

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

**Configure `connectors-service/.env`:**
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/dashboard_connectors"

# Service Configuration
PORT=3002

# Auth Service
AUTH_SERVICE_URL=http://localhost:3001
```

**Start connectors service:**
```bash
npm run start:dev
```

### Frontend Setup

```bash
# Navigate to frontend
cd dashboard-client

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
```

**Configure `dashboard-client/.env`:**
```env
VITE_AUTH_SERVICE_URL=http://localhost:3001
VITE_CONNECTORS_SERVICE_URL=http://localhost:3002
VITE_APP_NAME=Dashboard
```

**Add background image:**
```bash
# Place your background image at:
# src/assets/Image.jpeg
```

**Start development server:**
```bash
npm run dev
```

**Access the application:**
```
http://localhost:5173
```

## Architecture

### System Architecture

```
┌─────────────────┐
│   Dashboard     │
│   Client (React)│
│   Port: 5173    │
└────────┬────────┘
         │
         │ HTTP/REST
         │
    ┌────┴─────────────────────────┐
    │                              │
    ▼                              ▼
┌─────────────┐            ┌──────────────┐
│Auth Service │            │Connectors    │
│(NestJS)     │◄───────────┤Service       │
│Port: 3001   │  Verify    │(NestJS)      │
└──────┬──────┘  Token     │Port: 3002    │
       │                   └──────┬───────┘
       │                          │
       ▼                          ▼
┌─────────────┐            ┌──────────────┐
│Auth DB      │            │Connectors DB │
│(PostgreSQL) │            │(PostgreSQL)  │
└─────────────┘            └──────────────┘
```

### Application Flow

1. **User Authentication**
   - User registers/logs in via Dashboard Client
   - Auth Service validates credentials
   - JWT token issued and stored in client

2. **Dashboard Load**
   - Client fetches user dashboard data
   - Auth Service validates JWT token
   - Returns user connectors configuration

3. **Opening Connector**
   - User clicks connector in dock
   - Client requests connector details
   - Connectors Service returns available widgets

4. **Widget Data Fetching**
   - Widget component calls `app.baseUrl + widget.endpoint`
   - External service returns data
   - Data displayed in widget card
   - Auto-refresh at configured intervals

### Database Schema

#### Auth Service (Prisma)

**User Model:**
```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  firstName     String?
  lastName      String?
  avatar        String?
  isVerified    Boolean  @default(false)
  verificationToken String?
  resetToken    String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```

#### Connectors Service

**Connector Model:**
```typescript
{
  _id: string
  title: string
  description: string
  icon: string
  baseUrl: string
  userId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Widget Model:**
```typescript
{
  _id: string
  name: string
  description: string
  icon: string
  endpoint: string
  refreshRate: number // in seconds
  connectorId: string
  createdAt: Date
  updatedAt: Date
}
```

### API Endpoints

#### Auth Service (Port 3001)

```
POST   /auth/register          - Register new user
POST   /auth/login             - User login
POST   /auth/verify-email      - Verify email
POST   /auth/forgot-password   - Request password reset
POST   /auth/reset-password    - Reset password
GET    /auth/profile           - Get user profile
PUT    /auth/profile           - Update profile
```

#### Connectors Service (Port 3002)

```
GET    /connectors             - Get all connectors
GET    /connectors/:id         - Get connector by ID
POST   /connectors             - Create connector
PUT    /connectors/:id         - Update connector
DELETE /connectors/:id         - Delete connector

GET    /widgets/service/:id    - Get widgets by service
GET    /widgets/:id            - Get widget by ID
POST   /widgets                - Create widget
PUT    /widgets/:id            - Update widget
DELETE /widgets/:id            - Delete widget

GET    /user/dashboard         - Get user dashboard
```

**For complete API documentation, see [docs/API.md](docs/API.md)**

## Development

### Running All Services

**Terminal 1 - Auth Service:**
```bash
cd auth-service
npm run start:dev
```

**Terminal 2 - Connectors Service:**
```bash
cd connectors-service
npm run start:dev
```

**Terminal 3 - Frontend:**
```bash
cd dashboard-client
npm run dev
```

### Development Workflow

1. Make changes to code
2. Services auto-reload on file changes
3. Test changes in browser
4. Commit using conventional commits
5. Push and create pull request

### Code Quality

#### Linting
```bash
# Auth Service
cd auth-service
npm run lint

# Connectors Service
cd connectors-service
npm run lint

# Frontend
cd dashboard-client
npm run lint
```

#### Testing

**Backend Tests:**
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

**Frontend Tests:**
```bash
cd dashboard-client
npm run test
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add amazing feature"

# Push to remote
git push origin feature/your-feature-name
```

### Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Database Management

#### Prisma Migrations (Auth Service)
```bash
cd auth-service

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Deploy to production
npx prisma migrate deploy
```

#### Database GUI
```bash
# Open Prisma Studio
cd auth-service
npx prisma studio
```

## Deployment

### Production Build

#### Backend Services

**Auth Service:**
```bash
cd auth-service
npm install --production
npm run build
```

**Connectors Service:**
```bash
cd connectors-service
npm install --production
npm run build
```

#### Frontend
```bash
cd dashboard-client
npm run build
# Output in dist/ directory
```

### Environment Variables (Production)

**auth-service/.env.production:**
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@db-host:5432/dashboard_auth"
JWT_SECRET=your-production-secret
JWT_EXPIRES_IN=7d
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
PORT=3001
CORS_ORIGIN=https://dashboard.yourdomain.com
```

**connectors-service/.env.production:**
```env
NODE_ENV=production
DATABASE_URL="postgresql://user:password@db-host:5432/dashboard_connectors"
AUTH_SERVICE_URL=https://auth.yourdomain.com
PORT=3002
CORS_ORIGIN=https://dashboard.yourdomain.com
```

**dashboard-client/.env.production:**
```env
VITE_AUTH_SERVICE_URL=https://auth.yourdomain.com
VITE_CONNECTORS_SERVICE_URL=https://api.yourdomain.com
VITE_APP_ENV=production
```

### Running in Production

#### Using PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start auth service
cd auth-service
pm2 start dist/main.js --name auth-service

# Start connectors service
cd connectors-service
pm2 start dist/main.js --name connectors-service

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
```

#### Using Docker

```bash
# Build images
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

**For detailed deployment instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)**

## Security

### Best Practices Implemented

- **Authentication**: JWT tokens with expiration
- **Password Hashing**: Bcrypt with salt rounds
- **Email Verification**: Required for account activation
- **CORS**: Configured allowed origins
- **Input Validation**: class-validator on all DTOs
- **SQL Injection**: Protected by Prisma ORM
- **XSS Protection**: Content sanitization
- **Rate Limiting**: API throttling (configurable)
- **HTTPS**: Required in production
- **Environment Variables**: Sensitive data in .env

### Security Checklist

- [ ] Change default JWT secret
- [ ] Configure SMTP credentials
- [ ] Set strong database passwords
- [ ] Enable HTTPS in production
- [ ] Configure CORS origins
- [ ] Enable rate limiting
- [ ] Regular dependency updates
- [ ] Security audit with `npm audit`

## Troubleshooting

### Backend Issues

**Prisma Client Error:**
```bash
cd auth-service
npx prisma generate
```

**Database Connection Error:**
- Check DATABASE_URL in .env
- Ensure database is running
- Verify credentials


### Frontend Issues

**API Connection Error:**
- Verify backend services are running
- Check VITE_*_URL in .env
- Inspect browser console for CORS errors

**Build Errors:**
```bash
# Clear cache
rm -rf node_modules
npm install
```

## Contributing

We welcome contributions! Here's how you can help:

### Ways to Contribute

- Report bugs and issues
- Suggest new features and connectors
- Improve documentation
- Submit pull requests
- Code reviews
- Spread the word

### Contribution Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Commit with conventional commits
7. Submit a pull request

### Pull Request Guidelines

- Follow existing code style
- Write meaningful commit messages
- Update documentation
- Add tests for new features
- Keep PRs focused and small
- Describe changes clearly in PR description

## Roadmap

### Phase 1: Core Features ✅
- [x] User authentication system
- [x] JWT-based authorization
- [x] Connector CRUD operations
- [x] Widget management
- [x] Real-time data fetching
- [x] macOS-inspired UI

### Phase 2: Enhanced Features 🚧
- [ ] Drag and drop widget positioning
- [ ] Custom widget themes
- [ ] Widget resizing
- [ ] Dashboard layouts (save/load)
- [ ] Connector marketplace
- [ ] OAuth integration for connectors
- [ ] Mobile app (React Native)

### Phase 3: Advanced Features 📋
- [ ] Real-time notifications via WebSocket
- [ ] Multi-user collaboration
- [ ] Widget sharing between users
- [ ] Advanced analytics dashboard
- [ ] Custom connector builder (no-code)
- [ ] Plugin system
- [ ] GraphQL API option

### Phase 4: Enterprise Features 📋
- [ ] Role-based access control (RBAC)
- [ ] Team workspaces
- [ ] Audit logging
- [ ] SSO integration
- [ ] White-label option
- [ ] Advanced security features

## Performance

### Optimization Features

- Vite for fast HMR and builds
- Code splitting with React lazy loading
- Efficient re-renders with React hooks
- Auto-cleanup of interval timers
- Database indexing on frequently queried fields
- Connection pooling in Prisma

### Best Practices

- Keep widget refresh rates reasonable (≥5 seconds)
- Limit simultaneous open windows (max 6 recommended)
- Optimize widget API endpoints
- Use CDN for static assets in production
- Enable gzip compression
- Implement caching strategies

## License

This project is licensed under the MIT License - see the [LICENSE.txt](LICENSE.txt) file for details.

## Authors

### Gloria Ago
- **Email:** enagnon.ago@epitech.eu
- **WhatsApp:** +229 61 85 48 48
- **Portfolio:** [my linkedIn](www.linkedin.com/in/gloria-enagnon-ago-65345421b)


#### Leroi Kakatsi
- **Email:** leroi.kakatsi@epitech.eu
- **WhatsApp:** +233 53 561 0908
- **Portfolio:** [kingweb.pythonanywhere.com](https://kingweb.pythonanywhere.com)

#### Lauret Chacha
- **Email:** lauret.chacha@epitech.eu
- **WhatsApp:** +229 0162166638
- **Portfolio:** [https://--](www.--)

  
#### Rafiathou Yacoubou
- **Email:** rafiathou.yacoubou@epitech.eu
- **WhatsApp:** +229 --
- **Portfolio:** [https://--](www.--)




## Acknowledgments

- NestJS team for the powerful framework
- React team for the amazing library
- Vite team for blazing fast tooling
- Prisma team for excellent ORM
- Tailwind CSS for utility-first styling
- The open-source community


**Built with ❤️ by [Kings and Queens of Code]**