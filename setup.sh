#!/bin/bash

echo "🚀 Setting up CarrefourMacon Mobile App..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d ".git" ]; then
    echo "❌ Error: Please run this script from the carrefourmacon-mobile directory"
    exit 1
fi

echo "${BLUE}📦 Installing dependencies...${NC}"
npm install

echo "${BLUE}📦 Installing additional dependencies...${NC}"
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npm install @tanstack/react-query axios expo-router
npm install react-native-safe-area-context react-native-screens
npm install @react-native-async-storage/async-storage react-native-toast-message
npm install expo-linking expo-constants

echo "${BLUE}📁 Creating folder structure...${NC}"
mkdir -p src/api
mkdir -p src/components/common
mkdir -p src/components/provider
mkdir -p src/components/booking
mkdir -p src/context
mkdir -p src/hooks
mkdir -p src/utils
mkdir -p src/types
mkdir -p src/constants

mkdir -p app/\(auth\)
mkdir -p app/\(customer\)
mkdir -p app/\(provider\)
mkdir -p app/provider
mkdir -p app/booking

echo "${BLUE}📄 Creating source files...${NC}"
# Types
touch src/types/user.ts
touch src/types/provider.ts
touch src/types/booking.ts
touch src/types/api.ts

# Constants
touch src/constants/config.ts
touch src/constants/colors.ts
touch src/constants/routes.ts

# Utils
touch src/utils/storage.ts
touch src/utils/validation.ts
touch src/utils/formatters.ts

# API
touch src/api/client.ts
touch src/api/auth.ts
touch src/api/providers.ts
touch src/api/bookings.ts
touch src/api/payments.ts

# Context
touch src/context/AuthContext.tsx

# Components
touch src/components/common/Button.tsx
touch src/components/common/Input.tsx
touch src/components/common/Card.tsx
touch src/components/common/Loading.tsx

echo "${BLUE}📱 Creating app screens...${NC}"
# Root
touch app/_layout.tsx
touch app/index.tsx

# Auth screens
touch app/\(auth\)/_layout.tsx
touch app/\(auth\)/welcome.tsx
touch app/\(auth\)/login.tsx
touch app/\(auth\)/verify-otp.tsx

# Customer screens (placeholders for now)
touch app/\(customer\)/_layout.tsx
touch app/\(customer\)/home.tsx
touch app/\(customer\)/bookings.tsx
touch app/\(customer\)/messages.tsx
touch app/\(customer\)/profile.tsx

# Provider screens (placeholders for now)
touch app/\(provider\)/_layout.tsx
touch app/\(provider\)/dashboard.tsx
touch app/\(provider\)/bookings.tsx
touch app/\(provider\)/earnings.tsx
touch app/\(provider\)/profile.tsx

echo "${BLUE}⚙️  Creating config files...${NC}"
touch .env.example
touch PROJECT_STRUCTURE.md

# Create .env from example
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "${GREEN}✅ Created .env file${NC}"
else
    echo "${BLUE}ℹ️  .env file already exists, skipping${NC}"
fi

echo ""
echo "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "1. Copy the code from Claude into each file"
echo "2. Edit .env and set your API URL:"
echo "   EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1"
echo "3. Run: npm start"
echo ""
echo "Happy coding! 🎉"
