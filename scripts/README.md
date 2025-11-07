# Database Configuration Scripts

This folder contains scripts to help with database configuration for the POS application.

## Available Scripts

### setup-db-config.js

This script helps set up the database configuration for the POS application by prompting for Supabase credentials and saving them to the `.env` file.

**Usage:**
```bash
npm run setup-db
# or
node scripts/setup-db-config.js
```

The script will:
1. Check if a `.env` file already exists
2. Prompt for Supabase URL and Anon Key
3. Validate the inputs
4. Save the configuration to `.env`

### Validating Configuration

To validate your current database configuration without changing it:

```bash
npm run validate-db
# or
node scripts/setup-db-config.js validate
```

## Environment Variables

The script manages these environment variables:

- `VITE_SUPABASE_URL`: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key (a JWT token)

These are needed for the application to connect to your Supabase database.