"use server";

import { revalidatePath } from "next/cache";
import { attendanceSchema } from "@/lib/attendance-schema";
import { getCurrentStudent } from "@/server/session";
import { setAttendance } from "@/server/services/attendance";

export async function setAttendanceAction(input: {
  date: string;
  mealType: string;
  status: string;
}): Promise<{ ok: boolean; message: string }> {
  const parsed = attendanceSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Invalid request." };

  // Outside try: a redirect to /login must not be swallowed by the catch below.
  const student = await getCurrentStudent();

  try {
    const { date, mealType, status } = parsed.data;
    const result = await setAttendance(student.id, date, mealType, status);
    if (!result.ok) return { ok: false, message: result.message };
  } catch (error) {
    console.error(error);
    return { ok: false, message: "Could not save. Please try again." };
  }

  revalidatePath("/student");
  revalidatePath("/admin");
  return { ok: true, message: "Saved." };
}
