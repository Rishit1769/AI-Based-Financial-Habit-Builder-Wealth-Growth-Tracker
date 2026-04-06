import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../config/theme.dart';
import 'dashboard/dashboard_screen.dart';
import 'income/income_screen.dart';
import 'expenses/expense_screen.dart';
import 'habits/habits_screen.dart';
import 'savings/savings_screen.dart';
import 'investments/investments_screen.dart';
import 'ai/ai_screen.dart';
import 'notifications/notifications_screen.dart';
import 'profile/profile_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<({Widget screen, String label, IconData icon, IconData activeIcon})> _tabs = const [
    (screen: DashboardScreen(), label: 'Dashboard', icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard_rounded),
    (screen: IncomeScreen(), label: 'Income', icon: Icons.trending_up_outlined, activeIcon: Icons.trending_up_rounded),
    (screen: ExpenseScreen(), label: 'Expenses', icon: Icons.shopping_cart_outlined, activeIcon: Icons.shopping_cart_rounded),
    (screen: HabitsScreen(), label: 'Habits', icon: Icons.repeat_outlined, activeIcon: Icons.repeat_rounded),
    (screen: SavingsScreen(), label: 'Savings', icon: Icons.savings_outlined, activeIcon: Icons.savings_rounded),
    (screen: InvestmentsScreen(), label: 'Invest', icon: Icons.pie_chart_outline, activeIcon: Icons.pie_chart_rounded),
    (screen: AiScreen(), label: 'AI', icon: Icons.auto_awesome_outlined, activeIcon: Icons.auto_awesome_rounded),
    (screen: NotificationsScreen(), label: 'Alerts', icon: Icons.notifications_outlined, activeIcon: Icons.notifications_rounded),
    (screen: ProfileScreen(), label: 'Profile', icon: Icons.person_outline, activeIcon: Icons.person_rounded),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _tabs.map((t) => t.screen).toList(),
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppTheme.surface,
          border: Border(top: BorderSide(color: AppTheme.border)),
        ),
        child: SafeArea(
          child: SizedBox(
            height: 60,
            child: Row(
              children: _tabs.asMap().entries.map((e) {
                final i = e.key;
                final t = e.value;
                final selected = _currentIndex == i;
                return Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _currentIndex = i),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          selected ? t.activeIcon : t.icon,
                          color: selected ? AppTheme.primary : AppTheme.textSecondary,
                          size: 22,
                        ),
                        const SizedBox(height: 3),
                        Text(
                          t.label,
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: selected ? FontWeight.w700 : FontWeight.normal,
                            color: selected ? AppTheme.primary : AppTheme.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }
}
