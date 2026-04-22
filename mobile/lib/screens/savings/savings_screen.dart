import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';
import '../../models/models.dart';
import '../../widgets/widgets.dart';

class SavingsScreen extends StatefulWidget {
  const SavingsScreen({super.key});

  @override
  State<SavingsScreen> createState() => _SavingsScreenState();
}

class _SavingsScreenState extends State<SavingsScreen> {
  List<SavingsGoalModel> _goals = [];
  bool _loading = true;

  @override void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await api.get('/savings');
      final list = (res['data'] as List? ?? []).map((e) => SavingsGoalModel.fromJson(e)).toList();
      setState(() { _goals = list; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  void _showModal([SavingsGoalModel? editing]) {
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _GoalModal(editing: editing, onSaved: _load),
    );
  }

  void _showContribute(SavingsGoalModel g) {
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _ContributeModal(goal: g, onSaved: _load),
    );
  }

  Future<void> _delete(String id) async {
    final ok = await showDialog<bool>(context: context, builder: (_) => AlertDialog(
      backgroundColor: AppTheme.surface,
      title: const Text('Delete Goal', style: TextStyle(color: AppTheme.textPrimary)),
      content: const Text('Are you sure?', style: TextStyle(color: AppTheme.textSecondary)),
      actions: [TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete', style: TextStyle(color: AppTheme.error)))],
    )) ?? false;
    if (!ok) return;
    await api.delete('/savings/$id');
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('Savings Goals'), actions: [IconButton(icon: const Icon(Icons.add), onPressed: () => _showModal())]),
      body: _loading ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : RefreshIndicator(
              onRefresh: _load, color: AppTheme.primary,
              child: _goals.isEmpty ? const Center(child: Text('No savings goals yet.', style: TextStyle(color: AppTheme.textSecondary)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _goals.length,
                      itemBuilder: (_, i) {
                        final g = _goals[i];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.zero, border: Border.all(color: g.isCompleted ? AppTheme.success.withOpacity(0.4) : AppTheme.border)),
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                              Row(children: [
                                Icon(Icons.savings_rounded, color: g.isCompleted ? AppTheme.success : AppTheme.primary, size: 20),
                                const SizedBox(width: 8),
                                Text(g.name, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
                              ]),
                              if (g.isCompleted) const Text('Achieved!', style: TextStyle(color: AppTheme.success, fontSize: 11, fontWeight: FontWeight.bold)),
                            ]),
                            const SizedBox(height: 12),
                            GoalProgressCard(name: '', current: g.currentAmount, target: g.targetAmount, progress: g.progress),
                            if (!g.isCompleted) ...[
                              const SizedBox(height: 8),
                              Row(children: [
                                Expanded(child: ElevatedButton.icon(
                                  onPressed: () => _showContribute(g),
                                  icon: const Icon(Icons.add, size: 16), label: const Text('Add Funds'),
                                  style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 10)),
                                )),
                                const SizedBox(width: 8),
                                IconButton(icon: const Icon(Icons.edit_outlined, color: AppTheme.textSecondary), onPressed: () => _showModal(g)),
                                IconButton(icon: const Icon(Icons.delete_outline, color: AppTheme.error), onPressed: () => _delete(g.id)),
                              ]),
                            ],
                          ]),
                        );
                      },
                    ),
            ),
    );
  }
}

class _GoalModal extends StatefulWidget {
  final SavingsGoalModel? editing;
  final VoidCallback onSaved;
  const _GoalModal({this.editing, required this.onSaved});
  @override State<_GoalModal> createState() => _GoalModalState();
}

class _GoalModalState extends State<_GoalModal> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _target;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.editing?.name ?? '');
    _target = TextEditingController(text: widget.editing?.targetAmount.toString() ?? '');
  }

  @override void dispose() { _name.dispose(); _target.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final data = { 'name': _name.text, 'target_amount': _target.text };
    try {
      if (widget.editing != null) await api.put('/savings/${widget.editing!.id}', data: data);
      else await api.post('/savings', data: data);
      if (mounted) { Navigator.pop(context); widget.onSaved(); }
    } catch (_) { setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 20, right: 20, top: 20),
      child: Form(key: _formKey, child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text(widget.editing != null ? 'Edit Goal' : 'New Savings Goal', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'Goal Name'), validator: (v) => v!.isEmpty ? 'Required' : null),
        const SizedBox(height: 12),
        TextFormField(controller: _target, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Target Amount (₹)'), validator: (v) => v!.isEmpty ? 'Required' : null),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: _saving ? null : _save,
          child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: const Color(0xFFF5F2EB)))
            : Text(widget.editing != null ? 'Update' : 'Create Goal')),
        const SizedBox(height: 12),
      ])),
    );
  }
}

class _ContributeModal extends StatefulWidget {
  final SavingsGoalModel goal;
  final VoidCallback onSaved;
  const _ContributeModal({required this.goal, required this.onSaved});
  @override State<_ContributeModal> createState() => _ContributeModalState();
}

class _ContributeModalState extends State<_ContributeModal> {
  final _ctrl = TextEditingController();
  bool _saving = false;

  @override void dispose() { _ctrl.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (_ctrl.text.isEmpty) return;
    setState(() => _saving = true);
    try {
      await api.post('/savings/${widget.goal.id}/contribute', data: {'amount': double.parse(_ctrl.text)});
      if (mounted) { Navigator.pop(context); widget.onSaved(); }
    } catch (_) { setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 20, right: 20, top: 20),
      child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text('Add to "${widget.goal.name}"', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        TextFormField(controller: _ctrl, keyboardType: TextInputType.number, autofocus: true, decoration: const InputDecoration(labelText: 'Amount (₹)')),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: _saving ? null : _save,
          child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: const Color(0xFFF5F2EB))) : const Text('Add Funds')),
        const SizedBox(height: 12),
      ]),
    );
  }
}
