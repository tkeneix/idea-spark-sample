#!/bin/bash

# Script to reset the database (drop and recreate everything)
set -e

echo "⚠️  Resetting PostgreSQL database..."
echo "This will delete all existing data!"

read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled"
    exit 1
fi

echo "🗑️  Dropping and recreating database..."
docker exec postgres-dev psql -U postgres -c "DROP DATABASE IF EXISTS idea_spark;"
docker exec postgres-dev psql -U postgres -c "CREATE DATABASE idea_spark;"

echo "📋 Recreating schema..."
docker exec -i postgres-dev psql -U postgres -d idea_spark < scripts/init-database.sql

echo "🌱 Inserting seed data..."
docker exec -i postgres-dev psql -U postgres -d idea_spark < scripts/seed-data.sql

echo "✅ Database reset completed!"