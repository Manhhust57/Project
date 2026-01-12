-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "expiresAt" SET DEFAULT now() + interval '15 minutes';
