'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabase-client';

type Person = { id:string; label:string };

export default function InteractionsPage(){
  const supabase = sb();
  const [people, setPeople] = useState<Person[]>([]);
  const [personId, setPersonId] = useState('');
  const [kind, setKind] = useState<'chat'|'call'|'meet'|'note'>('chat');
  const [mood, setMood] = useState(0);
  const [note, setNote] = useState('');

  useEffect(()=>{
    supabase.from('people').select('id,label').then(({data})=>{
      setPeople((data||[]) as Person[]);
      if(data && data[0]) setPersonId(data[0].id);
    });
  },[]);

  async function save(){
    const { error } = await supabase.from('interactions').insert({
      person_id: personId,
      user_id: (await supabase.auth.getUser()).data.user?.id, // RLS 위해
      happened_at: new Date().toISOString(),
      kind, mood, note
    });
    if(error) alert(error.message); else { setNote(''); alert('저장됨!'); }
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">빠른 기록</h1>
      <select className="border p-2 w-full" value={personId} onChange={e=>setPersonId(e.target.value)}>
        {people.map(p=><option key={p.id} value={p.id}>{p.label}</option>)}
      </select>
      <select className="border p-2 w-full" value={kind} onChange={e=>setKind(e.target.value as any)}>
        <option value="chat">채팅</option>
        <option value="call">통화</option>
        <option value="meet">만남</option>
        <option value="note">메모</option>
      </select>
      <input className="border p-2 w-full" type="number" min="-3" max="3" value={mood} onChange={e=>setMood(parseInt(e.target.value||'0'))} placeholder="기분(-3~+3)"/>
      <textarea className="border p-2 w-full" placeholder="메모 (선택)" value={note} onChange={e=>setNote(e.target.value)} />
      <button className="border px-3 py-2" onClick={save}>저장</button>
    </main>
  );
}
