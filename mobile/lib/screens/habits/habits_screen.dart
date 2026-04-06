import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';
import '../../models/models.dart';
import '../../widgets/widgets.dart';

class HabitsScreen extends StatefulWidget {
  const HabitsScreen({super.key});

  @override
  State<HabitsScreen> createState() => _HabitsScreenState();
}

class _HabitsScreenState extends State<HabitsScreen> {
  List<HabitModel> _habits = [];
  bool _loading = true;

  @override void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await api.get('/habits/stats');
      final list = (res['data'] as List? ?? []).map((e) => HabitModel.fromJson(e)).toList();
      setState(() { _habits = list; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  Future<void> _toggle(HabitModel h) async {
    try {
      if (h.completedToday) {
        await api.delete('/habits/${h.id}/complete');
      } else {
        await api.post('/habits/${h.id}/complete', data: {'date': DateTime.now().toIso8601String().split('T')[0]});
      }
      _load();
    } catch (_) {}
  }

  void _showModal([HabitModel? editing]) {
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _HabitModal(editing: editing, onSaved: _load),
    );
  }

  Future<void> _delete(String id) async {
    final ok = await showDialog<bool>(context: context, builder: (_) => AlertDialog(
      backgroundColor: AppTheme.surface,
      title: const Text('Delete Habit', style: TextStyle(color: AppTheme.textPrimary)),
      content: const Text('Are you sure?', style: TextStyle(color: AppTheme.textSecondary)),
      actions: [TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete', style: TextStyle(color: AppTheme.error)))],
    )) ?? false;
    if (!ok) return;
    await api.delete('/habits/$id');
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final daily = _habits.where((h) => h.frequency == 'daily').toList();
    final completedCount = daily.where((h) => h.completedToday).length;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('Habits'), actions: [IconButton(icon: const Icon(Icons.add), onPressed: () => _showModal())]),
      body: _loading ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : RefreshIndicator(
              onRefresh: _load, color: AppTheme.primary,
              child: ListView(padding: const EdgeInsets.all(16), children: [
                // Progress
                if (daily.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(16), border: Border.all(color: AppTheme.border)),
                    child: Column(children: [
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                        const Text("Today's Progress", style: TextStyle(color: AppTheme.textSecondary, fontSize: 13)),
                        Text('$completedCount/${daily.length}', style: const TextStyle(color: AppTheme.primary, fontWeight: FontWeight.bold)),
                      ]),
                      const SizedBox(height: 10),
                      ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(
                        value: daily.isEmpty ? 0 : completedCount / daily.length,
                        backgroundColor: AppTheme.surfaceAlt,
                        valueColor: const AlwaysStoppedAnimation<Color>(AppTheme.primary),
                        minHeight: 8,
                      )),
                    ]),
                  ),
                  const SizedBox(height: 16),
                ],
                if (_habits.isEmpty) const Center(child: Text('No habits yet. Create one!', style: TextStyle(color: AppTheme.textSecondary)))
                else ..._habits.map((h) => Column(children: [
                  HabitTile(name: h.name, completed: h.completedToday, streak: h.streak, onToggle: () => _toggle(h)),
                  // ... edit/delete via long press
                ])),
              ]),
            ),
    );
  }
}

class _HabitModal extends StatefulWidget {
  final HabitModel? editing;
  final VoidCallback onSaved;
  const _HabitModal({this.editing, required this.onSaved});
  @override State<_HabitModal> createState() => _HabitModalState();
}

class _HabitModalState extends State<_HabitModal> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _desc;
  String _frequency = 'daily';
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.editing?.name ?? '');
    _desc = TextEditingController(text: widget.editing?.description ?? '');
    _frequency = widget.editing?.frequency ?? 'daily';
  }

  @override void dispose() { _name.dispose(); _desc.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final data = { 'name': _name.text, 'description': _desc.text, 'frequency': _frequency, 'target_days': 30 };
    try {
      if (widget.editing != null) await api.put('/habits/${widget.editing!.id}', data: data);
      else await api.post('/habits', data: data);
      if (mounted) { Navigator.pop(context); widget.onSaved(); }
    } catch (_) { setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 20, right: 20, top: 20),
      child: Form(key: _formKey, child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text(widget.editing != null ? 'Edit Habit' : 'New Habit', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'Habit name'), validator: (v) => v!.isEmpty ? 'Required' : null),
        const SizedBox(height: 12),
        TextFormField(controller: _desc, decoration: const InputDecoration(labelText: 'Description (optional)')),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          value: _frequency, dropdownColor: AppTheme.surfaceAlt, decoration: const InputDecoration(labelText: 'Frequency'),
          items: ['daily','weekly','monthly'].map((f) => DropdownMenuItem(value: f, child: Text(f, style: const TextStyle(color: AppTheme.textPrimary)))).toList(),
          onChanged: (v) => setState(() => _frequency = v!),
        ),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: _saving ? null : _save,
          child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
            : Text(widget.editing != null ? 'Update' : 'Create')),
        const SizedBox(height: 12),
      ])),
    );
  }
}
