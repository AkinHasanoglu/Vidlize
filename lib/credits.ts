import { prisma } from "./prisma";
import { OutputType } from "@prisma/client";

export const CREDIT_COSTS: Record<OutputType, number> = {
  UGC_PHOTO: 1,
  UGC_VIDEO: 3,
  LIFESTYLE: 2,
};

export async function deductCredits(
  userId: string,
  amount: number
): Promise<void> {
  const result = await prisma.user.updateMany({
    where: { id: userId, credits: { gte: amount } },
    data: { credits: { decrement: amount } },
  });
  if (result.count === 0) {
    throw new Error("INSUFFICIENT_CREDITS");
  }
}

export async function refundCredits(
  userId: string,
  amount: number
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { credits: { increment: amount } },
  });
}

export async function getCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });
  return user?.credits ?? 0;
}
