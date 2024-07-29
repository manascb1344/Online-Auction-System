#!/bin/bash

# Function to check if MariaDB is up and running
check_mariadb() {
    local RET=1
    while [[ RET -ne 0 ]]; do
        echo "=> Waiting for MariaDB service startup"
        sleep 5
        mysql -uroot -p${MYSQL_ROOT_PASSWORD} -e "status" > /dev/null 2>&1
        RET=$?
    done
}

# Function to import the backup SQL file
import_backup() {
    echo "=> Importing database from backup file"
    mariadb -uroot -p${MYSQL_ROOT_PASSWORD} ${MYSQL_DATABASE} < /sql-files/backup.sql
}

# Check if MariaDB is ready
check_mariadb

# Import the backup SQL file if it exists
if [ -f /sql-files/backup.sql ]; then
    import_backup
else
    echo "=> Backup file /sql-files/backup.sql not found, skipping import."
fi

echo "=> Granting access to all databases for '${MYSQL_USER}'"
# Create a user and grant all privileges (uncomment if needed)
# mysql -uroot -p${MYSQL_ROOT_PASSWORD} -e "CREATE USER '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}'"
mariadb -uroot -p${MYSQL_ROOT_PASSWORD} -e "GRANT ALL PRIVILEGES ON *.* TO '${MYSQL_USER}'@'%' WITH GRANT OPTION"

echo "=> Done!"
