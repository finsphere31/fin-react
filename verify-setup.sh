#!/bin/bash

# Color codes for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Fin React - Connection Verification  ${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check Node.js
echo -e "${YELLOW}1. Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js is installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo -e "${YELLOW}  Install from: https://nodejs.org/${NC}"
    exit 1
fi

# Check npm
echo -e "\n${YELLOW}2. Checking npm installation...${NC}"
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓ npm is installed: v$NPM_VERSION${NC}"
else
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

# Check Backend dependencies
echo -e "\n${YELLOW}3. Checking Backend dependencies...${NC}"
if [ -d "Backend/node_modules" ]; then
    echo -e "${GREEN}✓ Backend node_modules exists${NC}"
else
    echo -e "${YELLOW}  Installing Backend dependencies...${NC}"
    cd Backend && npm install > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Backend dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install Backend dependencies${NC}"
        exit 1
    fi
    cd ..
fi

# Check Frontend dependencies
echo -e "\n${YELLOW}4. Checking Frontend dependencies...${NC}"
if [ -d "Frontend/node_modules" ]; then
    echo -e "${GREEN}✓ Frontend node_modules exists${NC}"
else
    echo -e "${YELLOW}  Installing Frontend dependencies...${NC}"
    cd Frontend && npm install > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}✗ Failed to install Frontend dependencies${NC}"
        exit 1
    fi
    cd ..
fi

# Check Backend .env
echo -e "\n${YELLOW}5. Checking Backend configuration...${NC}"
if [ -f "Backend/.env" ]; then
    echo -e "${GREEN}✓ Backend/.env exists${NC}"
    echo -e "${BLUE}  Contents:${NC}"
    grep -E "^[A-Z]" Backend/.env | sed 's/^/    /'
else
    echo -e "${RED}✗ Backend/.env not found${NC}"
    echo -e "${YELLOW}  Creating Backend/.env...${NC}"
    cat > Backend/.env << 'EOF'
PORT=4000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=fin-react-demo-secret-key-change-in-production
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/fin-react
EOF
    echo -e "${GREEN}✓ Backend/.env created${NC}"
fi

# Check Frontend .env.local
echo -e "\n${YELLOW}6. Checking Frontend configuration...${NC}"
if [ -f "Frontend/.env.local" ]; then
    echo -e "${GREEN}✓ Frontend/.env.local exists${NC}"
    echo -e "${BLUE}  Contents:${NC}"
    grep -E "^VITE_" Frontend/.env.local | sed 's/^/    /'
else
    echo -e "${RED}✗ Frontend/.env.local not found${NC}"
    echo -e "${YELLOW}  Creating Frontend/.env.local...${NC}"
    cat > Frontend/.env.local << 'EOF'
VITE_API_URL=http://localhost:4000/api
EOF
    echo -e "${GREEN}✓ Frontend/.env.local created${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✓ All checks passed!              ${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo -e "${BLUE}📋 Quick Start:${NC}"
echo -e "  ${YELLOW}Terminal 1${NC} - Start Backend:"
echo -e "    ${BLUE}cd Backend && npm start${NC}"
echo -e ""
echo -e "  ${YELLOW}Terminal 2${NC} - Start Frontend:"
echo -e "    ${BLUE}cd Frontend && npm run dev${NC}"
echo -e ""
echo -e "  ${YELLOW}Browser${NC} - Open:"
echo -e "    ${BLUE}http://localhost:5173${NC}"
echo -e ""
echo -e "${GREEN}✓ Everything is ready!${NC}\n"
