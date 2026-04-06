class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final bool isActive;
  final FinancialProfile? financialProfile;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    required this.isActive,
    this.financialProfile,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
    id: json['id'] ?? '',
    name: json['name'] ?? '',
    email: json['email'] ?? '',
    role: json['role'] ?? 'user',
    isActive: json['is_active'] ?? true,
    financialProfile: json['financial_profile'] != null
        ? FinancialProfile.fromJson(json['financial_profile'])
        : null,
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'name': name, 'email': email, 'role': role, 'is_active': isActive,
    if (financialProfile != null) 'financial_profile': financialProfile!.toJson(),
  };
}

class FinancialProfile {
  final double? monthlyIncomeTarget;
  final String currency;
  final String? bio;

  FinancialProfile({this.monthlyIncomeTarget, this.currency = 'INR', this.bio});

  factory FinancialProfile.fromJson(Map<String, dynamic> json) => FinancialProfile(
    monthlyIncomeTarget: json['monthly_income_target'] != null
        ? double.tryParse(json['monthly_income_target'].toString()) : null,
    currency: json['currency'] ?? 'INR',
    bio: json['bio'],
  );

  Map<String, dynamic> toJson() => {
    'monthly_income_target': monthlyIncomeTarget,
    'currency': currency,
    'bio': bio,
  };
}
