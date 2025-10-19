import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function POST() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ ok: false }, { status: 401 });

  // 프로필 업서트
  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email ?? null,
  });
  return NextResponse.json({ ok: true });
}
