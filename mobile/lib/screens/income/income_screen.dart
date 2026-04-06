import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';
import '../../models/models.dart';
import '../../widgets/widgets.dart';
import '../../utils/export_csv.dart';

class IncomeScreen extends StatefulWidget {
  const IncomeScreen({super.key});

  @override
  State<IncomeScreen> createState() => _IncomeScreenState();
}

class _IncomeScreenState extends State<IncomeScreen> {
  List<IncomeModel> _records = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await api.get('/income');
      final list = (res['data'] as List? ?? []).map((e) => IncomeModel.fromJson(e)).toList();
      setState(() { _records = list; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  void _showAddModal([IncomeModel? editing]) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _IncomeModal(editing: editing, onSaved: _load),
    );
  }

  Future<void> _delete(String id) async {
    final ok = await _confirmDelete(context);
    if (!ok) return;
    await api.delete('/income/$id');
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Income'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download_outlined),
            tooltip: 'Export CSV',
            onPressed: () => exportCsv(
              context: context,
              headers: ['Source', 'Amount', 'Category', 'Date', 'Notes'],
              keys: ['source', 'amount', 'category', 'date', 'notes'],
              rows: _records.map((r) => {
                'source': r.source, 'amount': r.amount,
                'category': r.category, 'date': '${r.date.year}-${r.date.month.toString().padLeft(2,'0')}-${r.date.day.toString().padLeft(2,'0')}', 'notes': r.notes,
              }).toList(),
              filename: 'income',
            ),
          ),
          IconButton(icon: const Icon(Icons.add), onPressed: () => _showAddModal()),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : RefreshIndicator(
              onRefresh: _load,
              color: AppTheme.primary,
              child: _records.isEmpty
                  ? const Center(child: Text('No income records yet.', style: TextStyle(color: AppTheme.textSecondary)))
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _records.length,
                      itemBuilder: (_, i) {
                        final r = _records[i];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                          decoration: BoxDecoration(
                            color: AppTheme.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppTheme.border),
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 36, height: 36,
                                decoration: BoxDecoration(color: AppTheme.success.withOpacity(0.15), borderRadius: BorderRadius.circular(10)),
                                child: const Icon(Icons.trending_up, color: AppTheme.success, size: 18),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                                  Text(r.source, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w500)),
                                  Text('${r.category} · ${r.date.day}/${r.date.month}/${r.date.year}', style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                                ]),
                              ),
                              Text('+₹${r.amount.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.success, fontWeight: FontWeight.bold, fontSize: 13)),
                              PopupMenuButton(
                                color: AppTheme.surfaceAlt,
                                icon: const Icon(Icons.more_vert, color: AppTheme.textSecondary, size: 18),
                                itemBuilder: (_) => [
                                  const PopupMenuItem(value: 'edit', child: Text('Edit', style: TextStyle(color: AppTheme.textPrimary))),
                                  const PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: AppTheme.error))),
                                ],
                                onSelected: (v) { if (v == 'edit') _showAddModal(r); else _delete(r.id); },
                              ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}

class _IncomeModal extends StatefulWidget {
  final IncomeModel? editing;
  final VoidCallback onSaved;
  const _IncomeModal({this.editing, required this.onSaved});

  @override
  State<_IncomeModal> createState() => _IncomeModalState();
}

class _IncomeModalState extends State<_IncomeModal> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _source;
  late final TextEditingController _amount;
  late final TextEditingController _notes;
  String _category = 'salary';
  DateTime _date = DateTime.now();
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _source = TextEditingController(text: widget.editing?.source ?? '');
    _amount = TextEditingController(text: widget.editing?.amount.toString() ?? '');
    _notes = TextEditingController(text: widget.editing?.notes ?? '');
    _category = widget.editing?.category ?? 'salary';
    _date = widget.editing?.date ?? DateTime.now();
  }

  @override
  void dispose() { _source.dispose(); _amount.dispose(); _notes.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final data = { 'source': _source.text, 'amount': _amount.text, 'category': _category, 'notes': _notes.text, 'date': _date.toIso8601String().split('T')[0] };
    try {
      if (widget.editing != null) { await api.put('/income/${widget.editing!.id}', data: data); }
      else { await api.post('/income', data: data); }
      if (mounted) { Navigator.pop(context); widget.onSaved(); }
    } catch (_) { setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 20, right: 20, top: 20),
      child: Form(
        key: _formKey,
        child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Text(widget.editing != null ? 'Edit Income' : 'Add Income', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          TextFormField(controller: _source, decoration: const InputDecoration(labelText: 'Source'), validator: (v) => v!.isEmpty ? 'Required' : null),
          const SizedBox(height: 12),
          TextFormField(controller: _amount, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Amount (₹)'), validator: (v) => v!.isEmpty ? 'Required' : null),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            value: _category,
            dropdownColor: AppTheme.surfaceAlt,
            decoration: const InputDecoration(labelText: 'Category'),
            items: ['salary','freelance','investment','business','rental','gift','other'].map((c) => DropdownMenuItem(value: c, child: Text(c, style: const TextStyle(color: AppTheme.textPrimary)))).toList(),
            onChanged: (v) => setState(() => _category = v!),
          ),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: _saving ? null : _save, child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : Text(widget.editing != null ? 'Update' : 'Add Income')),
          const SizedBox(height: 12),
        ]),
      ),
    );
  }
}

Future<bool> _confirmDelete(BuildContext context) async {
  return await showDialog<bool>(
    context: context,
    builder: (_) => AlertDialog(
      backgroundColor: AppTheme.surface,
      title: const Text('Delete', style: TextStyle(color: AppTheme.textPrimary)),
      content: const Text('Are you sure?', style: TextStyle(color: AppTheme.textSecondary)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
        TextButton(onPressed: () => Navigator.pop(context, true), child: const Text('Delete', style: TextStyle(color: AppTheme.error))),
      ],
    ),
  ) ?? false;
}
