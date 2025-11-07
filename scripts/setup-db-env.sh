#!/bin/bash

# Script to set up database environment for the POS application
# Usage: ./setup-db-env.sh [options]

set -e  # Exit on any error

# Default values
ENV_FILE=".env"
SUPABASE_URL=""
SUPABASE_ANON_KEY=""

# Help function
show_help() {
    echo "Usage: $0 [options]"
    echo "Set up database environment for POS application"
    echo ""
    echo "Options:"
    echo "  -u, --url URL             Supabase URL (e.g., https://xxxxx.supabase.co)"
    echo "  -k, --key KEY             Supabase Anon Key (JWT)"
    echo "  -f, --file FILE           Environment file to use (default: .env)"
    echo "  -h, --help                Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --url https://xxxxx.supabase.co --key eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    echo "  $0 -u https://xxxxx.supabase.co -k eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -u|--url)
            SUPABASE_URL="$2"
            shift 2
            ;;
        -k|--key)
            SUPABASE_ANON_KEY="$2"
            shift 2
            ;;
        -f|--file)
            ENV_FILE="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# If no arguments provided, try to read from environment variables
if [[ -z "$SUPABASE_URL" ]]; then
    if [[ -f "$ENV_FILE" ]]; then
        # Try to source existing values from env file if they exist
        source "$ENV_FILE" 2>/dev/null || true
    fi
    
    # Use environment variables if available, otherwise prompt
    read -p "Enter Supabase URL (or press Enter to use existing VITE_SUPABASE_URL=$VITE_SUPABASE_URL): " INPUT_URL
    if [[ -n "$INPUT_URL" ]]; then
        SUPABASE_URL="$INPUT_URL"
    elif [[ -z "$VITE_SUPABASE_URL" ]]; then
        echo "Error: No Supabase URL provided." >&2
        exit 1
    else
        SUPABASE_URL="$VITE_SUPABASE_URL"
    fi
fi

if [[ -z "$SUPABASE_ANON_KEY" ]]; then
    read -s -p "Enter Supabase Anon Key (or press Enter to use existing VITE_SUPABASE_ANON_KEY): " INPUT_KEY
    echo  # New line after password
    if [[ -n "$INPUT_KEY" ]]; then
        SUPABASE_ANON_KEY="$INPUT_KEY"
    elif [[ -z "$VITE_SUPABASE_ANON_KEY" ]]; then
        echo "Error: No Supabase Anon Key provided." >&2
        exit 1
    else
        SUPABASE_ANON_KEY="$VITE_SUPABASE_ANON_KEY"
    fi
fi

# Validate inputs (basic checks)
if [[ "$SUPABASE_URL" != *"supabase.co"* ]] || [[ ! "$SUPABASE_URL" =~ ^https?:// ]]; then
    echo "Warning: This doesn't look like a valid Supabase URL." >&2
    read -p "Continue anyway? (y/N): " CONT
    if [[ ! "$CONT" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

if [[ "$SUPABASE_ANON_KEY" != "eyJ"* ]] || [[ $(echo "$SUPABASE_ANON_KEY" | tr -cd '.' | wc -c) -ne 2 ]]; then
    echo "Warning: This doesn't look like a valid JWT key." >&2
    read -p "Continue anyway? (y/N): " CONT
    if [[ ! "$CONT" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Write to environment file
cat > "$ENV_FILE" << EOF
# Supabase Configuration
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Additional configuration variables can be added here
EOF

echo "✅ Database configuration saved to $ENV_FILE"
echo "To apply the changes, restart your development server (npm run dev)"