const { z } = require("zod");

const username = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(50)
  .regex(/^[A-Za-z0-9_.-]+$/, "Username may only contain letters, numbers, dots, dashes and underscores");

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

const loginPassword = z.string().min(1).max(72);

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
};

const registerBody = z
  .object({
    role: z.enum(["buyer", "seller"]),
    username,
    password,
    email: z.string().trim().email().max(120),
    address: z.string().trim().max(255).optional(),
  })
  .strict();

const loginBody = z
  .object({
    role: z.enum(["buyer", "seller", "admin"]),
    username,
    password: loginPassword,
  })
  .strict();

const idParams = z.object({ id: z.string().uuid("Expected a UUID") });

const sellerParams = z.object({ sellerId: z.string().uuid("Expected a UUID") });

const itemListQuery = z
  .object({
    status: z.enum(["scheduled", "active", "closed"]).optional(),
    search: z.string().trim().min(1).max(100).optional(),
    ...pagination,
  })
  .strict();

const adminListQuery = z.object(pagination).strict();

const createItemBody = z
  .object({
    name: z.string().trim().min(3).max(120),
    description: z.string().trim().max(5000).optional(),
    startingPrice: z.coerce.number().positive().max(1000000),
    category: z.string().trim().max(60).optional(),
    imageUrl: z.string().url().max(500).optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date(),
  })
  .strict()
  .refine((value) => !value.startTime || value.endTime > value.startTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

const bidBody = z
  .object({
    amount: z.coerce.number().positive().max(1000000),
  })
  .strict();

module.exports = {
  registerBody,
  loginBody,
  idParams,
  sellerParams,
  itemListQuery,
  adminListQuery,
  createItemBody,
  bidBody,
};
