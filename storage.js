const KEY = "estuda_plus_state_v1";

const defaults = {
  user: null,
  driveUrl: "",
  schedule: [],
  answeredQuestions: [],
  performance: [],
  chat: [],
  settings: {
    theme: "dark"
  }
};

export function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY));
    return { ...defaults, ...saved, settings: { ...defaults.settings, ...(saved?.settings || {}) } };
  } catch {
    return defaults;
  }
}

export function saveState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  localStorage.removeItem(KEY);
  return defaults;
}

export function uid(prefix = "id") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function questionFingerprint(q) {
  const raw = `${q.question}|${(q.options || []).join("|")}|${q.answer}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) hash = ((hash << 5) - hash) + raw.charCodeAt(i) | 0;
  return String(Math.abs(hash));
}
