import 'package:flutter/material.dart';
import '../../config/theme.dart';
import '../../services/api_service.dart';

class AiScreen extends StatefulWidget {
  const AiScreen({super.key});

  @override
  State<AiScreen> createState() => _AiScreenState();
}

class _AiScreenState extends State<AiScreen> {
  final List<_Msg> _messages = [];
  final TextEditingController _input = TextEditingController();
  final ScrollController _scroll = ScrollController();
  bool _loading = true;
  bool _sending = false;

  static const List<String> _suggested = [
    'How can I improve my savings rate?',
    'Am I spending too much?',
    'What investments suit me?',
  ];

  @override
  void initState() {
    super.initState();
    _loadHistory();
  }

  Future<void> _loadHistory() async {
    try {
      final res = await api.get('/ai/history');
      final history = (res['data'] as List? ?? []);
      for (final c in history) {
        _messages.add(_Msg(role: 'user', content: c['user_message'] ?? ''));
        _messages.add(_Msg(role: 'ai', content: c['ai_response'] ?? ''));
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _send([String? text]) async {
    final msg = text ?? _input.text.trim();
    if (msg.isEmpty || _sending) return;
    _input.clear();
    setState(() {
      _messages.add(_Msg(role: 'user', content: msg));
      _sending = true;
    });
    _scrollDown();
    try {
      final res = await api.post('/ai/advice', data: {'message': msg});
      final reply = res['data']['response'] ?? '';
      setState(() { _messages.add(_Msg(role: 'ai', content: reply)); _sending = false; });
    } catch (_) {
      setState(() {
        _messages.add(const _Msg(role: 'ai', content: 'Sorry, I encountered an error. Please try again.'));
        _sending = false;
      });
    }
    _scrollDown();
  }

  void _scrollDown() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) _scroll.animateTo(_scroll.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
    });
  }

  @override
  void dispose() { _input.dispose(); _scroll.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Row(children: [
          Container(width: 28, height: 28,
            decoration: BoxDecoration(gradient: AppTheme.primaryGradient, borderRadius: BorderRadius.zero),
            child: const Icon(Icons.auto_awesome, color: const Color(0xFFF5F2EB), size: 14)),
          const SizedBox(width: 10),
          const Text('AI Financial Advisor'),
        ]),
      ),
      body: Column(children: [
        Expanded(
          child: _loading ? const Center(child: CircularProgressIndicator(color: AppTheme.primary))
              : _messages.isEmpty
                  ? _EmptyState(onSuggest: _send)
                  : ListView.builder(
                      controller: _scroll,
                      padding: const EdgeInsets.all(16),
                      itemCount: _messages.length + (_sending ? 1 : 0),
                      itemBuilder: (_, i) {
                        if (i == _messages.length) return const _TypingIndicator();
                        return _BubbleWidget(msg: _messages[i]);
                      },
                    ),
        ),
        // Input
        Container(
          padding: EdgeInsets.only(left: 16, right: 8, bottom: MediaQuery.of(context).viewInsets.bottom + 12, top: 12),
          decoration: const BoxDecoration(color: AppTheme.surface, border: Border(top: BorderSide(color: AppTheme.border))),
          child: Row(children: [
            Expanded(
              child: TextField(
                controller: _input,
                onSubmitted: (_) => _send(),
                textInputAction: TextInputAction.send,
                style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Ask about your finances...',
                  hintStyle: const TextStyle(color: AppTheme.textSecondary, fontSize: 14),
                  filled: true, fillColor: AppTheme.surfaceAlt,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  border: OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide.none),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: BorderSide.none),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.zero, borderSide: const BorderSide(color: AppTheme.primary)),
                ),
              ),
            ),
            const SizedBox(width: 8),
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 44, height: 44,
              decoration: BoxDecoration(gradient: AppTheme.primaryGradient, borderRadius: BorderRadius.zero),
              child: IconButton(
                onPressed: _sending ? null : () => _send(),
                icon: const Icon(Icons.send_rounded, color: const Color(0xFFF5F2EB), size: 18),
              ),
            ),
          ]),
        ),
      ]),
    );
  }
}

class _Msg {
  final String role;
  final String content;
  const _Msg({required this.role, required this.content});
}

class _BubbleWidget extends StatelessWidget {
  final _Msg msg;
  const _BubbleWidget({required this.msg});

  @override
  Widget build(BuildContext context) {
    final isUser = msg.role == 'user';
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        children: [
          if (!isUser) ...[
            CircleAvatar(radius: 14, backgroundColor: AppTheme.secondary.withOpacity(0.3),
              child: const Icon(Icons.auto_awesome, color: AppTheme.secondary, size: 14)),
            const SizedBox(width: 8),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isUser ? AppTheme.primary : AppTheme.surface,
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: isUser ? const Radius.circular(16) : const Radius.circular(4),
                  bottomRight: isUser ? const Radius.circular(4) : const Radius.circular(16),
                ),
                border: Border.all(color: isUser ? Colors.transparent : AppTheme.border),
              ),
              child: Text(msg.content,
                style: TextStyle(color: isUser ? const Color(0xFFF5F2EB) : AppTheme.textPrimary, fontSize: 14, height: 1.4)),
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: 8),
            CircleAvatar(radius: 14, backgroundColor: AppTheme.primary.withOpacity(0.3),
              child: const Icon(Icons.person, color: AppTheme.primary, size: 14)),
          ],
        ],
      ),
    );
  }
}

class _TypingIndicator extends StatelessWidget {
  const _TypingIndicator();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        CircleAvatar(radius: 14, backgroundColor: AppTheme.secondary.withOpacity(0.3),
          child: const Icon(Icons.auto_awesome, color: AppTheme.secondary, size: 14)),
        const SizedBox(width: 8),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(color: AppTheme.surface, borderRadius: const BorderRadius.only(topLeft: Radius.circular(16), topRight: Radius.circular(16), bottomRight: Radius.circular(16), bottomLeft: Radius.circular(4)), border: Border.all(color: AppTheme.border)),
          child: Row(children: [
            _Dot(delay: 0), const SizedBox(width: 4),
            _Dot(delay: 200), const SizedBox(width: 4),
            _Dot(delay: 400),
          ]),
        ),
      ]),
    );
  }
}

class _Dot extends StatefulWidget {
  final int delay;
  const _Dot({required this.delay});
  @override State<_Dot> createState() => _DotState();
}

class _DotState extends State<_Dot> with SingleTickerProviderStateMixin {
  late AnimationController _c;
  late Animation<double> _a;

  @override
  void initState() {
    super.initState();
    _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _a = Tween(begin: 0.3, end: 1.0).animate(CurvedAnimation(parent: _c, curve: Curves.easeInOut));
    Future.delayed(Duration(milliseconds: widget.delay), () { if (mounted) _c.repeat(reverse: true); });
  }

  @override void dispose() { _c.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(opacity: _a, child: Container(width: 6, height: 6, decoration: const BoxDecoration(color: AppTheme.secondary, shape: BoxShape.circle)));
  }
}

class _EmptyState extends StatelessWidget {
  final void Function(String) onSuggest;
  const _EmptyState({required this.onSuggest});

  static const _suggestions = ['How can I improve my savings rate?', 'Am I spending too much?', 'What investments suit me?', 'How do I build an emergency fund?'];

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(width: 64, height: 64,
            decoration: BoxDecoration(gradient: AppTheme.primaryGradient, borderRadius: BorderRadius.zero),
            child: const Icon(Icons.auto_awesome, color: const Color(0xFFF5F2EB), size: 30)),
          const SizedBox(height: 16),
          const Text('AI Financial Advisor', style: TextStyle(color: AppTheme.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Ask anything about your finances', style: TextStyle(color: AppTheme.textSecondary), textAlign: TextAlign.center),
          const SizedBox(height: 24),
          Wrap(spacing: 8, runSpacing: 8,
            children: _suggestions.map((s) => GestureDetector(
              onTap: () => onSuggest(s),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.zero, border: Border.all(color: AppTheme.border)),
                child: Text(s, style: const TextStyle(color: AppTheme.textSecondary, fontSize: 12)),
              ),
            )).toList(),
          ),
        ]),
      ),
    );
  }
}
