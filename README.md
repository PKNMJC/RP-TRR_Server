# IT Repair Ticketing System - Backend API

Professional IT repair ticketing system API built with NestJS, Prisma, and MySQL.

## Features

- 🔐 JWT Authentication with role-based access control
- 🎫 Ticket management system with status tracking
- 📱 LINE integration (LIFF, Messaging API, Notify)
- 📤 File upload to AWS S3
- 🔔 Real-time notifications with Bull Queue
- 📊 Dashboard analytics and reports
- 🔄 WebSocket for real-time updates
- 📋 Comprehensive API documentation with Swagger

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **Prisma** - Modern ORM for TypeScript
- **MySQL** - Relational database
- **JWT** - Authentication
- **Socket.IO** - Real-time communication
- **Bull** - Job queue
- **Redis** - Caching and message queue
- **AWS S3** - File storage
- **Swagger** - API documentation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MySQL 8.0+
- Redis
- AWS S3 credentials (for file uploads)
- LINE Channel credentials

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd backend
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Setup Prisma

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

## Development

### Start development server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
Swagger docs at `http://localhost:3000/api/docs`

### Build for production

```bash
npm run build
```

### Run production build

```bash
npm run start:prod
```

## Database

### Run migrations

```bash
npx prisma migrate dev --name <migration-name>
```

### Reset database (development only)

```bash
npx prisma migrate reset
```

### Open Prisma Studio

```bash
npx prisma studio
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register new admin
- `POST /api/v1/auth/login` - Login admin

### Tickets

- `POST /api/v1/tickets` - Create ticket
- `GET /api/v1/tickets` - List all tickets (admin)
- `GET /api/v1/tickets/:id` - Get ticket details
- `PUT /api/v1/tickets/:id` - Update ticket
- `GET /api/v1/tickets/user/:lineUserId` - Get user's tickets

### Health

- `GET /api/v1/health` - Health check

## Project Structure

```
src/
├── config/              # Configuration files
├── common/              # Shared utilities, guards, filters
├── modules/             # Feature modules
│   ├── auth/           # Authentication
│   ├── tickets/        # Ticket management
│   ├── users/          # User management
│   ├── departments/    # Departments
│   ├── admins/         # Admin management
│   ├── attachments/    # File uploads
│   ├── line/           # LINE integration
│   ├── notifications/  # Notifications
│   ├── websocket/      # Real-time features
│   └── analytics/      # Analytics
└── database/           # Prisma service
```

## Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run tests with coverage
npm run test:cov
```

## Deployment

1. Build the application

```bash
npm run build
```

2. Set environment variables on production server

3. Run migrations

```bash
npx prisma migrate deploy
```

4. Start the application

```bash
npm run start:prod
```

## Documentation

API documentation is available at `/api/docs` when the server is running.

## Environment Variables

See `.env.example` for all required environment variables.

## Contributing

1. Create a feature branch
2. Make your changes
3. Create a pull request

## License

MIT

## Support

For issues and questions, please contact the development team.

  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
