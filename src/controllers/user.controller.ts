import type { AppRouteHandler } from "../types.js";
import type {
  GetUsersRoute,
  GetMeRoute,
  UpdateProfileRoute,
  DeleteAccountRoute,
  GetUserArticlesRoute,
  GetProfileRoute,
} from "../routes/user.routes.js";
import { UserService } from "../services/user.service.js";
import { AuthService } from "../services/auth.service.js";
import { getAuthUser } from "../middlewares/auth.middleware.js";

export class UserController {
  static getUsers: AppRouteHandler<GetUsersRoute> = async (c) => {
    const { page, limit, search } = c.req.valid("query");
    const result = await UserService.getUsers({ page, limit, search });
    return c.json(
      {
        success: true,
        message: "Users retrieved successfully",
        ...result,
      },
      200
    );
  };

  static getMe: AppRouteHandler<GetMeRoute> = async (c) => {
    const user = getAuthUser(c);
    const result = await AuthService.getMe(user.id);
    return c.json(
      {
        success: true,
        message: "Current user account retrieved successfully",
        data: result,
      },
      200
    );
  };

  static getProfile: AppRouteHandler<GetProfileRoute> = async (c) => {
    const { username } = c.req.valid("param");
    const result = await UserService.getProfileByUsername(username);
    return c.json(
      {
        success: true,
        message: "User profile retrieved successfully",
        data: result,
      },
      200
    );
  };

  static updateProfile: AppRouteHandler<UpdateProfileRoute> = async (c) => {
    const user = getAuthUser(c);
    const body = c.req.valid("json");
    const result = await UserService.updateProfile(user.id, body);
    return c.json(
      {
        success: true,
        message: "Profile updated successfully",
        data: result,
      },
      200
    );
  };

  static deleteAccount: AppRouteHandler<DeleteAccountRoute> = async (c) => {
    const user = getAuthUser(c);
    const result = await UserService.deleteAccount(user.id);
    return c.json(result, 200);
  };

  static getUserArticles: AppRouteHandler<GetUserArticlesRoute> = async (c) => {
    const { username } = c.req.valid("param");
    const { page, limit } = c.req.valid("query");
    const result = await UserService.getUserArticles(username, { page, limit });
    return c.json(
      {
        success: true,
        message: `Articles by '${username}' retrieved successfully`,
        ...result,
      },
      200
    );
  };
}
