class IncomeModel {
  final String id;
  final String source;
  final double amount;
  final String category;
  final String? notes;
  final DateTime date;

  IncomeModel({
    required this.id,
    required this.source,
    required this.amount,
    required this.category,
    this.notes,
    required this.date,
  });

  factory IncomeModel.fromJson(Map<String, dynamic> j) => IncomeModel(
    id: j['id'] ?? '',
    source: j['source'] ?? '',
    amount: double.tryParse(j['amount'].toString()) ?? 0,
    category: j['category'] ?? 'other',
    notes: j['notes'],
    date: DateTime.tryParse(j['date'] ?? '') ?? DateTime.now(),
  );
}

class ExpenseModel {
  final String id;
  final String description;
  final double amount;
  final String category;
  final String? notes;
  final DateTime date;

  ExpenseModel({
    required this.id,
    required this.description,
    required this.amount,
    required this.category,
    this.notes,
    required this.date,
  });

  factory ExpenseModel.fromJson(Map<String, dynamic> j) => ExpenseModel(
    id: j['id'] ?? '',
    description: j['description'] ?? '',
    amount: double.tryParse(j['amount'].toString()) ?? 0,
    category: j['category'] ?? 'other',
    notes: j['notes'],
    date: DateTime.tryParse(j['date'] ?? '') ?? DateTime.now(),
  );
}

class HabitModel {
  final String id;
  final String name;
  final String? description;
  final String frequency;
  final int targetDays;
  final bool completedToday;
  final int streak;

  HabitModel({
    required this.id,
    required this.name,
    this.description,
    required this.frequency,
    required this.targetDays,
    required this.completedToday,
    required this.streak,
  });

  factory HabitModel.fromJson(Map<String, dynamic> j) => HabitModel(
    id: j['id'] ?? '',
    name: j['name'] ?? '',
    description: j['description'],
    frequency: j['frequency'] ?? 'daily',
    targetDays: int.tryParse(j['target_days'].toString()) ?? 30,
    completedToday: j['completed_today'] == true || j['completed_today'] == 1,
    streak: int.tryParse(j['streak']?.toString() ?? '0') ?? 0,
  );
}

class SavingsGoalModel {
  final String id;
  final String name;
  final double targetAmount;
  final double currentAmount;
  final DateTime? deadline;
  final bool isCompleted;
  final String? notes;

  SavingsGoalModel({
    required this.id,
    required this.name,
    required this.targetAmount,
    required this.currentAmount,
    this.deadline,
    required this.isCompleted,
    this.notes,
  });

  double get progress => targetAmount > 0 ? (currentAmount / targetAmount).clamp(0.0, 1.0) : 0;
  double get progressPercent => progress * 100;

  factory SavingsGoalModel.fromJson(Map<String, dynamic> j) => SavingsGoalModel(
    id: j['id'] ?? '',
    name: j['name'] ?? '',
    targetAmount: double.tryParse(j['target_amount'].toString()) ?? 0,
    currentAmount: double.tryParse(j['current_amount'].toString()) ?? 0,
    deadline: j['deadline'] != null ? DateTime.tryParse(j['deadline']) : null,
    isCompleted: j['is_completed'] == true || j['is_completed'] == 1,
    notes: j['notes'],
  );
}

class InvestmentModel {
  final String id;
  final String name;
  final String type;
  final double amountInvested;
  final double currentValue;
  final DateTime? purchaseDate;

  InvestmentModel({
    required this.id,
    required this.name,
    required this.type,
    required this.amountInvested,
    required this.currentValue,
    this.purchaseDate,
  });

  double get gain => currentValue - amountInvested;
  double get gainPercent => amountInvested > 0 ? (gain / amountInvested * 100) : 0;

  factory InvestmentModel.fromJson(Map<String, dynamic> j) => InvestmentModel(
    id: j['id'] ?? '',
    name: j['name'] ?? '',
    type: j['type'] ?? 'other',
    amountInvested: double.tryParse(j['amount_invested'].toString()) ?? 0,
    currentValue: double.tryParse(j['current_value'].toString()) ?? 0,
    purchaseDate: j['purchase_date'] != null ? DateTime.tryParse(j['purchase_date']) : null,
  );
}
