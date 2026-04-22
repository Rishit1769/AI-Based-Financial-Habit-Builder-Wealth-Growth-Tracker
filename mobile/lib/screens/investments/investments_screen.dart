import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';
import '../../models/models.dart';

class InvestmentsScreen extends StatefulWidget {
  const InvestmentsScreen({super.key});

  @override
  State<InvestmentsScreen> createState() => _InvestmentsScreenState();
}

class _InvestmentsScreenState extends State<InvestmentsScreen> {
  List<InvestmentModel> _records = [];
  bool _loading = true;

  @override void initState() { super.initState(); _load(); }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await api.get('/investments');
      final list = (res['data'] as List? ?? []).map((e) => InvestmentModel.fromJson(e)).toList();
      setState(() { _records = list; _loading = false; });
    } catch (_) { setState(() => _loading = false); }
  }

  void _showModal([InvestmentModel? editing]) {
    showModalBottomSheet(
      context: context, isScrollControlled: true, backgroundColor: AppTheme.surface,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => _InvestmentModal(editing: editing, onSaved: _load),
    );
  }

  @override
  Widget build(BuildContext context) {
    final totalInvested = _records.fold(0.0, (s, r) => s + r.amountInvested);
    final totalCurrent = _records.fold(0.0, (s, r) => s + r.currentValue);
    final totalGain = totalCurrent - totalInvested;

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(title: const Text('Investments'), actions: [IconButton(icon: const Icon(Icons.add), onPressed: () => _showModal())]),
      body: _loading ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
          : RefreshIndicator(
              onRefresh: _load, color: AppTheme.primary,
              child: ListView(padding: const EdgeInsets.all(16), children: [
                // Summary
                Row(children: [
                  Expanded(child: _SummaryCard(label: 'Invested', value: '₹${totalInvested.toStringAsFixed(0)}', color: AppTheme.primary)),
                  const SizedBox(width: 10),
                  Expanded(child: _SummaryCard(label: 'Current', value: '₹${totalCurrent.toStringAsFixed(0)}', color: AppTheme.secondary)),
                  const SizedBox(width: 10),
                  Expanded(child: _SummaryCard(
                    label: 'Gain/Loss',
                    value: '${totalGain >= 0 ? '+' : ''}₹${totalGain.toStringAsFixed(0)}',
                    color: totalGain >= 0 ? AppTheme.success : AppTheme.error,
                  )),
                ]),
                const SizedBox(height: 16),

                // Pie chart by type
                if (_records.length > 1) ...[
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.zero, border: Border.all(color: AppTheme.border)),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      const Text('Portfolio Allocation', style: TextStyle(color: AppTheme.textPrimary, fontSize: 14, fontWeight: FontWeight.w600)),
                      const SizedBox(height: 12),
                      SizedBox(
                        height: 160,
                        child: PieChart(PieChartData(
                          sections: _records.map((r) => PieChartSectionData(
                            value: r.currentValue, color: _typeColor(r.type),
                            title: r.type, titleStyle: const TextStyle(color: const Color(0xFFF5F2EB), fontSize: 10, fontWeight: FontWeight.bold),
                            radius: 60,
                          )).toList(),
                          sectionsSpace: 2,
                          centerSpaceRadius: 40,
                        )),
                      ),
                    ]),
                  ),
                  const SizedBox(height: 16),
                ],

                if (_records.isEmpty) const Center(child: Text('No investments yet.', style: TextStyle(color: AppTheme.textSecondary)))
                else ..._records.map((r) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.zero, border: Border.all(color: AppTheme.border)),
                    child: Row(children: [
                      Container(width: 36, height: 36,
                        decoration: BoxDecoration(color: _typeColor(r.type).withOpacity(0.15), borderRadius: BorderRadius.zero),
                        child: Icon(Icons.pie_chart_rounded, color: _typeColor(r.type), size: 18)),
                      const SizedBox(width: 12),
                      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                        Text(r.name, style: const TextStyle(color: AppTheme.textPrimary, fontSize: 13, fontWeight: FontWeight.w500)),
                        Text(r.type, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 11)),
                      ])),
                      Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                        Text('₹${r.currentValue.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.textPrimary, fontWeight: FontWeight.bold, fontSize: 13)),
                        Text('${r.gain >= 0 ? '+' : ''}₹${r.gain.toStringAsFixed(0)} (${r.gainPercent.toStringAsFixed(1)}%)',
                          style: TextStyle(color: r.gain >= 0 ? AppTheme.success : AppTheme.error, fontSize: 11)),
                      ]),
                      PopupMenuButton(color: AppTheme.surfaceAlt, icon: const Icon(Icons.more_vert, color: AppTheme.textSecondary, size: 18),
                        itemBuilder: (_) => [
                          const PopupMenuItem(value: 'edit', child: Text('Edit', style: TextStyle(color: AppTheme.textPrimary))),
                          const PopupMenuItem(value: 'delete', child: Text('Delete', style: TextStyle(color: AppTheme.error))),
                        ],
                        onSelected: (v) async {
                          if (v == 'edit') _showModal(r);
                          else { await api.delete('/investments/${r.id}'); _load(); }
                        }),
                    ]),
                  );
                }),
              ]),
            ),
    );
  }

  Color _typeColor(String type) {
    const map = {
      'stocks': Color(0xFF6366F1), 'mutual_funds': Color(0xFF8B5CF6),
      'crypto': Color(0xFFF59E0B), 'real_estate': Color(0xFF10B981),
      'gold': Color(0xFFD97706), 'fixed_deposit': Color(0xFF3B82F6),
      'bonds': Color(0xFF06B6D4), 'other': Color(0xFF64748B),
    };
    return map[type] ?? const Color(0xFF64748B);
  }
}

class _SummaryCard extends StatelessWidget {
  final String label;
  final String value;
  final Color color;
  const _SummaryCard({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.zero, border: Border.all(color: AppTheme.border)),
      child: Column(children: [
        Text(value, style: TextStyle(color: color, fontSize: 13, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 10)),
      ]),
    );
  }
}

class _InvestmentModal extends StatefulWidget {
  final InvestmentModel? editing;
  final VoidCallback onSaved;
  const _InvestmentModal({this.editing, required this.onSaved});
  @override State<_InvestmentModal> createState() => _InvestmentModalState();
}

class _InvestmentModalState extends State<_InvestmentModal> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _invested;
  late final TextEditingController _current;
  String _type = 'stocks';
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.editing?.name ?? '');
    _invested = TextEditingController(text: widget.editing?.amountInvested.toString() ?? '');
    _current = TextEditingController(text: widget.editing?.currentValue.toString() ?? '');
    _type = widget.editing?.type ?? 'stocks';
  }

  @override void dispose() { _name.dispose(); _invested.dispose(); _current.dispose(); super.dispose(); }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    final data = { 'name': _name.text, 'type': _type, 'amount_invested': _invested.text, 'current_value': _current.text };
    try {
      if (widget.editing != null) await api.put('/investments/${widget.editing!.id}', data: data);
      else await api.post('/investments', data: data);
      if (mounted) { Navigator.pop(context); widget.onSaved(); }
    } catch (_) { setState(() => _saving = false); }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).viewInsets.bottom, left: 20, right: 20, top: 20),
      child: Form(key: _formKey, child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text(widget.editing != null ? 'Edit Investment' : 'Add Investment', style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'Name'), validator: (v) => v!.isEmpty ? 'Required' : null),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          value: _type, dropdownColor: AppTheme.surfaceAlt, decoration: const InputDecoration(labelText: 'Type'),
          items: ['stocks','mutual_funds','crypto','real_estate','gold','fixed_deposit','bonds','other']
            .map((t) => DropdownMenuItem(value: t, child: Text(t, style: const TextStyle(color: AppTheme.textPrimary)))).toList(),
          onChanged: (v) => setState(() => _type = v!),
        ),
        const SizedBox(height: 12),
        Row(children: [
          Expanded(child: TextFormField(controller: _invested, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Invested (₹)'), validator: (v) => v!.isEmpty ? 'Required' : null)),
          const SizedBox(width: 10),
          Expanded(child: TextFormField(controller: _current, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Current (₹)'), validator: (v) => v!.isEmpty ? 'Required' : null)),
        ]),
        const SizedBox(height: 16),
        ElevatedButton(onPressed: _saving ? null : _save,
          child: _saving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: const Color(0xFFF5F2EB)))
            : Text(widget.editing != null ? 'Update' : 'Add')),
        const SizedBox(height: 12),
      ])),
    );
  }
}
