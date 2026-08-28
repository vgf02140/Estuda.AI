import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3001;
const MODEL = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";

function requireKey(res) {
  if (!process.env.OPENROUTER_API_KEY) {
    res.status(500).json({
      error: "OPENROUTER_API_KEY não configurada. Crie server/.env usando server/.env.example."
    });
    return false;
  }
  return true;
}

async function openRouter(messages, temperature = 0.8) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:5173",
      "X-Title": "Estuda+"
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature
    })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || "OpenRouter retornou um erro.");
  }
  return data.choices?.[0]?.message?.content || "";
}

app.get("/api/health", (_, res) => res.json({ ok: true, app: "Estuda+" }));

app.post("/api/ai/chat", async (req, res) => {
  if (!requireKey(res)) return;
  try {
    const { messages = [], subject = "", context = "" } = req.body;
    const system = {
      role: "system",
      content: `Você é a IA educacional do Estuda+. Responda em português do Brasil.
Seja didática, precisa e organizada. Não invente fontes ou leis. Quando houver dúvida factual,
assuma incerteza em vez de inventar. Matéria atual: ${subject || "não informada"}.
Contexto adicional: ${context || "nenhum"}.`
    };
    const content = await openRouter([system, ...messages.slice(-20)], 0.65);
    res.json({ content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function extractJson(text) {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start >= 0 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
  return JSON.parse(cleaned);
}

app.post("/api/ai/questions", async (req, res) => {
  if (!requireKey(res)) return;
  try {
    const {
      subject = "Conhecimentos gerais",
      topic = "",
      banca = "Geral",
      quantity = 60,
      difficulty = "média",
      excludedIds = []
    } = req.body;

    const safeQuantity = [60, 80, 120].includes(Number(quantity)) ? Number(quantity) : 60;
    const excluded = Array.isArray(excludedIds) ? excludedIds.slice(0, 5000) : [];

    const prompt = `Crie ${safeQuantity} questões INÉDITAS de múltipla escolha para estudantes brasileiros.
Matéria: ${subject}.
Tópico: ${topic || "abrangente dentro da matéria"}.
Banca/estilo: ${banca}.
Dificuldade: ${difficulty}.

REGRAS OBRIGATÓRIAS:
1. Cada questão deve ter exatamente 4 alternativas.
2. Deve existir somente uma resposta correta.
3. A resposta correta deve ser representada pelo índice 0, 1, 2 ou 3.
4. Inclua uma explicação breve, objetiva e didática que justifique a resposta correta.
5. Não copie nem parafraseie questões do histórico.
6. Crie enunciados e alternativas realmente diferentes entre si.
7. Retorne SOMENTE JSON válido, sem markdown.
8. Formato:
[
  {
    "subject":"${subject}",
    "question":"...",
    "options":["...","...","...","..."],
    "answer":0,
    "explanation":"..."
  }
]

IDs/fingerprints de questões já respondidas que DEVEM SER EVITADAS:
${excluded.join(", ") || "nenhuma"}`;

    const raw = await openRouter([
      {
        role: "system",
        content: "Você é um gerador rigoroso de questões para concursos e vestibulares. Retorne somente JSON válido."
      },
      { role: "user", content: prompt }
    ], 0.95);

    let questions = extractJson(raw);
    if (!Array.isArray(questions)) throw new Error("A IA não retornou uma lista de questões.");

    questions = questions
      .filter(q => q && typeof q.question === "string" && Array.isArray(q.options) && q.options.length === 4)
      .map(q => ({
        id: crypto.randomUUID(),
        subject: q.subject || subject,
        question: q.question.trim(),
        options: q.options.map(String),
        answer: Number(q.answer),
        explanation: q.explanation || "A alternativa indicada é a correta de acordo com o conteúdo estudado."
      }))
      .filter(q => [0,1,2,3].includes(q.answer));

    res.json({ questions });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Estuda+ API em http://localhost:${PORT}`);
});
