import { NextResponse } from "next/server";

import { getAppDataset } from "@/lib/server-data";
import { getSessionUser, unauthorizedResponse } from "@/lib/server-auth";

export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const data = await getAppDataset(user.id);
  return NextResponse.json(data);
}
