// src/server/db/client.ts
import { PrismaClient } from "@prisma/client";
import { env } from "../../env/server.mjs";
import { queryHandler } from "prisma-query-inspector";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      // env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      [
        {
          emit: "event",
          level: "query",
        },
      ],
  });

prisma.$on("query", queryHandler);
if (env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
