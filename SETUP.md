# Online Auction System - Setup Guide

This guide will help you set up the Online Auction System, which includes a React frontend in the `client` directory and a backend powered by Node.js and PostgreSQL in the `server` directory, with PostgreSQL running in a Docker container.

## Prerequisites

Ensure that the following are installed on your machine:

- **Node.js** (v14 or higher)
- **npm** or **pnpm** (recommended)
- **Git** (for version control)
- **Docker** (for PostgreSQL Container)

## Project Structure

- **client/**: Contains the React frontend.
- **server/**: Contains the Node.js backend (Express.js).
- **database/**: SQL scripts and schema for PostgreSQL.

## 1. Clone the Repository

First, clone the project repository:

```bash
git clone https://github.com/manascb1344/Online-Auction-System.git
cd Online-Auction-System
```

## 2. Set Up the Frontend

The frontend is built with React and located in the `client` directory.

### Steps:

1. Navigate to the `client` folder:

   ```bash
   cd client
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

   Or using npm:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   pnpm start
   ```

   Or using npm:

   ```bash
   npm start
   ```

The React app should now be running on `http://localhost:3000`.

## 3. Set Up the Backend

The backend uses Node.js with Express.js and PostgreSQL. It's located in the `server` directory.

### Steps:

1. Navigate to the `server` folder:

   ```bash
   cd ../server
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

   Or using npm:

   ```bash
   npm install
   ```


## 4. Docker Setup for PostgreSQL

We will use Docker to create and manage the PostgreSQL database, naming the container `auction_postgres`.

### Steps:

1. Create a `docker-compose.yml` file in the root directory with the following content:

   ```yaml
   version: '3'
   services:
     postgres:
       container_name: auction_postgres
       image: postgres:latest
       environment:
         POSTGRES_USER: auction_user
         POSTGRES_PASSWORD: auction_password
         POSTGRES_DB: auction_system
       ports:
         - "5432:5432"
       volumes:
         - postgres_data:/var/lib/postgresql/data
       healthcheck:
         test: ["CMD-SHELL", "pg_isready -U auction_user"]
         interval: 10s
         timeout: 5s
         retries: 5
   volumes:
     postgres_data:
   ```

2. Run the PostgreSQL container:

   ```bash
   docker-compose up -d
   ```

3. Verify that the PostgreSQL container is running:

   ```bash
   docker ps
   ```

   You should see a running container with the name `auction_postgres`.

## 5. Insert Data into PostgreSQL

To create tables and insert data into the PostgreSQL database, we will run the SQL scripts inside the `auction_postgres` container.

### Steps:
1. Go to the Project root directory
   ```bash
   cd ..
   ```
2. Copy the SQL schema and data script (`dbms.sql`) into the running PostgreSQL container:

   ```bash
      docker cp ./database/dbms.sql auction_postgres:/dbms.sql
   ```

3. Access the PostgreSQL container:

   ```bash
   docker exec -it auction_postgres bash
   ```

4. Run the SQL script inside the container to create tables and insert data:

   ```bash
   psql -U auction_user -d auction_system -f /dbms.sql
   ```

5. Exit the container:

   ```bash
   exit
   ```

## 6. Start the Backend Server

   Make sure PostgreSQL is running via Docker, then start the Node.js backend:

   ```bash
   pnpm start
   ```

   Or using npm:

   ```bash
   npm start
   ```

   The backend server should now be running on http://localhost:5000.

7. Running Both Frontend and Backend Together

   Ensure both the React frontend and the backend server are running simultaneously. If needed, configure proxying in the frontend for API requests by adding the following in client/package.json:

   ```json
   "proxy": "http://localhost:5000"
   ```

   This will proxy requests from the frontend to the backend.