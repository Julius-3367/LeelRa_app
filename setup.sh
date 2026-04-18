#!/usr/bin/env bash
# ============================================================
# LeelRa App – First-time setup script
# Run once: bash setup.sh
# ============================================================
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'

info()    { echo -e "${CYAN}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[OK]${NC}   $*"; }
error()   { echo -e "${RED}[ERR]${NC}  $*" >&2; exit 1; }

# ── 0. Paths ──────────────────────────────────────────────────
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$DIR/.env.local"

# ── 1. Node dependencies ─────────────────────────────────────
info "Installing npm dependencies..."
cd "$DIR"
npm install --legacy-peer-deps
success "npm install done"

# ── 2. PostgreSQL – create DB + user ─────────────────────────
info "Setting up PostgreSQL database..."

DB_NAME="leelra_db"
DB_USER="leelra_user"
DB_PASS="leelra_pass_2026"
DB_HOST="localhost"
DB_PORT="5432"

# Use the postgres unix socket (peer auth) via sudo -u postgres
PG="sudo -u postgres psql -v ON_ERROR_STOP=1 -tAq"

# Create role if it doesn't exist
$PG -c "
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '$DB_USER') THEN
      CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASS';
    END IF;
  END
  \$\$;
" && success "Role '$DB_USER' ready"

# Create database if it doesn't exist
$PG -c "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" \
  | grep -q 1 \
  || $PG -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;"
success "Database '$DB_NAME' ready"

# Grant privileges
$PG -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" \
  && success "Privileges granted"

# ── 3. Update .env.local with the working DATABASE_URL ────────
info "Updating DATABASE_URL in .env.local..."
DB_URL="postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
  sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"${DB_URL}\"|" "$ENV_FILE"
else
  echo "DATABASE_URL=\"${DB_URL}\"" >> "$ENV_FILE"
fi
success ".env.local updated: DATABASE_URL"

# ── 4. Prisma generate + migrate ─────────────────────────────
info "Running Prisma migrations..."
npx prisma generate
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss
success "Prisma migrations applied"

# ── 5. Seed database ─────────────────────────────────────────
info "Seeding database..."
npm run db:seed && success "Database seeded" || echo "[WARN] Seed skipped (may already be seeded)"

# ── Done ──────────────────────────────────────────────────────
echo ""
success "Setup complete! Run the app with:  bash dev.sh"
