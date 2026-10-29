import type { Context } from "hono";
import { AuthService } from "../services/auth.service.js";
import type { AuthUser } from "../types.js";

export class AuthController {
  static async register(c: Context) {
    const body = await c.req.json();
    const result = await AuthService.register(body);
    return c.json(
      {
        success: true,
        message: "Account registered successfully",
        data: result,
      },
      201
    );
  }

  static async login(c: Context) {
    const body = await c.req.json();
    const result = await AuthService.login(body);
    return c.json(
      {
        success: true,
        message: "Logged in successfully",
        data: result,
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
        message: "Profile retrieved successfully",
        data: result,
      },
      200
    );
  }

  static async changePassword(c: Context) {
    const user = c.get("user") as AuthUser;
    const body = await c.req.json();
    const result = await AuthService.changePassword(user.id, body);
    return c.json(result, 200);
  }
}
