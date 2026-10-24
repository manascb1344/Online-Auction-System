SHELL := /bin/bash
.DEFAULT_GOAL := help

DB ?= mysql
MYSQL_HOST_PORT ?= 3306
POSTGRES_HOST_PORT ?= 5433
DB_USER ?= auction_user
DB_PASSWORD ?= auction_password
DB_NAME ?= auction_system
TEST_JWT_SECRET ?= test-secret-not-for-production

COMPOSE := docker compose -f docker-compose.yml

ifeq ($(DB),mysql)
COMPOSE := $(COMPOSE) -f docker/compose.mysql.yml
DB_HOST_PORT := $(MYSQL_HOST_PORT)
DB_SHELL := mysql -u"$$DB_USER" -p"$$DB_PASSWORD" "$$DB_NAME"
else ifeq ($(DB),postgres)
COMPOSE := $(COMPOSE) -f docker/compose.postgres.yml
DB_HOST_PORT := $(POSTGRES_HOST_PORT)
DB_SHELL := psql -U "$$DB_USER" -d "$$DB_NAME"
else
$(error DB must be mysql or postgres, got "$(DB)")
endif

.PHONY: help env install up down db-up db-reset db-shell dev-api dev-client logs ps test test-mysql test-postgres test-all adminer clean

help:
	@printf "Online Auction System - DB=%s\n\n" "$(DB)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

.env:
	@cp .env.example .env
	@secret=$$(openssl rand -hex 32); sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$$secret|" .env
	@echo "Created .env with a generated JWT_SECRET."

env: .env ## Create .env from the example if missing

install: .env ## Install server and client dependencies
	cd server && pnpm install
	cd client && pnpm install

up: .env ## Build and start API + client against the selected database
	$(COMPOSE) up -d --build --wait

down: .env ## Stop containers (data volumes are kept)
	$(COMPOSE) down --remove-orphans

db-up: .env ## Start only the selected database
	$(COMPOSE) up -d --wait db

db-reset: .env ## Recreate the database volume and reload schema + seed
	$(COMPOSE) down -v --remove-orphans
	$(COMPOSE) up -d --wait db

db-shell: .env ## Open a SQL shell on the selected database
	$(COMPOSE) exec db $(DB_SHELL)

dev-api: ## Run the API on the host with auto-reload
	cd server && pnpm dev

dev-client: ## Run the React dev server on the host
	cd client && pnpm start

logs: .env ## Follow container logs
	$(COMPOSE) logs -f --tail=100

ps: .env ## Show container status
	$(COMPOSE) ps

test: db-reset ## Reset the database, then run integration tests for DB
	cd server && NODE_ENV=test JWT_SECRET=$(TEST_JWT_SECRET) DB_CLIENT=$(DB) \
		DB_HOST=127.0.0.1 DB_PORT=$(DB_HOST_PORT) DB_USER=$(DB_USER) \
		DB_PASSWORD=$(DB_PASSWORD) DB_NAME=$(DB_NAME) pnpm test

test-mysql: ## Run the integration suite against MySQL 8
	$(MAKE) test DB=mysql

test-postgres: ## Run the integration suite against PostgreSQL 16
	$(MAKE) test DB=postgres

test-all: test-mysql test-postgres ## Run the integration suite against both engines

adminer: .env ## Start Adminer at localhost:8080
	$(COMPOSE) --profile tools up -d adminer

clean: .env ## Remove containers and database volumes
	$(COMPOSE) down -v --remove-orphans
