# Flutter Mobile App Setup Instructions

## Prerequisites
1. Install Flutter SDK: https://flutter.dev/docs/get-started/install
2. Install Android Studio or configure Android SDK tools
3. Connect an Android device or start an emulator

## Setup Steps

```bash
# 1. Navigate to mobile directory
cd mobile

# 2. Create Flutter project scaffold (preserves existing lib/ files)
flutter create . --platforms android

# 3. Install dependencies
flutter pub get

# 4. Configure the backend URL
# Edit lib/config/constants.dart:
# - For Android emulator: baseUrl = 'http://10.0.2.2:5000/api'
# - For physical device: baseUrl = 'http://YOUR_PC_IP:5000/api'
# - For production: baseUrl = 'https://yourdomain.com/api'

# 5. Run the app
flutter run
```

## Build APK for Distribution
```bash
# Debug build
flutter build apk --debug

# Release build (requires signing setup)
flutter build apk --release

# Upload to MinIO for web APK download feature
# The generated APK will be at: build/app/outputs/flutter-apk/app-release.apk
# Upload it to MinIO 'apk' bucket as 'app-release.apk'
```

## Uploading APK to MinIO
After building:
1. Go to MinIO console: http://localhost:9000
2. Navigate to the 'apk' bucket
3. Upload `app-release.apk`
4. The web app's "Download App" button will then serve this file

## Project Structure
```
lib/
├── main.dart                    # App entry point
├── config/
│   ├── constants.dart           # API URL, category lists
│   └── theme.dart               # Dark theme
├── models/
│   └── models.dart              # User, Income, Expense, Habit, SavingsGoal, Investment models
├── services/
│   ├── api_service.dart         # Dio HTTP client with auto token refresh
│   ├── auth_service.dart        # Login, register, logout
│   └── storage_service.dart     # Secure token storage
├── providers/
│   ├── auth_provider.dart       # Auth state management
│   └── dashboard_provider.dart  # Dashboard data
└── screens/
    ├── splash_screen.dart
    ├── main_screen.dart         # Bottom navigation
    ├── auth/
    │   ├── login_screen.dart
    │   └── register_screen.dart
    ├── dashboard/dashboard_screen.dart
    ├── income/income_screen.dart
    ├── expenses/expense_screen.dart
    ├── habits/habits_screen.dart
    ├── savings/savings_screen.dart
    ├── investments/investments_screen.dart
    ├── ai/ai_screen.dart
    └── profile/profile_screen.dart
```