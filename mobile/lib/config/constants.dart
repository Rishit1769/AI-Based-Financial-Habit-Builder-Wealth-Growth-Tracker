class AppConstants {
  // Change this to your actual backend IP/domain when deploying
  static const String baseUrl = 'http://10.0.2.2:5000/api'; // Android emulator → localhost
  // static const String baseUrl = 'http://192.168.1.x:5000/api'; // Physical device on same WiFi

  static const String tokenKey = 'access_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'user_data';

  static const Duration connectTimeout = Duration(seconds: 15);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Currencies
  static const String defaultCurrency = 'INR';
  static const String currencySymbol = '₹';

  // Expense categories
  static const List<String> expenseCategories = [
    'food', 'transport', 'utilities', 'entertainment', 'health',
    'education', 'shopping', 'housing', 'insurance', 'other',
  ];

  // Income categories
  static const List<String> incomeCategories = [
    'salary', 'freelance', 'investment', 'business', 'rental', 'gift', 'other',
  ];

  // Investment types
  static const List<String> investmentTypes = [
    'stocks', 'mutual_funds', 'crypto', 'real_estate', 'gold', 'fixed_deposit', 'bonds', 'other',
  ];
}
