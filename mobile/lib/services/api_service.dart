import 'dart:convert';
import 'package:dio/dio.dart';
import '../config/constants.dart';
import 'storage_service.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();

  late final Dio _dio;
  bool _isRefreshing = false;

  void init() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConstants.baseUrl,
      connectTimeout: AppConstants.connectTimeout,
      receiveTimeout: AppConstants.receiveTimeout,
      headers: {'Content-Type': 'application/json'},
    ));

    // Request interceptor: attach Bearer token
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await StorageService.getAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        // Auto-refresh on TOKEN_EXPIRED
        if (error.response?.statusCode == 401 && !_isRefreshing) {
          final data = error.response?.data;
          if (data is Map && data['code'] == 'TOKEN_EXPIRED') {
            _isRefreshing = true;
            try {
              final refreshToken = await StorageService.getRefreshToken();
              if (refreshToken != null) {
                final res = await _dio.post('/auth/refresh', data: {'refreshToken': refreshToken});
                final newToken = res.data['data']['accessToken'];
                final newRefresh = res.data['data']['refreshToken'];
                await StorageService.saveTokens(newToken, newRefresh);
                // Retry original request
                error.requestOptions.headers['Authorization'] = 'Bearer $newToken';
                final retryRes = await _dio.fetch(error.requestOptions);
                _isRefreshing = false;
                return handler.resolve(retryRes);
              }
            } catch (_) {
              await StorageService.clearAll();
            }
            _isRefreshing = false;
          }
        }
        return handler.next(error);
      },
    ));
  }

  // Generic methods
  Future<dynamic> get(String path, {Map<String, dynamic>? params}) async {
    final res = await _dio.get(path, queryParameters: params);
    return res.data;
  }

  Future<dynamic> post(String path, {dynamic data}) async {
    final res = await _dio.post(path, data: data);
    return res.data;
  }

  Future<dynamic> put(String path, {dynamic data}) async {
    final res = await _dio.put(path, data: data);
    return res.data;
  }

  Future<dynamic> delete(String path) async {
    final res = await _dio.delete(path);
    return res.data;
  }
}

final api = ApiService();
