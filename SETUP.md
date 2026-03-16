# Online Auction System - Setup Guide

This guide will help you set up the Online Auction System with MySQL running in Docker.

## Prerequisites

Ensure that the following are installed on your machine:

- **Node.js** (v14 or higher)
- **npm** or **pnpm** (recommended)
- **Git** (for version control)
- **Docker** & **Docker Compose** (for MySQL container)

## Project Structure

- **client/**: React frontend
- **server/**: Node.js backend (Express.js)
- **database/**: SQL scripts for MySQL

## Quick Start

### 1. Start MySQL with Docker

From the project root:

```bash
docker-compose up -d
```

This will start:
- MySQL 8.0 on port 3306
- phpMyAdmin on port 8080 (optional, for database management)

The database will be automatically initialized with the schema and sample data from `database/dbms.sql`.

### 2. Set Up the Backend

```bash
cd server
pnpm install
pnpm start
```

The backend will run on http://localhost:4000

### 3. Set Up the Frontend

In a new terminal:

```bash
cd client
pnpm install
pnpm start
```

The frontend will run on http://localhost:3000

## Database Configuration

### Environment Variables (Server)

The server uses these defaults (already set in `server/.env`):

```
DB_HOST=localhost
DB_USER=auction_user
DB_PASSWORD=auction_password
DB_NAME=auction_system
DB_PORT=3306
```

For Docker setup, these match the docker-compose configuration.

### MySQL Connection Details

- **Host**: localhost (or `mysql` if connecting from another Docker container)
- **Port**: 3306
- **Database**: auction_system
- **Username**: auction_user
- **Password**: auction_password
- **Root Password**: root_password

### phpMyAdmin Access

If you started the docker-compose with phpMyAdmin:

- URL: http://localhost:8080
- Server: mysql
- Username: root or auction_user
- Password: root_password or auction_password

## Manual Database Setup (if needed)

If you need to re-initialize the database:

```bash
# Stop and remove the container
docker-compose down -v

# Start fresh
docker-compose up -d

# Or manually run SQL
docker cp database/dbms.sql auction_mysql:/tmp/
docker exec -i auction_mysql mysql -u root -proot_password auction_system < database/dbms.sql
```

## Troubleshooting

### Port already in use

If port 3306 is already in use:

```bash
# Find what's using port 3306
sudo lsof -i :3306

# Or change the port in docker-compose.yml
ports:
  - "3307:3306"  # Use 3307 on host instead
```

Then update `server/.env`:
```
DB_PORT=3307
```

### Database connection refused

1. Make sure Docker container is running:
   ```bash
   docker ps
   ```

2. Check container logs:
   ```bash
   docker logs auction_mysql
   ```

3. Wait for MySQL to fully start (first run may take 30-60 seconds)

### Reset everything

```bash
docker-compose down -v  # Remove container and data
docker-compose up -d    # Start fresh
```

## Available Scripts

### Backend
- `pnpm start` - Start production server
- `pnpm dev` - Start with nodemon (auto-reload)

### Frontend
- `pnpm start` - Start development server
- `pnpm build` - Build for production

## Notes

- The MySQL data is persisted in a Docker volume (`mysql_data`)
- The SQL schema is automatically executed on first container startup
- Sample data (50 buyers, 50 sellers, 50 items, etc.) is included