export async function askAI({ messages, subject = "", context = "" }) {
  const response = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, subject, context })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro ao consultar a IA.");
  return data;
}

export async function generateQuestions({
  subject,
  topic,
  banca,
  quantity,
  difficulty,
  excludedIds = []
}) {
  const response = await fetch("/api/ai/questions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      subject, topic, banca, quantity, difficulty, excludedIds
    })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Não foi possível gerar as questões.");
  return data.questions || [];
}
