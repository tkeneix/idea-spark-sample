# Database Migration Guide: Supabase to PostgreSQL 17.6

This guide explains how to set up and use the PostgreSQL database for the Idea Spark application, migrated from Supabase.

## 🚀 Quick Start

1. **Start the database:**
   ```bash
   ./scripts/setup-database.sh
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install PostgreSQL client dependency:**
   ```bash
   npm install pg @types/pg --legacy-peer-deps
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

## 📋 Database Schema

The application uses the following main tables:

- `business_themes` - Business themes/categories
- `technologies` - Technology options
- `business_ideas` - User-submitted ideas
- `idea_themes` - Many-to-many relationship between ideas and themes
- `idea_technologies` - Many-to-many relationship between ideas and technologies
- `votes` - Voting records for ideas
- `admin_settings` - Application configuration

## 🛠 Available Scripts

### Setup and Management
- `./scripts/setup-database.sh` - Initialize database with schema and seed data
- `./scripts/connect-database.sh` - Connect to the database via psql
- `./scripts/reset-database.sh` - Reset database (⚠️ destroys all data)

### Manual Database Operations

**Connect to database:**
```bash
docker exec -it postgres-dev psql -U postgres -d idea_spark
```

**Run schema script manually:**
```bash
docker exec -i postgres-dev psql -U postgres -d idea_spark < scripts/init-database.sql
```

**Run seed data script manually:**
```bash
docker exec -i postgres-dev psql -U postgres -d idea_spark < scripts/seed-data.sql
```

**View tables:**
```bash
docker exec -it postgres-dev psql -U postgres -d idea_spark -c '\dt'
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=idea_spark
POSTGRES_USER=
POSTGRES_PASSWORD=
OPENAI_API_KEY=your_openai_api_key_here
```

### Docker Configuration

The PostgreSQL container is configured in `docker-compose.yml`:
- **Container name:** `postgres-dev`
- **Port:** `5432`
- **Database:** `idea_spark`
- **Username:** ``
- **Password:** ``
- **Data persistence:** Docker volume `postgres_data`

## 🔄 Migration Changes

### What Changed

1. **Database Client:** Replaced Supabase client with standard PostgreSQL client (`pg`)
2. **Connection Management:** Created connection pool in `lib/postgresql.ts`
3. **Database Operations:** Abstracted all database operations in `lib/database.ts`
4. **API Routes:** Updated all API routes to use the new database client
5. **Schema:** Converted Supabase schema to standard PostgreSQL with proper indexes and constraints

### API Compatibility

All existing API endpoints remain the same:
- `/api/ideas` - List and search ideas
- `/api/vote` - Vote for ideas
- `/api/admin/themes` - Manage business themes
- `/api/admin/technologies` - Manage technologies
- `/api/leaderboard` - Get idea rankings

### Data Structure

The data structure remains identical to maintain frontend compatibility. All relationships and data types are preserved.

## 🧪 Seed Data

The database includes initial seed data:

- **10 Business Themes:** Healthcare, FinTech, Education, etc.
- **10 Technologies:** AI/ML, Blockchain, IoT, etc.
- **5 Sample Ideas:** With themes and technologies linked
- **Vote Counts:** Sample voting data
- **Admin Settings:** Default configuration

## 🔍 Troubleshooting

### Common Issues

**PostgreSQL not starting:**
```bash
docker-compose down
docker-compose up -d postgres
```

**Connection refused:**
- Ensure PostgreSQL container is running: `docker ps`
- Check port 5432 is not in use by another service
- Verify environment variables in `.env`

**Permission errors:**
```bash
chmod +x scripts/*.sh
```

**Database schema errors:**
- Reset database: `./scripts/reset-database.sh`
- Check SQL syntax in `scripts/init-database.sql`

### Database Inspection

**Check table contents:**
```sql
-- Connect to database
docker exec -it postgres-dev psql -U postgres -d idea_spark

-- List all tables
\dt

-- View table structure
\d business_ideas

-- Check data
SELECT COUNT(*) FROM business_ideas;
SELECT * FROM business_themes LIMIT 5;
```

## 🚦 Production Considerations

For production deployment:

1. **Security:**
   - Change default passwords
   - Use connection pooling
   - Enable SSL connections
   - Implement proper authentication

2. **Performance:**
   - Monitor connection pool usage
   - Add additional indexes as needed
   - Consider read replicas for high traffic

3. **Backup:**
   - Set up regular database backups
   - Test recovery procedures
   - Monitor disk space

4. **Monitoring:**
   - Set up database monitoring
   - Track query performance
   - Monitor connection counts

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js pg library](https://node-postgres.com/)
- [Docker PostgreSQL](https://hub.docker.com/_/postgres)