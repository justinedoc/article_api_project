import type { Context } from "hono";
import { UserService } from "../services/user.service.js";
import { AuthService } from "../services/auth.service.js";
import type { AuthUser } from "../types.js";

export class UserController {
  static async getUsers(c: Context) {
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;
    const search = c.req.query("search");

    const result = await UserService.getUsers({ page, limit, search });
    return c.json(
      {
        success: true,
        message: "Users retrieved successfully",
        ...result,
      },
      200
    );
  }

  static async getMe(c: Context) {
    const user = c.get("user") as AuthUser;
    const result = await AuthService.getMe(user.id);
    return c.json(
      {
        success: true,
        message: "Current user account retrieved successfully",
        data: result,
      },
      200
    );
  }

  static async getProfile(c: Context) {
    const username = c.req.param("username")!;
    const result = await UserService.getProfileByUsername(username);
    return c.json(
      {
        success: true,
        message: "User profile retrieved successfully",
        data: result,
      },
      200
    );
  }

  static async updateProfile(c: Context) {
    const user = c.get("user") as AuthUser;
    const body = await c.req.json();
    const result = await UserService.updateProfile(user.id, body);
    return c.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: result,
      },
      200
    );
  }

  static async deleteAccount(c: Context) {
    const user = c.get("user") as AuthUser;
    const result = await UserService.deleteAccount(user.id);
    return c.json(result, 200);
  }

  static async getUserArticles(c: Context) {
    const username = c.req.param("username")!;
    const page = Number(c.req.query("page")) || 1;
    const limit = Number(c.req.query("limit")) || 10;

    const result = await UserService.getUserArticles(username, { page, limit });
    return c.json(
      {
        success: true,
        message: `Articles by '${username}' retrieved successfully`,
        ...result,
      },
      200
    );
  }
}
