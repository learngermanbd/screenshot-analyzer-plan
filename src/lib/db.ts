import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

try {
  prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} catch {
  // Fallback for development without DATABASE_URL configured
  // The app will work with in-memory/API-only mode
  console.warn(
    "Prisma client could not be initialized. DATABASE_URL may not be set."
  );
  // Create a no-op proxy that returns null for all queries
  prisma = new Proxy({} as PrismaClient, {
    get: (_, prop) => {
      if (prop === "$connect") return () => Promise.resolve();
      if (prop === "$disconnect") return () => Promise.resolve();
      return () => {
        throw new Error(
          "Database not configured. Set DATABASE_URL in .env.local"
        );
      };
    },
  });
}

export { prisma };
