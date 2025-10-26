#!/bin/bash
set -e

echo "🚀 Setting up Kiox development environment..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "❌ Docker not installed"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "❌ Python3 not installed"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "❌ Node.js not installed"; exit 1; }

echo "✅ Prerequisites check passed"

# Copy env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env from template..."
    cp .env.example .env
    echo "⚠️  Remember to fill in your actual secrets in .env"
fi

# Backend setup
echo "🐍 Setting up Python backend..."
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

# Web setup
echo "⚛️  Setting up React web..."
cd web
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your actual credentials"
echo "2. Run: make dev"
echo "3. Visit http://localhost:5173"
