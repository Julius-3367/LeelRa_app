#!/usr/bin/env bash
# ============================================================
# LeelRa App – Start dev server
# Run anytime: bash dev.sh
# ============================================================
set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; NC='\033[0m'

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo -e "${CYAN}[LeelRa]${NC} Starting development server..."

# Ensure Prisma client is up to date
npx prisma generate --silent 2>/dev/null || true

echo -e "${GREEN}[LeelRa]${NC} App running at http://localhost:3000"
npm run dev
