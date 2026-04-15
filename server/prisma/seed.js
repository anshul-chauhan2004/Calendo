import { neonConfig } from "@neondatabase/serverless";
import prismaPkg from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { addDays, addMinutes, subDays } from "date-fns";
import { fromZonedTime } from "date-fns-tz";
import WebSocket from "ws";

const { PrismaClient, BookingStatus } = prismaPkg;

neonConfig.webSocketConstructor = WebSocket;

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const timezone = "Asia/Kolkata";
const defaultUserEmail = process.env.DEFAULT_USER_EMAIL || "anch51004@gmail.com";
const defaultUserName = "Anshul Chauhan";

function buildUtcMeeting(baseDate, hour, minute, durationMinutes) {
  const localDate = new Date(baseDate);
  localDate.setHours(hour, minute, 0, 0);

  const startTimeUtc = fromZonedTime(localDate, timezone);
  const endTimeUtc = addMinutes(startTimeUtc, durationMinutes);

  return { startTimeUtc, endTimeUtc };
}

async function main() {
  const defaultUser = await prisma.user.upsert({
    where: { email: defaultUserEmail },
    update: {
      name: defaultUserName,
      timezone,
    },
    create: {
      name: defaultUserName,
      email: defaultUserEmail,
      timezone,
    },
  });

  await prisma.availabilityRule.deleteMany({
    where: { userId: defaultUser.id },
  });

  await prisma.availabilityRule.createMany({
    data: [
      { userId: defaultUser.id, dayOfWeek: 1, startTime: "09:00", endTime: "17:00" },
      { userId: defaultUser.id, dayOfWeek: 2, startTime: "09:00", endTime: "17:00" },
      { userId: defaultUser.id, dayOfWeek: 3, startTime: "09:00", endTime: "17:00" },
      { userId: defaultUser.id, dayOfWeek: 4, startTime: "09:00", endTime: "17:00" },
      { userId: defaultUser.id, dayOfWeek: 5, startTime: "09:00", endTime: "17:00" }
    ],
  });

  const eventTypes = await Promise.all([
    prisma.eventType.upsert({
      where: { slug: "30-minute-meeting" },
      update: {
        userId: defaultUser.id,
        name: "30 Minute Meeting",
        description: "A focused half-hour sync to discuss availability, goals, or project details.",
        durationMinutes: 30,
        isActive: true,
      },
      create: {
        userId: defaultUser.id,
        name: "30 Minute Meeting",
        slug: "30-minute-meeting",
        description: "A focused half-hour sync to discuss availability, goals, or project details.",
        durationMinutes: 30,
      },
    }),
    prisma.eventType.upsert({
      where: { slug: "60-minute-interview" },
      update: {
        userId: defaultUser.id,
        name: "60 Minute Interview",
        description: "A longer conversation for hiring, technical deep-dives, or pair problem solving.",
        durationMinutes: 60,
        isActive: true,
      },
      create: {
        userId: defaultUser.id,
        name: "60 Minute Interview",
        slug: "60-minute-interview",
        description: "A longer conversation for hiring, technical deep-dives, or pair problem solving.",
        durationMinutes: 60,
      },
    }),
    prisma.eventType.upsert({
      where: { slug: "quick-intro-call" },
      update: {
        userId: defaultUser.id,
        name: "Quick Intro Call",
        description: "A short introductory call to align on context before a detailed discussion.",
        durationMinutes: 15,
        isActive: true,
      },
      create: {
        userId: defaultUser.id,
        name: "Quick Intro Call",
        slug: "quick-intro-call",
        description: "A short introductory call to align on context before a detailed discussion.",
        durationMinutes: 15,
      },
    }),
  ]);

  const [thirtyMinuteMeeting, sixtyMinuteInterview, quickIntroCall] = eventTypes;

  await prisma.booking.deleteMany({
    where: { hostUserId: defaultUser.id },
  });

  const upcomingMeeting = buildUtcMeeting(addDays(new Date(), 2), 10, 0, 30);
  const secondUpcomingMeeting = buildUtcMeeting(addDays(new Date(), 3), 14, 0, 60);
  const pastMeeting = buildUtcMeeting(subDays(new Date(), 2), 11, 0, 30);
  const cancelledMeeting = buildUtcMeeting(addDays(new Date(), 4), 16, 0, 15);

  await prisma.booking.createMany({
    data: [
      {
        eventTypeId: thirtyMinuteMeeting.id,
        hostUserId: defaultUser.id,
        inviteeName: "Rahul Verma",
        inviteeEmail: "rahul@example.com",
        ...upcomingMeeting,
        status: BookingStatus.SCHEDULED,
      },
      {
        eventTypeId: sixtyMinuteInterview.id,
        hostUserId: defaultUser.id,
        inviteeName: "Neha Sharma",
        inviteeEmail: "neha@example.com",
        ...secondUpcomingMeeting,
        status: BookingStatus.SCHEDULED,
      },
      {
        eventTypeId: thirtyMinuteMeeting.id,
        hostUserId: defaultUser.id,
        inviteeName: "Isha Jain",
        inviteeEmail: "isha@example.com",
        ...pastMeeting,
        status: BookingStatus.SCHEDULED,
      },
      {
        eventTypeId: quickIntroCall.id,
        hostUserId: defaultUser.id,
        inviteeName: "Arjun Mehta",
        inviteeEmail: "arjun@example.com",
        ...cancelledMeeting,
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
      }
    ],
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
