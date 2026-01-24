# CarrefourMacon Mobile

Mobile app for CarrefourMacon - Connecting service providers with customers in Cameroon.

## 🚀 Tech Stack

- **React Native + Expo** - Cross-platform mobile development
- **TypeScript** - Type safety and better DX
- **Expo Router** - File-based routing
- **React Query** - Server state management
- **Axios** - HTTP client
- **AsyncStorage** - Local data persistence

## 📋 Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Studio
- Backend API running (see [carrefourmacon-api](https://github.com/t-yanick/carrefourmacon-api))

## 🛠️ Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/t-yanick/carrefourmacon-mobile.git
cd carrefourmacon-mobile
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env and configure your API URL
```

**`.env` file:**
```
EXPO_PUBLIC_API_URL=http://localhost:5000/api/v1
EXPO_PUBLIC_ENV=development
```

**Important:** 
- For iOS Simulator: Use `http://localhost:5000`
- For Android Emulator: Use `http://10.0.2.2:5000`
- For Physical Devices: Use your computer's IP address (e.g., `http://192.168.1.100:5000`)

### 4. Start the development server

```bash
npm start
```

This will open Expo Dev Tools in your browser.

### 5. Run on device/simulator

**iOS (Mac only):**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Web (for testing):**
```bash
npm run web
```

Or scan the QR code with:
- **iOS:** Camera app → Opens in Expo Go
- **Android:** Expo Go app

## 📱 App Features

### Authentication Flow
- Welcome screen with app introduction
- Phone number login (Cameroon: +237)
- OTP verification via SMS
- Automatic role-based navigation

### Customer App
- Browse service providers by category
- View provider details and reviews
- Create and manage bookings
- Secure payments via FlutterWave
- Track booking status
- Leave reviews and ratings

### Provider App
- Manage business profile
- Accept/reject booking requests
- Track earnings and payments
- View customer reviews
- Update service availability

## 📂 Project Structure

```
carrefourmacon-mobile/
├── app/                    # Expo Router pages
│   ├── (auth)/            # Authentication screens
│   ├── (customer)/        # Customer app
│   ├── (provider)/        # Provider app
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── src/
│   ├── api/               # API integration
│   ├── components/        # Reusable components
│   ├── context/           # React Context
│   ├── hooks/             # Custom hooks
│   ├── types/             # TypeScript types
│   ├── utils/             # Utilities
│   └── constants/         # App constants
├── assets/                # Images, fonts, icons
└── ...config files
```

## 🔑 Key Screens Implemented

### ✅ Step 1: Project Structure
- Complete folder structure
- Configuration files (package.json, tsconfig.json, app.json)
- Type definitions
- API client setup
- Utility functions

### ✅ Step 2: Authentication
- `app/(auth)/welcome.tsx` - Welcome/onboarding screen
- `app/(auth)/login.tsx` - Phone number input
- `app/(auth)/verify-otp.tsx` - OTP verification
- Auth context and state management

### 🚧 Step 3: Customer App (Next)
- Home screen with provider listings
- Provider detail screen
- Booking creation flow
- Bookings list and management
- User profile

### 🚧 Step 4: Provider App (Coming)
- Provider dashboard
- Booking management
- Earnings tracker
- Profile management

## 🔧 Development Commands

```bash
# Start development server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🌐 API Integration

The app connects to the CarrefourMacon API backend:

**Base URL:** Configured in `.env` file

**Key Endpoints:**
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP & login
- `GET /auth/profile` - Get user profile
- `GET /providers` - List providers
- `POST /bookings` - Create booking
- `GET /bookings` - List bookings

See [API Documentation](https://github.com/t-yanick/carrefourmacon-api) for details.

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `EXPO_PUBLIC_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |
| `EXPO_PUBLIC_ENV` | Environment | `development` or `production` |

## 🎨 Design System

**Colors:**
- Primary: Blue (#2563EB)
- Secondary: Green (#10B981)
- Accent: Amber (#F59E0B)

**Components:**
- Button (primary, secondary, outline, danger variants)
- Input (with label and error states)
- Card, Loading, Toast notifications

## 🧪 Testing

Test accounts (seeded in backend):
- **Customer:** +237611111111 (OTP: check backend logs)
- **Provider:** +237622222222 (OTP: check backend logs)

## 🚀 Deployment

### Building for Production

**iOS:**
```bash
eas build --platform ios
```

**Android:**
```bash
eas build --platform android
```

Requires EAS CLI: `npm install -g eas-cli`

## 🐛 Troubleshooting

**Issue: Cannot connect to API**
- Check your API URL in `.env`
- For Android emulator, use `http://10.0.2.2:5000`
- For physical devices, use your computer's IP address
- Ensure backend is running

**Issue: OTP not received**
- Check Africa's Talking configuration in backend
- Verify phone number format (+237XXXXXXXXX)
- Check backend logs for SMS errors

**Issue: App crashes on start**
- Clear cache: `expo start -c`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`
- Reset Metro bundler cache

## 📄 License

MIT

## 👨‍💻 Author

**Yanick T.**
- GitHub: [@t-yanick](https://github.com/t-yanick)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Email: support@carrefourmacon.com

## 🗺️ Roadmap

- [x] Project setup and structure
- [x] Authentication flow (OTP)
- [ ] Customer app UI
- [ ] Provider app UI
- [ ] Payment integration
- [ ] Push notifications
- [ ] In-app chat
- [ ] Reviews and ratings
- [ ] Multi-language support (French/English)

---

**Next Steps:**
1. Ensure backend API is running
2. Configure `.env` file with correct API URL
3. Run `npm start` and test authentication flow
4. Ready to build customer screens! 🚀