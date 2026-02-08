const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export interface Prediction {
  label: string;
  score: number;
}

export interface ClassifyResponse {
  results: Prediction[];
}

export async function classifyImage(file: File): Promise<ClassifyResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/classify`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error(`Classification failed: ${res.status}`);
  }

  return res.json();
}
