import 'package:flutter/material.dart';
import '../../config/theme.dart';

class AppStatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;
  final String? subtitle;

  const AppStatCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    this.color = AppTheme.primary,
    this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
        boxShadow: AppTheme.shadowSm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [color.withOpacity(0.25), color.withOpacity(0.08)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(12),
                  boxShadow: AppTheme.shadowAccent(color).map((s) =>
                    BoxShadow(color: color.withOpacity(0.2), blurRadius: 10)
                  ).toList(),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const Spacer(),
            ],
          ),
          const SizedBox(height: 14),
          Text(value, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 20, fontWeight: FontWeight.w800, letterSpacing: -0.5)),
          const SizedBox(height: 3),
          Text(title, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11, fontWeight: FontWeight.w500)),
          if (subtitle != null) ...[const SizedBox(height: 4), Text(subtitle!, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w700))],
        ],
      ),
    );
  }
}

class AppCard extends StatelessWidget {
  final String? title;
  final Widget child;
  final EdgeInsets? padding;

  const AppCard({super.key, this.title, required this.child, this.padding});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppTheme.border),
        boxShadow: AppTheme.shadowSm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (title != null)
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
              decoration: BoxDecoration(
                border: Border(bottom: BorderSide(color: AppTheme.border)),
              ),
              child: Text(title!, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w700, letterSpacing: -0.2)),
            ),
          Padding(padding: padding ?? const EdgeInsets.all(16), child: child),
        ],
      ),
    );
  }
}

class GoalProgressCard extends StatelessWidget {
  final String name;
  final double current;
  final double target;
  final double progress;

  const GoalProgressCard({
    super.key,
    required this.name,
    required this.current,
    required this.target,
    required this.progress,
  });

  @override
  Widget build(BuildContext context) {
    Color barColor = progress >= 1.0 ? AppTheme.success : progress >= 0.5 ? AppTheme.primary : AppTheme.warning;
    return Container(
      padding: const EdgeInsets.all(14),
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: progress >= 1.0 ? AppTheme.success.withOpacity(0.3) : AppTheme.border),
        boxShadow: progress >= 1.0 ? AppTheme.shadowAccent(AppTheme.success) : AppTheme.shadowSm,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(child: Text(name, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w600))),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: barColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('${(progress * 100).toStringAsFixed(0)}%',
                  style: TextStyle(color: barColor, fontSize: 11, fontWeight: FontWeight.w700)),
              ),
            ],
          ),
          const SizedBox(height: 10),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: progress,
              backgroundColor: AppTheme.surfaceAlt,
              valueColor: AlwaysStoppedAnimation<Color>(barColor),
              minHeight: 7,
            ),
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('₹${current.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
              Text('₹${target.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }
}

class HabitTile extends StatelessWidget {
  final String name;
  final bool completed;
  final int streak;
  final VoidCallback onToggle;

  const HabitTile({
    super.key,
    required this.name,
    required this.completed,
    required this.streak,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 250),
      curve: Curves.easeOutCubic,
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: completed ? AppTheme.success.withOpacity(0.06) : AppTheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: completed ? AppTheme.success.withOpacity(0.35) : AppTheme.border,
        ),
        boxShadow: completed ? AppTheme.shadowAccent(AppTheme.success) : AppTheme.shadowSm,
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: onToggle,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 24, height: 24,
              decoration: BoxDecoration(
                gradient: completed ? AppTheme.savingsGradient : null,
                color: completed ? null : Colors.transparent,
                border: completed ? null : Border.all(color: AppTheme.textSecondary, width: 2),
                borderRadius: BorderRadius.circular(7),
                boxShadow: completed ? AppTheme.shadowAccent(AppTheme.success) : null,
              ),
              child: completed ? const Icon(Icons.check_rounded, color: Colors.white, size: 14) : null,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              name,
              style: TextStyle(
                color: completed ? AppTheme.textSecondary : AppTheme.textPrimary,
                fontSize: 13,
                fontWeight: completed ? FontWeight.normal : FontWeight.w500,
                decoration: completed ? TextDecoration.lineThrough : null,
                decorationColor: AppTheme.textSecondary,
              ),
            ),
          ),
          if (streak > 0)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: Colors.orange.withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.local_fire_department_rounded, color: Colors.orange, size: 13),
                  const SizedBox(width: 2),
                  Text('$streak', style: const TextStyle(color: Colors.orange, fontSize: 11, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
