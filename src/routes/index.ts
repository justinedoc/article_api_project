import { OpenAPIHono } from "@hono/zod-openapi";
import { authRouter } from "./auth.routes.js";
import { userRouter } from "./user.routes.js";
import { articleRouter } from "./article.routes.js";
import { commentRouter } from "./comment.routes.js";

export const routes = new OpenAPIHono();

routes.route("/auth", authRouter);
routes.route("/users", userRouter);
routes.route("/articles", articleRouter);
routes.route("/", commentRouter);
