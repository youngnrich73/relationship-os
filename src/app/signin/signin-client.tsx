"use client";

import { useState } from "react";
import { sb } from "@/lib/supabase-client";

export default function SignInClient() {
  const supabase = sb();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg("로그인 메일 전송 중…");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // 메일 링크 클릭 후 돌아올 주소: 홈(/)
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    setLoading(false);
    if (error) setMsg("오류: " + error.message);
    else setMsg("메일함을 확인해 주세요!");
  };

  return (
    <div className="max-w-sm mx-auto p-6 space-y-4">
      <h1 className="text-xl font-bold text-center">Sign in</h1>
      <form onSubmit={sendMagicLink} className="space-y-3">
        <input
          type="email"
          required
          placeholder="이메일 주소"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black text-white py-2 disabled:opacity-50"
        >
          {loading ? "전송 중…" : "로그인 링크 보내기"}
        </button>
      </form>
      {msg && <p className="text-sm text-center">{msg}</p>}
    </div>
  );
}
