# CarrefourMacon Mobile - Project Structure

```
carrefourmacon-mobile/
├── app/                          # Expo Router pages
│   ├── (auth)/                   # Auth group (no tabs)
│   │   ├── welcome.tsx           # Welcome/splash screen
│   │   ├── login.tsx             # Phone number input
│   │   └── verify-otp.tsx        # OTP verification
│   ├── (customer)/               # Customer app (with tabs)
│   │   ├── _layout.tsx           # Customer tab layout
│   │   ├── home.tsx              # Browse providers
│   │   ├── bookings.tsx          # My bookings
│   │   ├── messages.tsx          # Chat/messages
│   │   └── profile.tsx           # User profile
│   ├── (provider)/               # Provider app (with tabs)
│   │   ├── _layout.tsx           # Provider tab layout
│   │   ├── dashboard.tsx         # Provider dashboard
│   │   ├── bookings.tsx          # Manage bookings
│   │   ├── earnings.tsx          # Earnings & payments
│   │   └── profile.tsx           # Provider profile
│   ├── provider/                 # Provider detail screens
│   │   └── [id].tsx              # Provider detail page
│   ├── booking/                  # Booking screens
│   │   ├── create.tsx            # Create booking
│   │   └── [id].tsx              # Booking details
│   ├── _layout.tsx               # Root layout
│   └── index.tsx                 # Entry point
│
├── src/
│   ├── api/                      # API integration
│   │   ├── client.ts             # Axios instance
│   │   ├── auth.ts               # Auth endpoints
│   │   ├── providers.ts          # Provider endpoints
│   │   ├── bookings.ts           # Booking endpoints
│   │   └── payments.ts           # Payment endpoints
│   │
│   ├── components/               # Reusable components
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Loading.tsx
│   │   ├── provider/
│   │   │   ├── ProviderCard.tsx
│   │   │   └── ProviderList.tsx
│   │   └── booking/
│   │       ├── BookingCard.tsx
│   │       └── BookingStatus.tsx
│   │
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useProviders.ts
│   │   └── useBookings.ts
│   │
│   ├── context/                  # React Context
│   │   └── AuthContext.tsx
│   │
│   ├── utils/                    # Utilities
│   │   ├── storage.ts            # AsyncStorage helpers
│   │   ├── validation.ts         # Form validation
│   │   └── formatters.ts         # Date, currency formatters
│   │
│   ├── types/                    # TypeScript types
│   │   ├── api.ts                # API response types
│   │   ├── user.ts               # User types
│   │   ├── provider.ts           # Provider types
│   │   └── booking.ts            # Booking types
│   │
│   └── constants/                # App constants
│       ├── colors.ts
│       ├── config.ts
│       └── routes.ts
│
├── assets/                       # Static assets
│   ├── images/
│   ├── fonts/
│   ├── icon.png
│   └── splash.png
│
├── .env.example
├── .gitignore
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## Key Features

### Authentication Flow
1. Welcome screen → Phone number → OTP verification → Role selection
2. JWT token stored in AsyncStorage
3. Auto-login on app restart

### Customer Flow
- Browse providers by category
- View provider details & reviews
- Create bookings
- Make payments via FlutterWave
- Track booking status
- Leave reviews

### Provider Flow
- Manage profile & services
- Accept/reject bookings
- Track earnings
- View customer reviews
- Update availability

## Tech Stack
- **React Native + Expo**: Cross-platform mobile development
- **Expo Router**: File-based routing
- **TypeScript**: Type safety
- **React Query**: Server state management
- **Axios**: HTTP client
- **AsyncStorage**: Local storage