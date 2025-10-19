import { Suspense } from "react";
import SignInClient from "./signin-client";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">로딩…</div>}>
      <SignInClient />
    </Suspense>
  );
}
