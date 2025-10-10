export function scoreInteractionAging(days: number, lambda = 0.08){
  return Math.exp(-lambda * days);
}
export function relationshipScore(props:{
  recencyDays:number; freq30:number; replyLatencyMin:number; moodAvg:number;
}){
  const { recencyDays, freq30, replyLatencyMin, moodAvg } = props;
  const R = scoreInteractionAging(recencyDays);
  const F = Math.tanh(freq30/10);
  const RL = 1/(1+Math.log(1+Math.max(replyLatencyMin,1)));
  const V = (moodAvg+3)/6; // -3..+3 → 0..1
  return Math.round((R*0.35 + F*0.3 + RL*0.15 + V*0.2)*100);
}
