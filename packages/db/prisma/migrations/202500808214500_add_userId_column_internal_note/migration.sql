ALTER TABLE "InternalNote" ADD COLUMN "userId" TEXT REFERENCES "User"("id");
