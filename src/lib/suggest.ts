export function generateSuggestions(ctx:{
  person:{label:string};
  recencyDays:number; lastMood:number|null; routineDue:boolean;
}){
  const out: {title:string; body:string}[] = [];
  if(ctx.routineDue) out.push({
    title:'루틴 리마인드',
    body:`${ctx.person.label}님과 약속된 루틴이 지났어요. 이번 주에 15분 통화 어떨까요?`
  });
  if(ctx.recencyDays>21) out.push({
    title:'가벼운 터치',
    body:`최근 연락이 뜸했어요. 지난번 웃겼던 사진 1장을 보내보는 건 어때요?`
  });
  if((ctx.lastMood??0)<=-2) out.push({
    title:'회복의 첫걸음',
    body:`무거운 대화 대신, 공통 추억을 떠올릴 수 있는 짧은 안부로 시작해봐요.`
  });
  if(out.length===0) out.push({title:'오늘의 한 걸음', body:`오늘 하루 어땠는지 3줄로 나눠보세요 🙂`});
  return out;
}
