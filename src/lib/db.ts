// Placeholder for Prisma client
// After running `npx prisma generate`, uncomment and use:

// import { PrismaClient } from "@prisma/client";
//
// const globalForPrisma = globalThis as unknown as {
//   prisma: PrismaClient | undefined;
// };
//
// export const prisma = globalForPrisma.prisma ?? new PrismaClient();
//
// if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Temporary in-memory store for development
const store = new Map<string, unknown>();

export const db = {
  async get<T>(key: string): Promise<T | null> {
    return (store.get(key) as T) ?? null;
  },
  async set(key: string, value: unknown): Promise<void> {
    store.set(key, value);
  },
  async delete(key: string): Promise<void> {
    store.delete(key);
  },
};
