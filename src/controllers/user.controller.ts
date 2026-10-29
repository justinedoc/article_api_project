import type { Context } from "hono";
import { UserService } from "../services/user.service.js";
import type { AuthUser } from "../types.js";

export class UserController {
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
}
