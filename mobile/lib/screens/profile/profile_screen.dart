import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../config/theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/theme_provider.dart';
import '../../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Map<String, dynamic>? _profile;
  bool _loading = true;
  bool _saving = false;

  final _nameCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();
  final _targetCtrl = TextEditingController();
  String _currency = 'INR';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await api.get('/users/profile');
      final p = res['data'] as Map<String, dynamic>;
      final fp = p['financial_profile'] as Map<String, dynamic>? ?? {};
      setState(() {
        _profile = p;
        _nameCtrl.text = p['name'] ?? '';
        _bioCtrl.text = fp['bio'] ?? '';
        _targetCtrl.text = fp['monthly_income_target']?.toString() ?? '';
        _currency = fp['currency'] ?? 'INR';
        _loading = false;
      });
    } catch (_) { setState(() => _loading = false); }
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await api.put('/users/profile', data: {
        'name': _nameCtrl.text,
        'bio': _bioCtrl.text,
        'monthly_income_target': _targetCtrl.text,
        'currency': _currency,
      });
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile updated!'), backgroundColor: AppTheme.success));
    } catch (_) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Failed to update'), backgroundColor: AppTheme.error));
    }
    if (mounted) setState(() => _saving = false);
  }

  Future<void> _logout() async {
    final ok = await showDialog<bool>(context: context, builder: (_) => AlertDialog(
      backgroundColor: AppTheme.surface,
      title: const Text('Sign Out', style: TextStyle(color: AppTheme.textPrimary)),
      content: const Text('Are you sure you want to sign out?', style: TextStyle(color: AppTheme.textSecondary)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Sign Out', style: TextStyle(color: AppTheme.error))),
      ],
    )) ?? false;
    if (!ok || !mounted) return;
    await context.read<AuthProvider>().logout();
    if (mounted) Navigator.pushReplacementNamed(context, '/login');
  }

  @override
  void dispose() { _nameCtrl.dispose(); _bioCtrl.dispose(); _targetCtrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final initials = user?.name.split(' ').map((n) => n[0]).join('').toUpperCase().substring(0, user.name.isEmpty ? 0 : 1) ?? '?';

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [TextButton(onPressed: _logout, child: const Text('Logout', style: TextStyle(color: AppTheme.error)))],
      ),
      body: _loading ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                // Avatar
                Center(
                  child: Column(children: [
                    Container(
                      width: 80, height: 80,
                      decoration: BoxDecoration(gradient: AppTheme.primaryGradient, borderRadius: BorderRadius.zero),
                      child: Center(child: Text(initials, style: const TextStyle(color: const Color(0xFFF5F2EB), fontSize: 28, fontWeight: FontWeight.bold))),
                    ),
                    const SizedBox(height: 12),
                    Text(user?.email ?? '', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                    if (user?.role == 'admin') ...[
                      const SizedBox(height: 4),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                        decoration: BoxDecoration(color: AppTheme.warning.withOpacity(0.2), borderRadius: BorderRadius.zero),
                        child: const Text('Admin', style: TextStyle(color: AppTheme.warning, fontSize: 11, fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ]),
                ),
                const SizedBox(height: 24),

                // Edit form
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.zero, border: Border.all(color: AppTheme.border)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                    const Text('Personal Information', style: TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 16),
                    TextFormField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Full Name', prefixIcon: Icon(Icons.person_outline))),
                    const SizedBox(height: 12),
                    TextFormField(controller: _bioCtrl, decoration: const InputDecoration(labelText: 'Bio (optional)')),
                    const SizedBox(height: 12),
                    TextFormField(controller: _targetCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Monthly Income Target (₹)', prefixIcon: Icon(Icons.currency_rupee))),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: _currency, dropdownColor: AppTheme.surfaceAlt, decoration: const InputDecoration(labelText: 'Currency'),
                      items: const [
                        DropdownMenuItem(value: 'INR', child: Text('INR — ₹', style: TextStyle(color: AppTheme.textPrimary))),
                        DropdownMenuItem(value: 'USD', child: Text('USD — \$', style: TextStyle(color: AppTheme.textPrimary))),
                        DropdownMenuItem(value: 'EUR', child: Text('EUR — €', style: TextStyle(color: AppTheme.textPrimary))),
                      ],
                      onChanged: (v) => setState(() => _currency = v ?? 'INR'),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton(
                      onPressed: _saving ? null : _save,
                      child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: const Color(0xFFF5F2EB))) : const Text('Save Changes'),
                    ),
                  ]),
                ),
                const SizedBox(height: 16),

                // Theme toggle
                Consumer<ThemeProvider>(
                  builder: (context, themeProvider, _) => Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.zero, border: Border.all(color: AppTheme.border)),
                    child: Row(
                      children: [
                        Container(
                          width: 36, height: 36,
                          decoration: BoxDecoration(color: AppTheme.primary.withOpacity(0.15), borderRadius: BorderRadius.zero),
                          child: Icon(themeProvider.isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded, color: AppTheme.primary, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            const Text('App Theme', style: TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w500)),
                            Text(themeProvider.isDark ? 'Dark mode' : 'Light mode', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
                          ]),
                        ),
                        Switch(
                          value: themeProvider.isDark,
                          onChanged: (_) => themeProvider.toggle(),
                          activeColor: AppTheme.primary,
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Logout button
                OutlinedButton.icon(
                  onPressed: _logout,
                  icon: const Icon(Icons.logout, color: AppTheme.error, size: 18),
                  label: const Text('Sign Out', style: TextStyle(color: AppTheme.error)),
                  style: OutlinedButton.styleFrom(
                    side: const BorderSide(color: AppTheme.error),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                  ),
                ),
              ]),
            ),
    );
  }
}
