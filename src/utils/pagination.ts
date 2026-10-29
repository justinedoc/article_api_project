import { z } from "@hono/zod-openapi";

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).openapi({
    description: "Page number (1-based)",
    example: 1,
  }),
  limit: z.coerce.number().int().min(1).max(50).default(10).openapi({
    description: "Number of items per page (max 50)",
    example: 10,
  }),
});

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

export const paginationMetaSchema = z.object({
  page: z.number().openapi({ example: 1 }),
  limit: z.number().openapi({ example: 10 }),
  total: z.number().openapi({ example: 42 }),
  totalPages: z.number().openapi({ example: 5 }),
});

export const paginatedResultSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: paginationMetaSchema,
  });
