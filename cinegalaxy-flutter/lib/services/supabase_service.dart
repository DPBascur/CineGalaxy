import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/movie.dart';

class SupabaseService {
  static SupabaseClient get client => Supabase.instance.client;

  // --- AUTH ---
  static Future<AuthResponse> signIn(
      {required String email, required String password}) async {
    return client.auth.signInWithPassword(email: email, password: password);
  }

  static Future<void> signOut() => client.auth.signOut();

  static Session? get currentSession => client.auth.currentSession;
  static User? get currentUser => client.auth.currentUser;

  static Stream<AuthState> get authStream => client.auth.onAuthStateChange;

  static Future<UserResponse> updatePassword(String newPassword) =>
      client.auth.updateUser(UserAttributes(password: newPassword));

  // --- REVIEWS ---
  static Future<List<Review>> getReviews(String movieId) async {
    try {
      final data = await client
          .from('cinegalaxy_reviews')
          .select()
          .eq('movie_id', movieId)
          .order('created_at', ascending: false);
      return (data as List)
          .map((r) => Review.fromJson(r as Map<String, dynamic>))
          .toList();
    } catch (e) {
      return [];
    }
  }

  static Future<void> insertReview(Map<String, dynamic> reviewData) async {
    await client.from('cinegalaxy_reviews').insert([reviewData]);
  }
}
