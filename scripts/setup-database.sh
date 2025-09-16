#!/bin/bash

# Database setup script for PostgreSQL Docker container
# This script initializes the database with schema and seed data

set -e

echo "🚀 Setting up PostgreSQL database for Idea Spark..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start PostgreSQL container
echo "📦 Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Function to check if PostgreSQL is ready
check_postgres() {
    docker exec postgres-dev pg_isready -U postgres -d idea_spark > /dev/null 2>&1
}

# Wait up to 60 seconds for PostgreSQL to be ready
COUNTER=0
while ! check_postgres; do
    echo "⏳ PostgreSQL is still starting... (${COUNTER}s)"
    sleep 5
    COUNTER=$((COUNTER + 5))
    if [ $COUNTER -ge 60 ]; then
        echo "❌ PostgreSQL failed to start within 60 seconds"
        exit 1
    fi
done

echo "✅ PostgreSQL is ready!"

# Initialize database schema
echo "📋 Creating database schema..."
docker exec -i postgres-dev psql -U postgres -d idea_spark < scripts/init-database.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema created successfully!"
else
    echo "❌ Failed to create database schema"
    exit 1
fi

# Insert seed data
echo "🌱 Inserting seed data..."
docker exec -i postgres-dev psql -U postgres -d idea_spark < scripts/seed-data.sql

if [ $? -eq 0 ]; then
    echo "✅ Seed data inserted successfully!"
else
    echo "❌ Failed to insert seed data"
    exit 1
fi

echo ""
echo "🎉 Database setup completed successfully!"
echo ""
echo "📊 Database connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: idea_spark"
echo "  Username: postgres"
echo "  Password: password"
echo ""
echo "🔧 To connect to the database:"
echo "  docker exec -it postgres-dev psql -U postgres -d idea_spark"
echo ""
echo "📋 To view tables:"
echo "  docker exec -it postgres-dev psql -U postgres -d idea_spark -c '\\dt'"
echo ""
echo "🛑 To stop the database:"
echo "  docker-compose down"