'use client';

import { useCallback, useEffect, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { sb } from "@/lib/supabase-client";

type Person = {
  id: string;
  name: string;
  note: string | null;
  created_at: string;
};

type NewPerson = {
  owner: string;
  name: string;
  note: string | null;
};

export default function PeopleClient() {
  // sb()가 반환하는 클라이언트에 타입만 부여 (스키마 제너릭은 생략)
  const supabase = sb() as SupabaseClient;

  const [session, setSession] = useState<Session | null>(null); // ✅ any 제거
  const [loading, setLoading] = useState(true);

  const [list, setList] = useState<Person[]>([]);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  // 목록 불러오기
  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("people")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMsg("불러오기 오류: " + error.message);
    } else {
      setList((data ?? []) as Person[]);
    }
  }, [supabase]);

  // 세션 체크 후 목록 로드
  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setLoading(false);
      if (data.session) {
        await load();
      }
    })();
  }, [supabase, load]); // ✅ 의존성 정리

  // 추가
  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setMsg("추가 중…");

    const { data: userData } = await supabase.auth.getUser();
    const owner = userData.user?.id;
    if (!owner) {
      setMsg("로그인이 필요합니다.");
      return;
    }

    const row: NewPerson = { owner, name, note: note || null };
    const { error } = await supabase.from("people").insert(row);

    if (error) {
      setMsg("추가 오류: " + error.message);
    } else {
      setName("");
      setNote("");
      setMsg("추가 완료!");
      await load();
    }
  };

  // 삭제
  const remove = async (id: string) => {
    const ok = confirm("정말 삭제할까요?");
    if (!ok) return;

    const { error } = await supabase.from("people").delete().eq("id", id);
    if (error) {
      setMsg("삭제 오류: " + error.message);
    } else {
      setMsg("삭제 완료");
      setList((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // 매직 링크
  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = prompt("로그인할 이메일?");
    if (!email) return;
    setMsg("로그인 메일 전송 중…");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setMsg(error ? "오류: " + error.message : "메일함을 확인해 주세요!");
  };

  if (loading) return <div className="p-6 text-center">세션 확인 중…</div>;

  if (!session) {
    return (
      <div className="max-w-sm mx-auto p-6 space-y-4">
        <h2 className="text-xl font-bold">People</h2>
        <p className="text-sm">로그인이 필요합니다.</p>
        <button onClick={sendMagicLink} className="rounded bg-black text-white px-4 py-2">
          Sign in
        </button>
        {msg && <p className="text-sm">{msg}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-bold">People</h2>

      <form onSubmit={add} className="border rounded p-4 space-y-2">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className="flex-1 border rounded p-2"
            required
          />
          <button className="rounded bg-black text-white px-4">추가</button>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="메모(선택)"
          className="w-full border rounded p-2 min-h-20"
        />
      </form>

      <div className="space-y-2">
        {list.length === 0 && <p className="text-sm text-gray-600">아직 등록된 사람이 없어요.</p>}
        {list.map((p) => (
          <div key={p.id} className="border rounded p-3 flex justify-between items-center">
            <div>
              <div className="font-medium">{p.name}</div>
              {p.note && <div className="text-sm text-gray-600">{p.note}</div>}
            </div>
            <button onClick={() => remove(p.id)} className="text-sm underline">
              삭제
            </button>
          </div>
        ))}
      </div>

      {msg && <p className="text-sm">{msg}</p>}
    </div>
  );
}
