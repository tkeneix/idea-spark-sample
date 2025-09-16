#!/bin/bash

# Quick script to connect to the PostgreSQL database
echo "🔗 Connecting to PostgreSQL database..."
docker exec -it postgres-dev psql -U postgres -d idea_spark