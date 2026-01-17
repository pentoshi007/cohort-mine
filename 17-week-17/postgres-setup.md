# PostgreSQL Setup and Usage Guide (macOS M1)

## ✅ Installation Complete

- **Version**: PostgreSQL 18.1 (Homebrew)
- **Status**: Running as background service
- **User**: aniketpandey (superuser)
- **Password**: Set (mypassword123)

## Connection Methods

### Method 1: Simple Connection (No Password Required Locally)

```bash
# Connect to default user database
psql

# Connect to specific database
psql -d postgres

# Connect to specific database with username
psql -U aniketpandey -d postgres
```

### Method 2: Connection with Password

```bash
# Connect with password prompt
psql -U aniketpandey -d postgres -W

# Or use connection string
psql "postgresql://aniketpandey:mypassword123@localhost:5432/postgres"
```

### Method 3: Using PGPASSWORD Environment Variable

```bash
# Set password in environment (for scripts)
PGPASSWORD=mypassword123 psql -U aniketpandey -d postgres
```

## Common PostgreSQL Commands

### Service Management

```bash
# Start PostgreSQL
brew services start postgresql@18

# Stop PostgreSQL
brew services stop postgresql@18

# Restart PostgreSQL
brew services restart postgresql@18

# Check status
brew services list | grep postgres
```

### Database Operations (Command Line)

```bash
# Create a new database
createdb my_database

# Drop a database
dropdb my_database

# List all databases
psql -l

# Connect to a database and run a command
psql -d my_database -c "SELECT * FROM users;"
```

### Inside psql Interactive Shell

```sql
-- List all databases
\l

-- Connect to a database
\c database_name

-- List all tables in current database
\dt

-- Describe a table structure
\d table_name

-- List all users/roles
\du

-- Show current connection info
\conninfo

-- Execute SQL from a file
\i /path/to/file.sql

-- Quit psql
\q
```

## SQL Examples

### Create a Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Insert Data

```sql
INSERT INTO users (username, email, password)
VALUES ('john_doe', 'john@example.com', 'hashed_password');
```

### Query Data

```sql
-- Select all
SELECT * FROM users;

-- Select with condition
SELECT username, email FROM users WHERE id = 1;

-- Join tables
SELECT users.username, orders.total
FROM users
INNER JOIN orders ON users.id = orders.user_id;
```

### Update Data

```sql
UPDATE users
SET email = 'newemail@example.com'
WHERE username = 'john_doe';
```

### Delete Data

```sql
DELETE FROM users WHERE id = 5;
```

## Connection Configuration for Node.js/TypeScript

### Connection Details

- **Host**: `localhost` or `127.0.0.1`
- **Port**: `5432`
- **User**: `aniketpandey`
- **Password**: `mypassword123`
- **Database**: `postgres` (default) or any database you create

### Environment Variables (.env file)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=aniketpandey
DB_PASSWORD=mypassword123
DB_NAME=postgres

# Or use connection string
DATABASE_URL=postgresql://aniketpandey:mypassword123@localhost:5432/postgres
```

### Using with Node.js (pg library)

```typescript
import { Client } from "pg";

// Method 1: Individual parameters
const client = new Client({
  host: "localhost",
  port: 5432,
  user: "aniketpandey",
  password: "mypassword123",
  database: "postgres",
});

// Method 2: Connection string
const client = new Client({
  connectionString:
    "postgresql://aniketpandey:mypassword123@localhost:5432/postgres",
});

// Connect and query
await client.connect();
const result = await client.query("SELECT NOW()");
console.log(result.rows);
await client.end();
```

## Security Best Practices

1. **Never commit passwords to git**

   - Use `.env` files
   - Add `.env` to `.gitignore`

2. **Use environment variables**

   ```typescript
   import dotenv from "dotenv";
   dotenv.config();

   const password = process.env.DB_PASSWORD;
   ```

3. **For production**
   - Use strong passwords
   - Enable SSL connections
   - Limit user permissions
   - Use connection pooling

## Troubleshooting

### Issue: "database does not exist"

```bash
# Create the database
createdb database_name
# Or in psql
CREATE DATABASE database_name;
```

### Issue: "connection refused"

```bash
# Check if PostgreSQL is running
brew services list | grep postgres

# Start it if stopped
brew services start postgresql@18
```

### Issue: "password authentication failed"

```bash
# Reset password
psql -U aniketpandey -d postgres
ALTER USER aniketpandey WITH PASSWORD 'new_password';
```

### Issue: psql command not found (after opening new terminal)

```bash
# Restart your terminal or run:
source ~/.zshrc
```

## Quick Start Workflow

1. **Start PostgreSQL** (if not already running)

   ```bash
   brew services start postgresql@18
   ```

2. **Connect to database**

   ```bash
   psql
   ```

3. **Create a database for your project**

   ```sql
   CREATE DATABASE myapp;
   \c myapp
   ```

4. **Create tables and start working**

   ```sql
   CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100));
   INSERT INTO users (name) VALUES ('Alice');
   SELECT * FROM users;
   ```

5. **Use in your Node.js/TypeScript app**
   - Install: `npm install pg`
   - Connect using credentials above
   - Run queries from your code

## Useful Resources

- Official Documentation: https://www.postgresql.org/docs/
- pg (Node.js driver): https://node-postgres.com/
- Prisma (ORM): https://www.prisma.io/
- Drizzle (ORM): https://orm.drizzle.team/

---

**Your PostgreSQL is now ready to use with password authentication!**

To test it right now, open a new terminal and run:

```bash
psql
```

It should connect you to your PostgreSQL database automatically.
