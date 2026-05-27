"use server";

import { db, user } from "@repo/db";
import { eq } from "drizzle-orm";

export async function checkEmailExistsAction(email: string) {
  const existingUser = await db.query.user.findFirst({
    where: eq(user.email, email),
  });

  return !!existingUser;
}
