import '../models/user_model.dart';
import 'api_service.dart';
import 'storage_service.dart';

class AuthService {
  Future<UserModel> login(String email, String password) async {
    final res = await api.post('/auth/login', data: {'email': email, 'password': password});
    final data = res['data'];
    await StorageService.saveTokens(data['accessToken'], data['refreshToken']);
    final user = UserModel.fromJson(data['user']);
    await StorageService.saveUser(data['user']);
    return user;
  }

  Future<UserModel> register(String name, String email, String password) async {
    final res = await api.post('/auth/register', data: {'name': name, 'email': email, 'password': password});
    final data = res['data'];
    await StorageService.saveTokens(data['accessToken'], data['refreshToken']);
    final user = UserModel.fromJson(data['user']);
    await StorageService.saveUser(data['user']);
    return user;
  }

  Future<UserModel?> getCurrentUser() async {
    try {
      final res = await api.get('/users/profile');
      final user = UserModel.fromJson(res['data']);
      await StorageService.saveUser(res['data']);
      return user;
    } catch (_) {
      return null;
    }
  }

  Future<void> logout() async {
    try {
      final refreshToken = await StorageService.getRefreshToken();
      if (refreshToken != null) {
        await api.post('/auth/logout', data: {'refreshToken': refreshToken});
      }
    } catch (_) {}
    await StorageService.clearAll();
  }
}

final authService = AuthService();
