import { PrismaClient, MealType, Role, AttendanceStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// Date-only value (UTC midnight) for @db.Date columns.
const now = new Date();
const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

async function main() {
  // Meal rules
  const settings: { mealType: MealType; startsAt: string; endsAt: string; cutoffMinutes: number }[] = [
    { mealType: "BREAKFAST", startsAt: "07:30", endsAt: "09:30", cutoffMinutes: 120 },
    { mealType: "LUNCH", startsAt: "12:30", endsAt: "14:30", cutoffMinutes: 90 },
    { mealType: "DINNER", startsAt: "19:30", endsAt: "21:30", cutoffMinutes: 90 },
  ];
  for (const s of settings) {
    await prisma.mealSetting.upsert({ where: { mealType: s.mealType }, update: s, create: s });
  }

  // Users (demo only, change before any real use)
  const passwordHash = await hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mess.local" },
    update: {},
    create: { name: "Mess Admin", email: "admin@mess.local", passwordHash, role: Role.ADMIN },
  });

  const students = [];
  for (const [i, name] of ["Ali", "Sara", "Ahmed", "Hina"].entries()) {
    const email = `${name.toLowerCase()}@mess.local`;
    students.push(
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: { name, email, passwordHash, role: Role.STUDENT, roomNo: `B-10${i + 1}` },
      }),
    );
  }

  // Today's menu
  const menu: { mealType: MealType; items: string[] }[] = [
    { mealType: "BREAKFAST", items: ["Paratha", "Omelette", "Tea"] },
    { mealType: "LUNCH", items: ["Chicken Karahi", "Rice", "Salad", "Raita"] },
    { mealType: "DINNER", items: ["Daal Fry", "Roti", "Kheer"] },
  ];
  for (const m of menu) {
    await prisma.dailyMenu.upsert({
      where: { date_mealType: { date: today, mealType: m.mealType } },
      update: { items: m.items },
      create: { date: today, mealType: m.mealType, items: m.items, createdById: admin.id },
    });
  }

  // Sample attendance for today's lunch
  for (const [i, s] of students.entries()) {
    await prisma.mealAttendance.upsert({
      where: { userId_date_mealType: { userId: s.id, date: today, mealType: "LUNCH" } },
      update: {},
      create: {
        userId: s.id,
        date: today,
        mealType: "LUNCH",
        status: i % 2 === 0 ? AttendanceStatus.GOING : AttendanceStatus.SKIPPING,
      },
    });
  }

  console.log("Seeded: 1 admin, 4 students, 3 meal settings, today's menu, sample attendance.");
  console.log("Login with any seeded email, password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
