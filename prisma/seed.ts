import { PrismaClient, Role, AttendanceStatus, type MealType } from "@prisma/client";
import { hash } from "bcryptjs";
import { addDaysIso, isoToDate, todayIso } from "../src/lib/date";

const prisma = new PrismaClient();
const MEALS: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];
const round1 = (n: number) => Math.round(n * 10) / 10;

async function main() {
  const today = todayIso();

  // Meal rules
  const settings = [
    { mealType: "BREAKFAST" as const, startsAt: "07:30", endsAt: "09:30", cutoffMinutes: 120 },
    { mealType: "LUNCH" as const, startsAt: "12:30", endsAt: "14:30", cutoffMinutes: 90 },
    { mealType: "DINNER" as const, startsAt: "19:30", endsAt: "21:30", cutoffMinutes: 90 },
  ];
  for (const s of settings) {
    await prisma.mealSetting.upsert({ where: { mealType: s.mealType }, update: s, create: s });
  }

  // Users (demo only: change before any real use)
  const passwordHash = await hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mess.local" },
    update: {},
    create: { name: "Mess Admin", email: "admin@mess.local", passwordHash, role: Role.ADMIN },
  });

  const named = ["Ali", "Sara", "Ahmed", "Hina"];
  const students = [];
  for (let i = 0; i < 40; i++) {
    const name = named[i] ?? `Student ${String(i + 1).padStart(2, "0")}`;
    const email = i < named.length ? `${name.toLowerCase()}@mess.local` : `student${String(i + 1).padStart(2, "0")}@mess.local`;
    students.push(
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: { name, email, passwordHash, role: Role.STUDENT, roomNo: `B-${100 + i}` },
      }),
    );
  }

  // Menus for today and tomorrow
  const menus: Record<string, Record<MealType, string[]>> = {
    [today]: {
      BREAKFAST: ["Paratha", "Omelette", "Tea"],
      LUNCH: ["Chicken Karahi", "Rice", "Salad", "Raita"],
      DINNER: ["Daal Fry", "Roti", "Kheer"],
    },
    [addDaysIso(today, 1)]: {
      BREAKFAST: ["Halwa Puri", "Chana", "Chai"],
      LUNCH: ["Aloo Gosht", "Rice", "Kachumber"],
      DINNER: ["Biryani", "Raita", "Salad"],
    },
  };
  for (const [iso, byMeal] of Object.entries(menus)) {
    for (const meal of MEALS) {
      await prisma.dailyMenu.upsert({
        where: { date_mealType: { date: isoToDate(iso), mealType: meal } },
        update: { items: byMeal[meal] },
        create: { date: isoToDate(iso), mealType: meal, items: byMeal[meal], createdById: admin.id },
      });
    }
  }

  // Today's attendance: ~60% going, ~20% skipping, rest haven't responded yet
  for (const [si, student] of students.entries()) {
    for (const [mi, meal] of MEALS.entries()) {
      const roll = (si * 7 + mi * 13) % 10;
      if (roll >= 8) continue; // pending
      const status = roll < 6 ? AttendanceStatus.GOING : AttendanceStatus.SKIPPING;
      await prisma.mealAttendance.upsert({
        where: { userId_date_mealType: { userId: student.id, date: isoToDate(today), mealType: meal } },
        update: { status },
        create: { userId: student.id, date: isoToDate(today), mealType: meal, status },
      });
    }
  }

  // 14 days of waste history that slowly improves, so the charts have something to show
  const base: Record<MealType, number> = { BREAKFAST: 6, LUNCH: 11, DINNER: 9 };
  for (let back = 14; back >= 1; back--) {
    const iso = addDaysIso(today, -back);
    const progress = (14 - back) / 14; // 0 → 1
    for (const [k, meal] of MEALS.entries()) {
      const wave = 1 + 0.25 * Math.sin(back * 1.7 + k);
      const wasteKg = round1(base[meal] * (1 - 0.3 * progress) * wave);
      const preparedKg = round1(wasteKg * (5 + Math.abs(Math.sin(back + k)) * 4));
      await prisma.wasteLog.upsert({
        where: { date_mealType: { date: isoToDate(iso), mealType: meal } },
        update: { wasteKg, preparedKg },
        create: { date: isoToDate(iso), mealType: meal, wasteKg, preparedKg, loggedById: admin.id },
      });
    }
  }

  console.log(`Seeded for ${today}: 1 admin, 40 students, meal settings, menus (today + tomorrow), attendance, 14 days of waste logs.`);
  console.log("Login with admin@mess.local or ali@mess.local, password: password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
