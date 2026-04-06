import 'dart:io';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter/material.dart';

/// Converts a list of maps to CSV bytes and shares/saves the file.
/// [headers]  — display headers (same order as [keys])
/// [keys]     — map keys to extract from each row
/// [rows]     — list of data maps
/// [filename] — filename without .csv extension
Future<void> exportCsv({
  required BuildContext context,
  required List<String> headers,
  required List<String> keys,
  required List<Map<String, dynamic>> rows,
  required String filename,
}) async {
  String escape(dynamic v) {
    final s = v == null ? '' : '$v';
    if (s.contains(',') || s.contains('"') || s.contains('\n')) {
      return '"${s.replaceAll('"', '""')}"';
    }
    return s;
  }

  final lines = <String>[
    headers.map(escape).join(','),
    ...rows.map((r) => keys.map((k) => escape(r[k])).join(',')),
  ];
  final csv = lines.join('\n');

  try {
    final dir = await getTemporaryDirectory();
    final file = File('${dir.path}/$filename.csv');
    await file.writeAsString(csv);
    await Share.shareXFiles(
      [XFile(file.path, mimeType: 'text/csv')],
      subject: '$filename export',
    );
  } catch (e) {
    if (context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Export failed: $e')),
      );
    }
  }
}
