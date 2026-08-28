import React, { useMemo, useState } from "react";
import {
  BookOpen, CalendarDays, CheckCircle2, ChevronRight, Clock3, FileText,
  GraduationCap, LayoutDashboard, LogOut, Menu, MessageCircle, Plus,
  Settings, Sparkles, Target, Trash2, TrendingUp, X, ExternalLink,
  CircleAlert, Brain, RefreshCw
} from "lucide-react";
import { askAI, generateQuestions } from "./services/api";
import { loadState, saveState, uid, questionFingerprint } from "./services/storage";

const BANKS = [
  "Geral", "Cebraspe", "IBFC", "IBGP", "Idecan", "FGV", "Imeso",
  "FCC", "Vunesp", "Cesgranrio", "Instituto AOCP", "Quadrix"
];

const initialQuestions = [
  {
    id: "demo_1",
    subject: "Português",
    question: "Em uma oração, o termo que completa o sentido de um verbo transitivo direto exerce a função de:",
    options: ["Sujeito", "Objeto direto", "Predicativo", "Adjunto adverbial"],
    answer: 1,
    explanation: "O objeto direto completa o sentido de um verbo transitivo direto sem preposição obrigatória."
  }
];

function App() {
  const [state, setState] = useState(loadState());
  const [page, setPage] = useState(state.user ? "dashboard" : "login");
  const [mobileMenu, setMobileMenu] = useState(false);

  function update(patch) {
    setState(prev => {
      const next = { ...prev, ...patch };
      saveState(next);
      return next;
    });
  }

  function login(name, email) {
    update({ user: { name, email } });
    setPage("dashboard");
  }

  if (!state.user && page === "login") {
    return <Login onLogin={login} />;
  }

  const nav = [
    ["dashboard", "Dashboard", LayoutDashboard],
    ["courses", "Cursos", BookOpen],
    ["ai", "Inteligência Artificial", Sparkles],
    ["simulados", "Simulados", Target],
    ["schedule", "Cronograma", CalendarDays],
    ["performance", "Desempenho", TrendingUp],
    ["history", "Questões feitas", CheckCircle2],
    ["admin", "Administração", Settings]
  ];

  function navigate(id) {
    setPage(id);
    setMobileMenu(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">+</div>
          <div><strong>Estuda+</strong><span>Seu estudo inteligente</span></div>
        </div>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button key={id} className={page === id ? "nav-item active" : "nav-item"} onClick={() => navigate(id)}>
              <Icon size={19}/><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-mini">
            <div className="avatar">{state.user.name?.[0]?.toUpperCase() || "U"}</div>
            <div><b>{state.user.name}</b><small>{state.user.email}</small></div>
          </div>
          <button className="logout" onClick={() => { update({ user: null }); setPage("login"); }}>
            <LogOut size={17}/> Sair
          </button>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X/> : <Menu/>}
          </button>
          <div>
            <span className="eyebrow">PLATAFORMA DE ESTUDOS</span>
            <h1>{nav.find(x => x[0] === page)?.[1] || "Estuda+"}</h1>
          </div>
          <div className="top-actions">
            <span className="status-dot"></span> Sistema online
          </div>
        </header>

        {page === "dashboard" && <Dashboard state={state} go={navigate}/>}
        {page === "courses" && <Courses state={state} update={update}/>}
        {page === "ai" && <AIChat state={state} update={update}/>}
        {page === "simulados" && <Simulados state={state} update={update}/>}
        {page === "schedule" && <Schedule state={state} update={update}/>}
        {page === "performance" && <Performance state={state}/>}
        {page === "history" && <History state={state}/>}
        {page === "admin" && <Admin state={state} update={update}/>}
      </main>
    </div>
  );
}

function Login({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return <div className="login-page">
    <div className="login-card">
      <div className="logo-large">+</div>
      <span className="eyebrow">PLATAFORMA DE ESTUDOS</span>
      <h1>Bem-vindo ao <span>Estuda+</span></h1>
      <p>Estude com organização, simulados e inteligência artificial.</p>
      <label>Nome</label>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Seu nome"/>
      <label>E-mail</label>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" type="email"/>
      <button className="primary full" disabled={!name.trim() || !email.trim()} onClick={() => onLogin(name.trim(), email.trim())}>
        Entrar na plataforma <ChevronRight size={18}/>
      </button>
      <small className="muted">Protótipo local. O Firebase será configurado posteriormente.</small>
    </div>
  </div>
}

function Dashboard({ state, go }) {
  const answered = state.answeredQuestions.length;
  const correct = state.answeredQuestions.filter(q => q.correct).length;
  const rate = answered ? Math.round(correct / answered * 100) : 0;
  const pending = state.schedule.filter(x => !x.completed).length;

  return <section className="content">
    <div className="hero-card">
      <div>
        <span className="eyebrow">OLÁ, {state.user.name.toUpperCase()}</span>
        <h2>Vamos avançar nos seus estudos?</h2>
        <p>Seu progresso fica salvo no seu perfil neste dispositivo.</p>
      </div>
      <Brain size={90} className="hero-icon"/>
    </div>
    <div className="stats-grid">
      <Stat icon={CheckCircle2} label="Questões respondidas" value={answered}/>
      <Stat icon={Target} label="Taxa de acerto" value={`${rate}%`}/>
      <Stat icon={CalendarDays} label="Itens no cronograma" value={pending}/>
      <Stat icon={TrendingUp} label="Acertos" value={correct}/>
    </div>
    <div className="grid-2">
      <Panel title="Comece agora">
        <Quick title="Gerar um simulado" text="Escolha a banca e faça 60, 80 ou 120 questões." icon={Target} onClick={() => go("simulados")}/>
        <Quick title="Perguntar à IA" text="Tire dúvidas, peça resumos e explicações." icon={Sparkles} onClick={() => go("ai")}/>
        <Quick title="Organizar estudos" text="Monte seu cronograma com conteúdo e duração." icon={CalendarDays} onClick={() => go("schedule")}/>
      </Panel>
      <Panel title="Resumo do progresso">
        <div className="progress-ring"><strong>{rate}%</strong><span>aproveitamento</span></div>
        <p className="muted center">{answered ? "Continue praticando para melhorar seu desempenho." : "Responda sua primeira questão para iniciar seu histórico."}</p>
      </Panel>
    </div>
  </section>
}

function Stat({ icon: Icon, label, value }) {
  return <div className="stat-card"><div className="icon-box"><Icon size={20}/></div><div><small>{label}</small><strong>{value}</strong></div></div>
}
function Quick({ title, text, icon: Icon, onClick }) {
  return <button className="quick" onClick={onClick}><div className="icon-box"><Icon size={20}/></div><div><b>{title}</b><span>{text}</span></div><ChevronRight/></button>
}
function Panel({ title, children, action }) {
  return <div className="panel"><div className="panel-title"><h3>{title}</h3>{action}</div>{children}</div>
}

function Courses({ state, update }) {
  const [url, setUrl] = useState(state.driveUrl || "");
  function save() { update({ driveUrl: url.trim() }); }
  return <section className="content">
    <Panel title="Materiais e cursos pelo Google Drive">
      <div className="drive-intro">
        <div className="drive-icon"><BookOpen size={28}/></div>
        <div><h3>Seus cursos ficam no Google Drive</h3><p className="muted">A plataforma não usa mais o cadastro manual de matérias. Cole abaixo o link da pasta compartilhada.</p></div>
      </div>
      <label>Link da pasta do Google Drive</label>
      <div className="input-row"><input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://drive.google.com/drive/folders/..."/><button className="primary" onClick={save}>Salvar</button></div>
      {state.driveUrl ? <div className="drive-actions">
        <a className="primary link-btn" href={state.driveUrl} target="_blank" rel="noreferrer">Abrir Google Drive <ExternalLink size={17}/></a>
        <iframe title="Google Drive" src={state.driveUrl.replace("/edit", "/preview")} className="drive-frame"/>
      </div> : <Empty icon={FileText} text="Nenhum link configurado ainda."/>}
    </Panel>
  </section>
}

function AIChat({ state, update }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messages = state.chat.length ? state.chat : [{ role: "assistant", content: "Olá! Sou a IA do Estuda+. Posso explicar conteúdos, criar resumos e ajudar você a estudar. O que deseja aprender?" }];

  async function send() {
    if (!input.trim() || loading) return;
    const next = [...state.chat, { role: "user", content: input.trim() }];
    update({ chat: next });
    setInput(""); setLoading(true);
    try {
      const result = await askAI({ messages: next });
      update({ chat: [...next, { role: "assistant", content: result.content }] });
    } catch (e) {
      update({ chat: [...next, { role: "assistant", content: `Não consegui consultar a IA: ${e.message}` }] });
    } finally { setLoading(false); }
  }

  return <section className="content">
    <div className="ai-layout">
      <div className="chat-panel panel">
        <div className="chat-header"><div className="ai-badge"><Sparkles size={18}/></div><div><b>Estuda+ IA</b><small>Assistente de estudos</small></div><span className="online-pill">ONLINE</span></div>
        <div className="chat-messages">
          {messages.map((m, i) => <div key={i} className={`bubble ${m.role}`}>{m.content}</div>)}
          {loading && <div className="bubble assistant"><RefreshCw className="spin" size={16}/> Pensando...</div>}
        </div>
        <div className="chat-input"><textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Digite sua dúvida..."/><button className="primary send" onClick={send}><MessageCircle size={18}/></button></div>
      </div>
      <div className="panel tips"><h3>Ferramentas da IA</h3><Quick title="Resumo" text="Cole um conteúdo e peça um resumo por tópicos." icon={FileText} onClick={() => setInput("Faça um resumo organizado por tópicos sobre: ")}/><Quick title="Explicação" text="Peça uma explicação simples de qualquer assunto." icon={Brain} onClick={() => setInput("Explique de forma simples: ")}/><Quick title="Questões" text="Use a área de simulados para gerar questões inéditas." icon={Target} onClick={() => setInput("Crie uma questão de múltipla escolha sobre: ")}/></div>
    </div>
  </section>
}

function Simulados({ state, update }) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [banca, setBanca] = useState("Geral");
  const [quantity, setQuantity] = useState(60);
  const [difficulty, setDifficulty] = useState("média");
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const excluded = state.answeredQuestions.map(q => q.fingerprint);

  async function start() {
    setLoading(true); setQuestions([]); setIndex(0); setSelected(null);
    try {
      let qs = await generateQuestions({ subject, topic, banca, quantity, difficulty, excludedIds: excluded });
      const seen = new Set(excluded);
      qs = qs.filter(q => {
        const fp = questionFingerprint(q);
        if (seen.has(fp)) return false;
        seen.add(fp); q.fingerprint = fp; return true;
      });
      setQuestions(qs);
    } catch (e) {
      alert(e.message);
    } finally { setLoading(false); }
  }

  function answer(choice) {
    if (selected !== null) return;
    setSelected(choice);
    const q = questions[index];
    const correct = choice === q.answer;
    const record = {
      ...q, fingerprint: q.fingerprint || questionFingerprint(q),
      selected: choice, correct, answeredAt: new Date().toISOString()
    };
    update({ answeredQuestions: [...state.answeredQuestions, record], performance: [...state.performance, { correct, date: new Date().toISOString() }] });
  }

  if (questions.length) {
    const q = questions[index];
    const answered = selected !== null;
    return <section className="content"><div className="quiz-wrap">
      <div className="quiz-head"><div><span className="eyebrow">SIMULADO • {banca}</span><h2>Questão {index + 1} de {questions.length}</h2></div><span className="counter">{index + 1}/{questions.length}</span></div>
      <div className="quiz-progress"><span style={{width: `${(index / questions.length) * 100}%`}}/></div>
      <Panel title={q.subject || subject || "Questão"}>
        <h3 className="question-text">{q.question}</h3>
        <div className="options">{q.options.map((op, i) => {
          const cls = answered ? (i === q.answer ? "option correct" : i === selected ? "option wrong" : "option") : "option";
          return <button className={cls} key={i} onClick={() => answer(i)}><span className="letter">{String.fromCharCode(65+i)}</span>{op}</button>
        })}</div>
        {answered && <div className={selected === q.answer ? "feedback success" : "feedback error"}><b>{selected === q.answer ? "Resposta correta!" : "Resposta incorreta."}</b><p>{q.explanation}</p></div>}
        {answered && <button className="primary next" onClick={() => { if (index + 1 < questions.length) { setIndex(index+1); setSelected(null); } else { setQuestions([]); alert("Simulado concluído! Seu histórico foi salvo."); } }}>{index + 1 < questions.length ? "Próxima questão" : "Finalizar simulado"} <ChevronRight/></button>}
      </Panel>
    </div></section>
  }

  return <section className="content">
    <div className="section-intro"><span className="eyebrow">PRÁTICA INTELIGENTE</span><h2>Monte seu simulado</h2><p>As questões respondidas ficam salvas e são usadas para evitar repetições.</p></div>
    <div className="form-card panel">
      <div className="form-grid">
        <div><label>Matéria</label><input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Ex.: Direito Constitucional"/></div>
        <div><label>Tópico (opcional)</label><input value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Ex.: Direitos fundamentais"/></div>
        <div><label>Banca</label><select value={banca} onChange={e=>setBanca(e.target.value)}>{BANKS.map(b=><option key={b}>{b}</option>)}</select></div>
        <div><label>Dificuldade</label><select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>fácil</option><option>média</option><option>difícil</option></select></div>
      </div>
      <label>Quantidade de questões</label>
      <div className="quantity-grid">{[60,80,120].map(n=><button className={quantity===n?"quantity active":"quantity"} onClick={()=>setQuantity(n)} key={n}><strong>{n}</strong><span>questões</span></button>)}</div>
      <div className="info-box"><CircleAlert size={18}/><span>A IA recebe o histórico das questões já feitas para reduzir repetições. Cada resposta é corrigida imediatamente.</span></div>
      <button className="primary big" disabled={loading || !subject.trim()} onClick={start}>{loading ? <><RefreshCw className="spin"/> Gerando questões inéditas...</> : <><Sparkles/> Gerar simulado</>}</button>
    </div>
  </section>
}

function Schedule({ state, update }) {
  const empty = { title:"", content:"", date:"", time:"", duration:"60", notes:"", completed:false };
  const [form, setForm] = useState(empty);
  const [filter, setFilter] = useState("todos");
  function add() {
    if (!form.title || !form.date) return alert("Informe o título e a data.");
    update({ schedule: [...state.schedule, { ...form, id: uid("schedule") }] });
    setForm(empty);
  }
  function toggle(id) {
    update({ schedule: state.schedule.map(x => x.id === id ? {...x, completed: !x.completed} : x) });
  }
  function remove(id) { update({ schedule: state.schedule.filter(x => x.id !== id) }); }
  const items = state.schedule.filter(x => {
    if (filter==="concluidos") return x.completed;
    if (filter==="pendentes") return !x.completed;
    return true;
  }).sort((a,b)=>a.date.localeCompare(b.date));

  return <section className="content">
    <div className="grid-2 schedule-grid">
      <Panel title="Adicionar ao cronograma">
        <div className="stack">
          <div><label>Título</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Ex.: Direito Administrativo"/></div>
          <div><label>Conteúdo</label><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Digite exatamente o conteúdo que será estudado..."/></div>
          <div className="form-grid"><div><label>Data</label><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></div><div><label>Horário</label><input type="time" value={form.time} onChange={e=>setForm({...form,time:e.target.value})}/></div></div>
          <div><label>Duração (minutos)</label><input type="number" min="5" value={form.duration} onChange={e=>setForm({...form,duration:e.target.value})}/></div>
          <div><label>Observações</label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Observações..."/></div>
          <button className="primary big" onClick={add}><Plus/> Salvar no cronograma</button>
        </div>
      </Panel>
      <Panel title="Meus estudos" action={<div className="filter-tabs">{["todos","pendentes","concluidos"].map(x=><button className={filter===x?"selected":""} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div>}>
        {items.length===0 ? <Empty icon={CalendarDays} text="Nenhum item encontrado."/> : <div className="schedule-list">{items.map(x=><div className={`schedule-item ${x.completed?"done":""}`} key={x.id}><button className="check-btn" onClick={()=>toggle(x.id)}>{x.completed?<CheckCircle2/>:<Clock3/>}</button><div className="schedule-info"><b>{x.title}</b><span>{x.content}</span><small>{x.date} {x.time && `• ${x.time}`} • {x.duration} min</small>{x.notes&&<em>{x.notes}</em>}</div><button className="icon-btn danger" onClick={()=>remove(x.id)}><Trash2 size={16}/></button></div>)}</div>}
      </Panel>
    </div>
  </section>
}

function Performance({ state }) {
  const [period, setPeriod] = useState("all");
  const days = period==="7" ? 7 : period==="30" ? 30 : 36500;
  const cutoff = Date.now() - days*86400000;
  const data = state.answeredQuestions.filter(x=>new Date(x.answeredAt).getTime()>=cutoff);
  const correct = data.filter(x=>x.correct).length;
  const rate = data.length ? Math.round(correct/data.length*100) : 0;
  return <section className="content"><div className="section-intro"><span className="eyebrow">ACOMPANHAMENTO</span><h2>Seu desempenho</h2><div className="period-tabs">{[["all","Todo o período"],["7","7 dias"],["30","30 dias"]].map(([v,l])=><button className={period===v?"selected":""} onClick={()=>setPeriod(v)} key={v}>{l}</button>)}</div></div><div className="stats-grid"><Stat icon={FileText} label="Questões no período" value={data.length}/><Stat icon={CheckCircle2} label="Acertos" value={correct}/><Stat icon={Target} label="Aproveitamento" value={`${rate}%`}/></div><Panel title="Visão geral"><div className="big-performance"><div className="progress-bar"><span style={{width:`${rate}%`}}/></div><strong>{rate}%</strong><p className="muted">Aproveitamento no período selecionado.</p></div></Panel></section>
}

function History({ state }) {
  return <section className="content"><Panel title="Questões já respondidas"><p className="muted">Este histórico é usado para impedir que a IA repita questões.</p>{state.answeredQuestions.length===0?<Empty icon={CheckCircle2} text="Você ainda não respondeu questões."/>:<div className="history-list">{state.answeredQuestions.slice().reverse().map((q,i)=><div className="history-item" key={`${q.fingerprint}-${i}`}><div className={q.correct?"result-icon good":"result-icon bad"}>{q.correct?<CheckCircle2/>:<X/>}</div><div><b>{q.subject || "Questão"}</b><p>{q.question}</p><small>{new Date(q.answeredAt).toLocaleString("pt-BR")}</small></div><span>{q.correct?"Acertou":"Errou"}</span></div>)}</div>}</Panel></section>
}

function Admin({ state, update }) {
  const [url, setUrl] = useState(state.driveUrl || "");
  return <section className="content"><div className="section-intro"><span className="eyebrow">CONTROLE</span><h2>Administração</h2><p>Configurações básicas do protótipo. O Firebase poderá substituir o armazenamento local posteriormente.</p></div><Panel title="Google Drive — cursos e materiais"><label>Link principal do Drive</label><div className="input-row"><input value={url} onChange={e=>setUrl(e.target.value)}/><button className="primary" onClick={()=>update({driveUrl:url.trim()})}>Salvar</button></div><div className="info-box"><BookOpen size={18}/><span>Os cursos não são cadastrados manualmente. O Drive será a fonte dos materiais para os estudantes.</span></div></Panel><Panel title="Perfil atual"><p><b>Nome:</b> {state.user.name}</p><p><b>E-mail:</b> {state.user.email}</p><p><b>Questões salvas:</b> {state.answeredQuestions.length}</p></Panel></section>
}

function Empty({ icon: Icon, text }) { return <div className="empty"><Icon size={30}/><p>{text}</p></div> }

export default App;
