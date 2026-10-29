import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { profiles } from "../db/schema/index.js";
import { ApiError } from "../utils/api-error.js";

export class UserService {
  static async getProfileByUsername(username: string) {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username))
      .limit(1);

    if (!profile) {
      throw ApiError.notFound(`User profile with username '${username}' not found`);
    }

    return profile;
  }

  static async updateProfile(
    userId: number,
    data: {
      displayName?: string;
      bio?: string;
      image?: string;
      username?: string;
    }
  ) {
    const [existing] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!existing) {
      throw ApiError.notFound("Profile not found");
    }

    if (data.username && data.username !== existing.username) {
      const [usernameExists] = await db
        .select({ id: profiles.id })
        .from(profiles)
        .where(eq(profiles.username, data.username))
        .limit(1);

      if (usernameExists) {
        throw ApiError.conflict("Username already in use");
      }
    }

    const [updated] = await db
      .update(profiles)
      .set({
        ...(data.displayName !== undefined && { displayName: data.displayName }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.image !== undefined && { image: data.image }),
        ...(data.username !== undefined && { username: data.username }),
      })
      .where(eq(profiles.userId, userId))
      .returning();

    return updated;
  }
}
