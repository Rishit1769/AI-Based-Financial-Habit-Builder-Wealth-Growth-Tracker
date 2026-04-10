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
import 'admin/admin_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  List<({Widget screen, String label, IconData icon, IconData activeIcon})> _buildTabs(bool isAdmin) {
    final tabs = <({Widget screen, String label, IconData icon, IconData activeIcon})>[
      (screen: const DashboardScreen(), label: 'Dashboard', icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard_rounded),
      (screen: const IncomeScreen(), label: 'Income', icon: Icons.trending_up_outlined, activeIcon: Icons.trending_up_rounded),
      (screen: const ExpenseScreen(), label: 'Expenses', icon: Icons.shopping_cart_outlined, activeIcon: Icons.shopping_cart_rounded),
      (screen: const HabitsScreen(), label: 'Habits', icon: Icons.repeat_outlined, activeIcon: Icons.repeat_rounded),
      (screen: const SavingsScreen(), label: 'Savings', icon: Icons.savings_outlined, activeIcon: Icons.savings_rounded),
      (screen: const InvestmentsScreen(), label: 'Invest', icon: Icons.pie_chart_outline, activeIcon: Icons.pie_chart_rounded),
      (screen: const AiScreen(), label: 'AI', icon: Icons.auto_awesome_outlined, activeIcon: Icons.auto_awesome_rounded),
      (screen: const NotificationsScreen(), label: 'Alerts', icon: Icons.notifications_outlined, activeIcon: Icons.notifications_rounded),
      (screen: const ProfileScreen(), label: 'Profile', icon: Icons.person_outline, activeIcon: Icons.person_rounded),
    ];
    if (isAdmin) {
      tabs.add((screen: const AdminScreen(), label: 'Admin', icon: Icons.shield_outlined, activeIcon: Icons.shield_rounded));
    }
    return tabs;
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final tabs = _buildTabs(auth.user?.role == 'admin');
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: tabs.map((t) => t.screen).toList(),
      ),
      bottomNavigationBar: _buildBottomNav(tabs),
    );
  }

  Widget _buildBottomNav(List<({Widget screen, String label, IconData icon, IconData activeIcon})> tabs) {
    return Container(
      decoration: BoxDecoration(
        color: AppTheme.surface,
        border: Border(top: BorderSide(color: AppTheme.border, width: 1)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.4), blurRadius: 20, offset: const Offset(0, -4)),
        ],
      ),
      child: SafeArea(
        child: SizedBox(
          height: 62,
          child: Row(
            children: tabs.asMap().entries.map((e) {
              final i = e.key;
              final t = e.value;
              final selected = _currentIndex == i;
              return Expanded(
                child: GestureDetector(
                  behavior: HitTestBehavior.opaque,
                  onTap: () => setState(() => _currentIndex = i),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    curve: Curves.easeOutCubic,
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          width: selected ? 40 : 28,
                          height: 28,
                          decoration: selected
                              ? BoxDecoration(
                                  borderRadius: BorderRadius.circular(10),
                                  gradient: AppTheme.primaryGradient,
                                  boxShadow: AppTheme.shadowAccent(AppTheme.primary),
                                )
                              : null,
                          child: Icon(
                            selected ? t.activeIcon : t.icon,
                            color: selected ? Colors.white : AppTheme.textSecondary,
                            size: 18,
                          ),
                        ),
                        const SizedBox(height: 4),
                        AnimatedDefaultTextStyle(
                          duration: const Duration(milliseconds: 200),
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: selected ? FontWeight.w700 : FontWeight.normal,
                            color: selected ? AppTheme.primary : AppTheme.textMuted,
                          ),
                          child: Text(t.label),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ),
    );
  }
}
