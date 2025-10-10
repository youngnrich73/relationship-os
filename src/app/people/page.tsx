'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabase-client';

type Person = { id: string; label: string };

export default function PeoplePage(){
  const supabase = sb();
  const [email, setEmail] = useState('');
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState<Person[]>([]);
  const [label, setLabel] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(({data})=>{
      setAuthed(!!data.user);
    });
  }, []);

  async function signIn() {
    const { error } = await supabase.auth.signInWithOtp({ email });
    if(error) alert(error.message);
    else alert('이메일로 로그인 링크를 보냈어요!');
  }

  async function load() {
    const { data, error } = await supabase.from('people').select('id,label').order('created_at',{ascending:false});
    if(error) alert(error.message);
    else setList(data as Person[]);
  }

  async function add() {
    const { error } = await supabase.from('people').insert({ label });
    if(error) alert(error.message);
    else { setLabel(''); load(); }
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-xl font-semibold">사람 관리</h1>

      {!authed && (
        <div className="space-y-2">
          <input className="border p-2 w-full" placeholder="이메일 입력" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="border px-3 py-2" onClick={signIn}>이메일로 로그인</button>
          <p className="text-sm text-gray-500">Supabase의 이메일 OTP로 로그인합니다.</p>
        </div>
      )}

      <div className="flex gap-2">
        <input className="border p-2 flex-1" placeholder="이름/호칭" value={label} onChange={e=>setLabel(e.target.value)} />
        <button className="border px-3" onClick={add}>추가</button>
        <button className="border px-3" onClick={load}>새로고침</button>
      </div>

      <ul className="space-y-2">
        {list.map(p=>(
          <li key={p.id} className="border p-3 rounded">{p.label}</li>
        ))}
      </ul>
    </main>
  );
}
