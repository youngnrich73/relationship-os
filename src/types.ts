export type UUID = string;

export interface Person {
  id: UUID;
  label: string;
  // 필요한 필드 더 있으면 여기 확장
}

export interface Interaction {
  id: UUID;
  person_id: UUID;
  happened_at: string;        // ISO string
  kind: string;
  mood: string | null;
  note: string | null;
}

export interface Idea {
  id: UUID;
  person_id: UUID;
  title: string;
  note: string | null;
  created_at: string;         // ISO string
}
