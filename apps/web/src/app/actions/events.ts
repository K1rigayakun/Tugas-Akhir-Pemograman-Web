"use server";

import { prisma } from "@emerald-kingdom/db";

export async function getActiveEventAction() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return null;
  }

  try {
    const now = new Date();
    const event = await prisma.event.findFirst({
      where: { 
        isActive: true, 
        startTime: { lte: now }, 
        endTime: { gte: now } 
      },
    });
    
    return event;
  } catch (error) {
    console.error("Failed to get active event:", error);
    return null;
  }
}
