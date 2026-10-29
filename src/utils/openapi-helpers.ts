import { z } from "@hono/zod-openapi";

export const jsonContent = <T extends z.ZodType>(schema: T, description: string) => ({
  content: {
    "application/json": {
      schema,
    },
  },
  description,
});

export const jsonContentRequired = <T extends z.ZodType>(schema: T, description: string) => ({
  content: {
    "application/json": {
      schema,
    },
  },
  required: true,
  description,
});

export const messageSchema = (message = "Operation successful", success = true) =>
  z.object({
    success: z.boolean().openapi({ example: success }),
    message: z.string().openapi({ example: message }),
  });

export const errorSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  message: z.string().openapi({ example: "An error occurred" }),
  stack: z.string().optional(),
});

export const defaultErrorResponses = {
  400: jsonContent(errorSchema, "Bad Request"),
  401: jsonContent(errorSchema, "Unauthorized"),
  403: jsonContent(errorSchema, "Forbidden"),
  404: jsonContent(errorSchema, "Not Found"),
  422: jsonContent(errorSchema, "Validation Error"),
  500: jsonContent(errorSchema, "Internal Server Error"),
};
