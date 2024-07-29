FROM mariadb:10.11

# Set environment variables
ENV MYSQL_ROOT_PASSWORD=dbpass
ENV MYSQL_DATABASE=dbms
ENV MYSQL_USER=myuser
ENV MYSQL_PASSWORD=mypassword

# Copy the initialization script and SQL backup file
COPY init.sh /docker-entrypoint-initdb.d/
COPY sql-files/backup.sql /docker-entrypoint-initdb.d/

RUN chmod +x /docker-entrypoint-initdb.d/init.sh
# Expose MariaDB port
EXPOSE 3306
