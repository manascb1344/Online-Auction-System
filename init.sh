#!/bin/bash

# Wait for MariaDB to start
until mysqladmin ping -h"localhost" --silent; do
    echo "Waiting for database connection..."
    sleep 2
done

# Import the SQL file
if [ -f /docker-entrypoint-initdb.d/backup.sql ]; then
    echo "Importing database..."
    mysql -u root -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < /docker-entrypoint-initdb.d/backup.sql
else
    echo "No backup file found."
fi

echo "Setup complete."
