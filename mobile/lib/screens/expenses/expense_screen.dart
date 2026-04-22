import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';
import '../../models/models.dart';
import '../../utils/export_csv.dart';

class ExpenseScreen extends StatefulWidget {
  const ExpenseScreen({super.key});

  @override
  State<ExpenseScreen> createState() => _ExpenseScreenState();
}

class _ExpenseScreenState extends State<ExpenseScreen> {
  List<ExpenseModel> _records = [];
  bool _loading = true;

  @override void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await api.get('/expenses');
      final list = (res['data'] as List? ?? []).map((e) => ExpenseModel.fromJson(e)).toList();
      setState(() { _records = list; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  void _showModal([ExpenseModel? editing]) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _ExpenseModal(editing: editing, onSaved: _load),
    );
  }

  Future<void> _delete(String id) async {
    final ok = await showDialog<bool>(context: context, builder: (_) => AlertDialog(
      backgroundColor: AppTheme.surface,
      title: const Text('Delete', style: TextStyle(color: AppTheme.textPrimary)),
      content: const Text('Delete this expense?', style: TextStyle(color: AppTheme.textSecondary)),
      actions: [TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete', style: TextStyle(color: AppTheme.error)))],
    )) ?? false;
    if (!ok) return;
    await api.delete('/expenses/$id');
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Expenses'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download_outlined),
            tooltip: 'Export CSV',
            onPressed: () => exportCsv(
              context: context,
              headers: ['Description', 'Amount', 'Category', 'Date', 'Notes'],
              keys: ['description', 'amount', 'category', 'date', 'notes'],
              rows: _records.map((r) => {
                'description': r.description, 'amount': r.amount,
                'category': r.category, 'date': '${r.date.year}-${r.date.month.toString().padLeft(2,'0')}-${r.date.day.toString().padLeft(2,'0')}', 'notes': r.notes,
              }).toList(),
              filename: 'expenses',
            ),
          ),
          IconButton(icon: const Icon(Icons.add), onPressed: () => _showModal()),
        ],
      ),
      body: _loading ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : RefreshIndicator(
              onRefresh: _load, color: AppTheme.primary,
              child: _records.isEmpty ? const Center(child: Text('No expenses yet.', style: TextStyle(color: AppTheme.textSecondary)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _records.length,
                      itemBuilder: (_, i) {
                        final r = _records[i];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.zero, border: Border.all(color: AppTheme.border)),
                          child: Row(children: [
                            Container(width: 36, height: 36,
                              decoration: BoxDecoration(color: AppTheme.error.withOpacity(0.15), borderRadius: BorderRadius.zero),
                              child: const Icon(Icons.shopping_cart_outlined, color: AppTheme.error, size: 18)),
                            const SizedBox(width: 12),
                            Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(r.description, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w500)),
                              Text('${r.category} · ${r.date.day}/${r.date.month}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                            ])),
                            Text('-₹${r.amount.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.error, fontWeight: FontWeight.bold, fontSize: 13)),
                            PopupMenuButton(color: AppTheme.surfaceAlt, icon: const Icon(Icons.more_vert, color: AppTheme.textSecondary, size: 18),
                              itemBuilder: (_) => [
                                const PopupMenuItem(value: 'edit', child: Text('Edit', style: TextStyle(color: AppTheme.textPrimary))),
                                const PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: AppTheme.error))),
                              ],
                              onSelected: (v) { if (v == 'edit') _showModal(r); else _delete(r.id); }),
                          ]),
                        );
                      },
                    ),
            ),
    );
  }
}

class _ExpenseModal extends StatefulWidget {
  final ExpenseModel? editing;
  final VoidCallback onSaved;
  const _ExpenseModal({this.editing, required this.onSaved});
  @override State<_ExpenseModal> createState() => _ExpenseModalState();
}

class _ExpenseModalState extends State<_ExpenseModal> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _desc;
  late final TextEditingController _amount;
  String _category = 'food';
  DateTime _date = DateTime.now();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _desc = TextEditingController(text: widget.editing?.description ?? '');
    _amount = TextEditingController(text: widget.editing?.amount.toString() ?? '');
    _category = widget.editing?.category ?? 'food';
    _date = widget.editing?.date ?? DateTime.now();
  }

  @override
  void dispose() { _desc.dispose(); _amount.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final data = { 'description': _desc.text, 'amount': _amount.text, 'category': _category, 'date': _date.toIso8601String().split('T')[0] };
    try {
      if (widget.editing != null) await api.put('/expenses/${widget.editing!.id}', data: data);
      else await api.post('/expenses', data: data);
      if (mounted) { Navigator.pop(context); widget.onSaved(); }
    } catch (_) { setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 20, right: 20, top: 20),
      child: Form(key: _formKey, child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text(widget.editing != null ? 'Edit Expense' : 'Add Expense', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        TextFormField(controller: _desc, decoration: const InputDecoration(labelText: 'Description'), validator: (v) => v!.isEmpty ? 'Required' : null),
        const SizedBox(height: 12),
        TextFormField(controller: _amount, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Amount (₹)'), validator: (v) => v!.isEmpty ? 'Required' : null),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          value: _category, dropdownColor: AppTheme.surfaceAlt, decoration: const InputDecoration(labelText: 'Category'),
          items: ['food','transport','utilities','entertainment','health','education','shopping','housing','insurance','other']
            .map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(color: AppTheme.textPrimary)))).toList(),
          onChanged: (v) => setState(() => _category = v!),
        ),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: _saving ? null : _save,
          child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: const Color(0xFFF5F2EB)))
            : Text(widget.editing != null ? 'Update' : 'Add Expense')),
        const SizedBox(height: 12),
      ])),
    );
  }
}
