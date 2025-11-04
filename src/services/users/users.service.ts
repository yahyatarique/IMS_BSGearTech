import axiosInstance, { tokenUtils } from "../axiosInstance.service";
import { LoginInput, CreateUserInput, UpdateUserInput, RefreshTokenInput } from "../../schemas/user.schema";

export default class UsersService {
  // Get all users (admin only)
  static async getUsers() {
    try {
      const response = await axiosInstance.get("users");
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  // Get current user profile
  static async getCurrentUser() {
    try {
      const response = await axiosInstance.get("users/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(id: string) {
    try {
      const response = await axiosInstance.get(`users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      throw error;
    }
  }

  // Create new user (admin only)
  static async createUser(userData: CreateUserInput) {
    try {
      const response = await axiosInstance.post("users", userData);
      return response.data;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Update user
  static async updateUser(id: string, userData: UpdateUserInput) {
    try {
      const response = await axiosInstance.put(`users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // Delete user (admin only)
  static async deleteUser(id: string) {
    try {
      const response = await axiosInstance.delete(`users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  // Login user
  static async login(credentials: LoginInput) {
    try {
      const response = await axiosInstance.post("auth/login", credentials);
      const { user, accessToken, refreshToken } = response.data;

      // Store tokens
      tokenUtils.setTokens(accessToken, refreshToken);

      return { user, accessToken, refreshToken };
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  }

  // Logout user
  static async logout() {
    try {
      const refreshToken = tokenUtils.getRefreshToken();
      
      if (refreshToken) {
        // Call logout endpoint to invalidate refresh token
        await axiosInstance.post("auth/logout", { refreshToken });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear tokens regardless of API call success
      tokenUtils.clearTokens();
    }
  }

  // Refresh access token
  static async refreshToken(refreshTokenData: RefreshTokenInput) {
    try {
      const response = await axiosInstance.post("auth/refresh-token", refreshTokenData);
      const { accessToken, refreshToken } = response.data;

      // Update stored tokens
      tokenUtils.setTokens(accessToken, refreshToken || tokenUtils.getRefreshToken()!);

      return { accessToken, refreshToken };
    } catch (error) {
      console.error("Error refreshing token:", error);
      // Clear tokens if refresh fails
      tokenUtils.clearTokens();
      throw error;
    }
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    return !!tokenUtils.getAccessToken();
  }

  // Get user role from token (client-side only)
  static getUserRole(): string | null {
    const token = tokenUtils.getAccessToken();
    if (!token) return null;

    try {
      // Decode JWT payload (client-side only, not secure)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }

  // Get user ID from token (client-side only)
  static getUserId(): string | null {
    const token = tokenUtils.getAccessToken();
    if (!token) return null;

    try {
      // Decode JWT payload (client-side only, not secure)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub || null;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
}