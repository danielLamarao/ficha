import React, { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "academic-fichamento-responsive-v1";
const APP_VERSION = "5.1";

const initialArticles = [
  {
    id: 1,
    numero: 1,
    ano: 2014,
    tipo: "Livro",
    idioma: "Inglês",
    titulo: "Introdução aos disruptores endócrinos e seus impactos reprodutivos",
    link: "https://www.endocrine.org",
    autores: "Andrea C.",
    palavrasChave: "Introdução; DEs; disruptores endócrinos",
    resumo: "Guia introdutório sobre disruptores endócrinos.",
    objetivo: "Apresentar conceitos fundamentais sobre desregulação endócrina.",
    tema: "DEs",
    metodologia: "N/A",
    resultados: "N/A",
    conclusao: "N/A",
    uso: "Introdução",
    citacoes: "",
    abnt: "ANDREA, C. Introdução aos disruptores endócrinos e seus impactos reprodutivos. 2014.",
    status: "Lido",
    relevancia: "Alta",
    usadoTcc: true,
    criadoEm: "2026-03-09T05:00:00.000Z",
    atualizadoEm: "2026-03-09T05:00:00.000Z",
  },
  {
    id: 2,
    numero: 2,
    ano: 2026,
    tipo: "Revisão",
    idioma: "Português",
    titulo: "The Impact of Endocrine Disruptors on Implantation",
    link: "",
    autores: "Anastasios",
    palavrasChave: "DEs; falha da implantação",
    resumo: "Discussão sobre o impacto de disruptores endócrinos na implantação embrionária.",
    objetivo: "Esclarecer mecanismos relacionados à implantação embrionária.",
    tema: "Implantação embrionária",
    metodologia: "Busca bibliográfica",
    resultados: "Crescimento do interesse no tema.",
    conclusao: "Impactos relevantes na implantação.",
    uso: "Introdução; justificativa",
    citacoes: "",
    abnt: "ANASTASIOS. The Impact of Endocrine Disruptors on Implantation. 2026.",
    status: "Em leitura",
    relevancia: "Alta",
    usadoTcc: true,
    criadoEm: "2026-03-09T05:00:00.000Z",
    atualizadoEm: "2026-03-09T05:00:00.000Z",
  },
  {
    id: 3,
    numero: 3,
    ano: 2024,
    tipo: "Revisão",
    idioma: "Inglês",
    titulo: "Review Implications of Endocrine Disruption on Reproductive Outcomes",
    link: "https://pmc.ncbi.nlm.nih.gov",
    autores: "Juan M.",
    palavrasChave: "desregulador endócrino; reprodução",
    resumo: "Revisão sobre exposição a desreguladores endócrinos e efeitos reprodutivos.",
    objetivo: "Analisar a produção científica recente sobre o tema.",
    tema: "Impactos da exposição",
    metodologia: "Pesquisa bibliográfica",
    resultados: "A exposição mostrou associação com múltiplos desfechos.",
    conclusao: "As populações expostas requerem maior monitoramento.",
    uso: "Introdução; justificativa",
    citacoes: "",
    abnt: "JUAN, M. Review Implications of Endocrine Disruption on Reproductive Outcomes. 2024.",
    status: "Lido",
    relevancia: "Muito alta",
    usadoTcc: true,
    criadoEm: "2026-03-09T05:00:00.000Z",
    atualizadoEm: "2026-03-09T05:00:00.000Z",
  },
];

const emptyForm = {
  ano: "",
  tipo: "Revisão",
  idioma: "Inglês",
  titulo: "",
  link: "",
  autores: "",
  palavrasChave: "",
  resumo: "",
  objetivo: "",
  tema: "",
  metodologia: "",
  resultados: "",
  conclusao: "",
  uso: "",
  citacoes: "",
  abnt: "",
  status: "Não lido",
  relevancia: "Média",
  usadoTcc: false,
};

const navItems = ["Dashboard", "Artigos", "Novo artigo", "Editar artigo", "Importação", "Exportação", "Testes"];
const statusOrder = ["Não lido", "Em leitura", "Lido", "Revisado"];
const typeOptions = ["Revisão", "Livro", "Meta-análise", "Revisão sistemática", "Experimental", "Outro"];
const languageOptions = ["Inglês", "Português", "Espanhol", "Francês", "Outro"];
const relevanceOptions = ["Baixa", "Média", "Alta", "Muito alta"];

function nowIso() {
  return new Date().toISOString();
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function safeExternalLink(link) {
  const value = String(link || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[\w.-]+\.[a-z]{2,}/i.test(value)) return `https://${value}`;
  return "";
}

function validateForm(form) {
  if (!String(form.titulo || "").trim()) return "Título do artigo é obrigatório.";
  if (!String(form.ano || "").trim()) return "Ano de publicação é obrigatório.";
  const year = Number(form.ano);
  if (!Number.isInteger(year) || year < 1800 || year > 2100) return "Ano de publicação inválido.";
  if (!String(form.tipo || "").trim()) return "Tipo de artigo é obrigatório.";
  if (!String(form.idioma || "").trim()) return "Idioma é obrigatório.";
  const maybeUrl = String(form.link || "").trim();
  if (maybeUrl && !safeExternalLink(maybeUrl)) return "Link de acesso inválido.";
  return "";
}

function articleToForm(article) {
  return {
    ano: String(article?.ano ?? ""),
    tipo: article?.tipo ?? "Revisão",
    idioma: article?.idioma ?? "Inglês",
    titulo: article?.titulo ?? "",
    link: article?.link ?? "",
    autores: article?.autores ?? "",
    palavrasChave: article?.palavrasChave ?? "",
    resumo: article?.resumo ?? "",
    objetivo: article?.objetivo ?? "",
    tema: article?.tema ?? "",
    metodologia: article?.metodologia ?? "",
    resultados: article?.resultados ?? "",
    conclusao: article?.conclusao ?? "",
    uso: article?.uso ?? "",
    citacoes: article?.citacoes ?? "",
    abnt: article?.abnt ?? "",
    status: article?.status ?? "Não lido",
    relevancia: article?.relevancia ?? "Média",
    usadoTcc: Boolean(article?.usadoTcc),
  };
}

function createArticleFromForm(form, articles) {
  const nextId = articles.length ? Math.max(...articles.map((a) => Number(a.id) || 0)) + 1 : 1;
  const nextNumero = articles.length ? Math.max(...articles.map((a) => Number(a.numero) || 0)) + 1 : 1;
  const timestamp = nowIso();
  return {
    id: nextId,
    numero: nextNumero,
    ano: Number(form.ano),
    tipo: form.tipo,
    idioma: form.idioma,
    titulo: String(form.titulo || "").trim(),
    link: String(form.link || "").trim(),
    autores: String(form.autores || "").trim(),
    palavrasChave: String(form.palavrasChave || "").trim(),
    resumo: String(form.resumo || "").trim(),
    objetivo: String(form.objetivo || "").trim(),
    tema: String(form.tema || "").trim(),
    metodologia: String(form.metodologia || "").trim(),
    resultados: String(form.resultados || "").trim(),
    conclusao: String(form.conclusao || "").trim(),
    uso: String(form.uso || "").trim(),
    citacoes: String(form.citacoes || "").trim(),
    abnt: String(form.abnt || "").trim(),
    status: form.status,
    relevancia: form.relevancia,
    usadoTcc: Boolean(form.usadoTcc),
    criadoEm: timestamp,
    atualizadoEm: timestamp,
  };
}

function updateArticleFromForm(article, form) {
  return {
    ...article,
    ano: Number(form.ano),
    tipo: form.tipo,
    idioma: form.idioma,
    titulo: String(form.titulo || "").trim(),
    link: String(form.link || "").trim(),
    autores: String(form.autores || "").trim(),
    palavrasChave: String(form.palavrasChave || "").trim(),
    resumo: String(form.resumo || "").trim(),
    objetivo: String(form.objetivo || "").trim(),
    tema: String(form.tema || "").trim(),
    metodologia: String(form.metodologia || "").trim(),
    resultados: String(form.resultados || "").trim(),
    conclusao: String(form.conclusao || "").trim(),
    uso: String(form.uso || "").trim(),
    citacoes: String(form.citacoes || "").trim(),
    abnt: String(form.abnt || "").trim(),
    status: form.status,
    relevancia: form.relevancia,
    usadoTcc: Boolean(form.usadoTcc),
    atualizadoEm: nowIso(),
  };
}

function matchesQuery(article, query) {
  const haystack = normalizeText([
    article.titulo, article.autores, article.tema, article.resumo,
    article.palavrasChave, article.conclusao, article.objetivo,
    article.metodologia, article.resultados, article.abnt,
  ].join(" "));
  const needle = normalizeText(query);
  return needle === "" || haystack.includes(needle);
}

function filterArticles(articles, filters) {
  return articles.filter((article) => {
    const languageOk = filters.language === "Todos" || article.idioma === filters.language;
    const typeOk = filters.type === "Todos" || article.tipo === filters.type;
    const statusOk = filters.status === "Todos" || article.status === filters.status;
    const yearOk = !filters.year || String(article.ano) === String(filters.year);
    const tccOk = filters.onlyTcc ? article.usadoTcc : true;
    return matchesQuery(article, filters.query) && languageOk && typeOk && statusOk && yearOk && tccOk;
  });
}

function getNextStatus(currentStatus) {
  const currentIndex = statusOrder.indexOf(currentStatus);
  return statusOrder[(currentIndex + 1 + statusOrder.length) % statusOrder.length];
}

function escapeCsvValue(value) {
  const str = String(value ?? "");
  if (/[";\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(articles) {
  const headers = ["numero", "ano", "tipo", "idioma", "titulo", "link", "autores", "palavrasChave", "resumo", "objetivo", "tema", "metodologia", "resultados", "conclusao", "uso", "citacoes", "abnt", "status", "relevancia", "usadoTcc"];
  const lines = [headers.join(";")];
  articles.forEach((article) => lines.push(headers.map((h) => escapeCsvValue(article[h])).join(";")));
  return lines.join("\n");
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ';' && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function fromCsv(csvText, baseArticles = []) {
  const lines = String(csvText || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => line.trim() !== "");
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  let nextId = baseArticles.length ? Math.max(...baseArticles.map((a) => Number(a.id) || 0)) + 1 : 1;
  let nextNumero = baseArticles.length ? Math.max(...baseArticles.map((a) => Number(a.numero) || 0)) + 1 : 1;
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const raw = {};
    headers.forEach((header, index) => { raw[header] = cells[index] ?? ""; });
    return {
      id: nextId++, numero: raw.numero ? Number(raw.numero) : nextNumero++, ano: raw.ano ? Number(raw.ano) : 0,
      tipo: raw.tipo || "Revisão", idioma: raw.idioma || "Inglês", titulo: raw.titulo || "", link: raw.link || "",
      autores: raw.autores || "", palavrasChave: raw.palavrasChave || "", resumo: raw.resumo || "", objetivo: raw.objetivo || "",
      tema: raw.tema || "", metodologia: raw.metodologia || "", resultados: raw.resultados || "", conclusao: raw.conclusao || "",
      uso: raw.uso || "", citacoes: raw.citacoes || "", abnt: raw.abnt || "", status: raw.status || "Não lido",
      relevancia: raw.relevancia || "Média", usadoTcc: String(raw.usadoTcc).toLowerCase() === "true", criadoEm: nowIso(), atualizadoEm: nowIso(),
    };
  });
}

function buildBackupPayload(articles) {
  return JSON.stringify({ version: APP_VERSION, exportedAt: nowIso(), articles }, null, 2);
}

function normalizeImportedItem(item, currentArticles, index) {
  const maxId = currentArticles.length ? Math.max(...currentArticles.map((a) => Number(a.id) || 0)) : 0;
  const maxNumero = currentArticles.length ? Math.max(...currentArticles.map((a) => Number(a.numero) || 0)) : 0;
  const timestamp = nowIso();
  return {
    id: maxId + index + 1, numero: Number(item.numero) || maxNumero + index + 1, ano: Number(item.ano) || 0,
    tipo: item.tipo || "Revisão", idioma: item.idioma || "Inglês", titulo: item.titulo || "", link: item.link || "",
    autores: item.autores || "", palavrasChave: item.palavrasChave || "", resumo: item.resumo || "", objetivo: item.objetivo || "",
    tema: item.tema || "", metodologia: item.metodologia || "", resultados: item.resultados || "", conclusao: item.conclusao || "",
    uso: item.uso || "", citacoes: item.citacoes || "", abnt: item.abnt || "", status: item.status || "Não lido",
    relevancia: item.relevancia || "Média", usadoTcc: Boolean(item.usadoTcc), criadoEm: item.criadoEm || timestamp, atualizadoEm: item.atualizadoEm || timestamp,
  };
}

function parseImportText(text, currentArticles) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return { items: [], error: "Cole ou carregue um arquivo antes de importar." };
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return { items: parsed.map((item, index) => normalizeImportedItem(item, currentArticles, index)), error: "" };
    if (Array.isArray(parsed.articles)) return { items: parsed.articles.map((item, index) => normalizeImportedItem(item, currentArticles, index)), error: "" };
  } catch {
    try {
      const csvItems = fromCsv(trimmed, currentArticles);
      if (csvItems.length) return { items: csvItems, error: "" };
    } catch {
      return { items: [], error: "Falha ao processar o conteúdo importado." };
    }
  }
  return { items: [], error: "Formato não reconhecido. Use JSON do backup/exportação ou CSV separado por ponto e vírgula." };
}

function downloadTextFile(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 300);
}

function formatDateTime(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return `${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function getOptionLabel(option, labels = {}) {
  if (option === "") return labels[option] ?? "Todos";
  return labels[option] ?? String(option);
}

function runSelfTests() {
  const tests = [
    { name: "Busca ignora acentuação", pass: matchesQuery({ titulo: "Implantação embrionária", autores: "", tema: "", resumo: "", palavrasChave: "", conclusao: "", objetivo: "", metodologia: "", resultados: "", abnt: "" }, "implantacao") },
    { name: "Próximo status após Lido é Revisado", pass: getNextStatus("Lido") === "Revisado" },
    { name: "Validação rejeita ano inválido", pass: validateForm({ ...emptyForm, titulo: "A", ano: "1500", tipo: "Revisão", idioma: "Inglês" }) === "Ano de publicação inválido." },
    { name: "Criação gera número incremental", pass: createArticleFromForm({ ...emptyForm, titulo: "Novo", ano: "2025" }, initialArticles).numero === 4 },
    { name: "Filtro por idioma retorna apenas Português", pass: filterArticles(initialArticles, { query: "", language: "Português", type: "Todos", status: "Todos", year: "", onlyTcc: false }).every((a) => a.idioma === "Português") },
    { name: "Filtro por TCC retorna apenas marcados", pass: filterArticles(initialArticles, { query: "", language: "Todos", type: "Todos", status: "Todos", year: "", onlyTcc: true }).every((a) => a.usadoTcc) },
    { name: "Link incompleto é normalizado", pass: safeExternalLink("example.com") === "https://example.com" },
    { name: "CSV é gerado com cabeçalho", pass: toCsv(initialArticles).startsWith("numero;ano;tipo;idioma;titulo") },
    { name: "CSV simples é importado", pass: fromCsv("numero;ano;tipo;idioma;titulo\n1;2024;Revisão;Português;Teste", []).length === 1 },
    { name: "Backup contém articles", pass: buildBackupPayload(initialArticles).includes('"articles"') },
    { name: "Importação JSON aceita lista", pass: parseImportText(JSON.stringify([{ titulo: "A", ano: 2020 }]), []).items.length === 1 },
    { name: "Opção vazia mostra Todos", pass: getOptionLabel("", { "": "Todos" }) === "Todos" },
    { name: "Conversão de formulário preserva booleano", pass: articleToForm({ usadoTcc: true }).usadoTcc === true },
  ];
  return { tests, passed: tests.filter((t) => t.pass).length, total: tests.length };
}

function Panel({ title, subtitle, children }) {
  return <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-5"><div className="mb-4 sm:mb-5"><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-sm text-slate-500">{subtitle}</div></div>{children}</section>;
}

function KpiCard({ title, value, subtitle }) {
  return <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-4 sm:rounded-[24px]"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</div><div className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{value}</div><div className="mt-2 text-sm text-slate-500">{subtitle}</div></div>;
}

function Input({ label, value, onChange, placeholder }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} /></label>;
}

function Select({ label, value, onChange, options, labels = {} }) {
  return <label className="block"><span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>{options.map((option) => <option key={String(option)} value={option}>{getOptionLabel(option, labels)}</option>)}</select></label>;
}

function Field({ label, className = "", children }) {
  return <label className={className}><span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>{children}</label>;
}

function DetailBlock({ title, content }) {
  return <div className="rounded-2xl border border-slate-200 p-4"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</div><div className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-800">{content}</div></div>;
}

function DetailGrid({ items }) {
  return <div className="grid gap-3 sm:grid-cols-2">{items.map(([label, value]) => <div key={label} className="rounded-2xl border border-slate-200 p-4"><div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div><div className="mt-2 break-words text-sm leading-7 text-slate-800">{value}</div></div>)}</div>;
}

function ActionButton({ onClick, label, danger = false }) {
  return <button onClick={onClick} className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${danger ? "bg-rose-600 text-white hover:bg-rose-700" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>{label}</button>;
}

function EmptyState({ text }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">{text}</div>;
}

function MobileArticleCard({ article, selected, onSelect }) {
  return <button onClick={() => onSelect(article.id)} className={`w-full rounded-2xl border p-4 text-left transition ${selected ? "border-slate-400 bg-slate-100" : "border-slate-200 bg-white hover:bg-slate-50"}`}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Artigo #{article.numero}</div><div className="mt-1 break-words text-sm font-semibold text-slate-900">{article.titulo}</div></div><span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">{article.status}</span></div><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600 sm:grid-cols-4"><div><span className="font-semibold">Ano:</span> {article.ano}</div><div><span className="font-semibold">Idioma:</span> {article.idioma}</div><div><span className="font-semibold">Tipo:</span> {article.tipo}</div><div><span className="font-semibold">TCC:</span> {article.usadoTcc ? "Sim" : "Não"}</div></div></button>;
}

const inputCls = "w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:px-4";
const textAreaCls = "min-h-[110px] w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:px-4";

export default function AcademicFichamentoSite() {
  const [articles, setArticles] = useState(initialArticles);
  const [activeView, setActiveView] = useState("Dashboard");
  const [selectedId, setSelectedId] = useState(initialArticles[0]?.id ?? null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("Sistema carregado. Você já pode selecionar, criar, editar, importar e exportar artigos.");
  const [saveState, setSaveState] = useState("Pronto");
  const [exportPayload, setExportPayload] = useState("");
  const [query, setQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState("Todos");
  const [typeFilter, setTypeFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [yearFilter, setYearFilter] = useState("");
  const [onlyTcc, setOnlyTcc] = useState(false);
  const [importText, setImportText] = useState("");
  const [importPreview, setImportPreview] = useState([]);
  const [importError, setImportError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          setArticles(parsed);
          setSelectedId(parsed[0].id);
          setMessage("Dados restaurados do armazenamento local.");
        }
      }
    } catch {
      setMessage("Falha ao restaurar armazenamento local. A base padrão foi carregada.");
    }
  }, []);

  useEffect(() => {
    try {
      setSaveState("Salvando...");
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
      setSaveState("Salvo no navegador");
    } catch {
      setSaveState("Falha ao salvar no navegador");
    }
  }, [articles]);

  const filters = { query, language: languageFilter, type: typeFilter, status: statusFilter, year: yearFilter, onlyTcc };
  const filteredArticles = useMemo(() => filterArticles(articles, filters), [articles, query, languageFilter, typeFilter, statusFilter, yearFilter, onlyTcc]);
  const selectedArticle = articles.find((a) => a.id === selectedId) || filteredArticles[0] || null;
  const uniqueLanguages = ["Todos", ...new Set(articles.map((a) => a.idioma).filter(Boolean))];
  const uniqueTypes = ["Todos", ...new Set(articles.map((a) => a.tipo).filter(Boolean))];
  const uniqueStatuses = ["Todos", ...new Set(articles.map((a) => a.status).filter(Boolean))];
  const uniqueYears = ["", ...new Set(articles.map((a) => String(a.ano)).filter(Boolean))].sort((a, b) => Number(b) - Number(a));
  const testReport = useMemo(() => runSelfTests(), []);
  const dashboard = {
    total: articles.length,
    comAbnt: articles.filter((a) => Boolean(a.abnt)).length,
    usadosNoTcc: articles.filter((a) => a.usadoTcc).length,
    lidos: articles.filter((a) => a.status === "Lido" || a.status === "Revisado").length,
    comLink: articles.filter((a) => Boolean(safeExternalLink(a.link))).length,
  };

  const goTo = (view) => {
    setActiveView(view);
    if (view === "Novo artigo") setForm(emptyForm);
    if (view === "Editar artigo") {
      if (!selectedArticle) {
        setMessage("Selecione um artigo para editar.");
        setActiveView("Artigos");
        return;
      }
      setForm(articleToForm(selectedArticle));
    }
  };

  const handleCreate = (event) => {
    event.preventDefault();
    const error = validateForm(form);
    if (error) return setMessage(error);
    const article = createArticleFromForm(form, articles);
    setArticles((prev) => [article, ...prev]);
    setSelectedId(article.id);
    setForm(emptyForm);
    setActiveView("Artigos");
    setMessage(`Artigo ${article.numero} cadastrado com sucesso.`);
  };

  const handleUpdate = (event) => {
    event.preventDefault();
    if (!selectedArticle) return setMessage("Nenhum artigo selecionado para edição.");
    const error = validateForm(form);
    if (error) return setMessage(error);
    const updated = updateArticleFromForm(selectedArticle, form);
    setArticles((prev) => prev.map((a) => (a.id === selectedArticle.id ? updated : a)));
    setActiveView("Artigos");
    setMessage(`Artigo ${updated.numero} atualizado com sucesso.`);
  };

  const handleDuplicate = () => {
    if (!selectedArticle) return setMessage("Selecione um artigo para duplicar.");
    const duplicate = createArticleFromForm(articleToForm(selectedArticle), articles);
    duplicate.titulo = `${selectedArticle.titulo} (cópia)`;
    setArticles((prev) => [duplicate, ...prev]);
    setSelectedId(duplicate.id);
    setMessage(`Artigo ${selectedArticle.numero} duplicado como ${duplicate.numero}.`);
  };

  const handleDelete = () => {
    if (!selectedArticle) return setMessage("Nenhum artigo selecionado para exclusão.");
    const updated = articles.filter((a) => a.id !== selectedArticle.id);
    setArticles(updated);
    setSelectedId(updated[0]?.id ?? null);
    setMessage(`Artigo ${selectedArticle.numero} removido.`);
  };

  const handleToggleTcc = () => {
    if (!selectedArticle) return;
    setArticles((prev) => prev.map((a) => (a.id === selectedArticle.id ? { ...a, usadoTcc: !a.usadoTcc, atualizadoEm: nowIso() } : a)));
    setMessage(`Uso no TCC do artigo ${selectedArticle.numero} atualizado.`);
  };

  const handleNextStatus = () => {
    if (!selectedArticle) return;
    const nextStatus = getNextStatus(selectedArticle.status);
    setArticles((prev) => prev.map((a) => (a.id === selectedArticle.id ? { ...a, status: nextStatus, atualizadoEm: nowIso() } : a)));
    setMessage(`Status do artigo ${selectedArticle.numero} alterado para ${nextStatus}.`);
  };

  const saveBrowser = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
      setSaveState("Salvo no navegador");
      setMessage("Dados salvos manualmente no navegador.");
    } catch {
      setSaveState("Falha ao salvar no navegador");
      setMessage("Falha ao salvar manualmente no navegador.");
    }
  };

  const resetData = () => {
    setArticles(initialArticles);
    setSelectedId(initialArticles[0]?.id ?? null);
    setForm(emptyForm);
    setExportPayload("");
    setImportText("");
    setImportPreview([]);
    setImportError("");
    setQuery("");
    setLanguageFilter("Todos");
    setTypeFilter("Todos");
    setStatusFilter("Todos");
    setYearFilter("");
    setOnlyTcc(false);
    setActiveView("Dashboard");
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
    setMessage("Base restaurada para o estado inicial.");
  };

  const prepareJson = () => { setExportPayload(buildBackupPayload(filteredArticles)); setActiveView("Exportação"); setMessage("Exportação JSON preparada com sucesso."); };
  const prepareCsv = () => { setExportPayload(toCsv(filteredArticles)); setActiveView("Exportação"); setMessage("Exportação CSV preparada com sucesso."); };
  const downloadJson = () => { downloadTextFile("fichamento-artigos.json", exportPayload || buildBackupPayload(filteredArticles), "application/json;charset=utf-8"); setMessage("Arquivo JSON baixado com sucesso."); };
  const downloadCsv = () => { downloadTextFile("fichamento-artigos.csv", exportPayload && exportPayload.includes(";") ? exportPayload : toCsv(filteredArticles), "text/csv;charset=utf-8"); setMessage("Arquivo CSV baixado com sucesso."); };
  const downloadBackupTxt = () => { downloadTextFile("backup-completo-fichamento.txt", buildBackupPayload(articles), "text/plain;charset=utf-8"); setMessage("Backup completo baixado com sucesso."); };

  const loadImportPreview = () => {
    const { items, error } = parseImportText(importText, articles);
    if (error) {
      setImportError(error);
      setImportPreview([]);
      setMessage(error);
      return;
    }
    setImportError("");
    setImportPreview(items);
    setMessage(`${items.length} registro(s) preparados para importação.`);
  };

  const confirmImport = () => {
    if (!importPreview.length) return setMessage("Nenhum registro em pré-visualização para importar.");
    const maxId = articles.length ? Math.max(...articles.map((a) => Number(a.id) || 0)) : 0;
    const maxNumero = articles.length ? Math.max(...articles.map((a) => Number(a.numero) || 0)) : 0;
    const normalized = importPreview.map((a, index) => ({ ...a, id: maxId + index + 1, numero: maxNumero + index + 1, criadoEm: a.criadoEm || nowIso(), atualizadoEm: nowIso() }));
    setArticles((prev) => [...normalized, ...prev]);
    setSelectedId(normalized[0]?.id ?? selectedId);
    setImportText("");
    setImportPreview([]);
    setImportError("");
    setActiveView("Artigos");
    setMessage(`${normalized.length} registro(s) importados com sucesso.`);
  };

  const handleImportFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setImportText(String(reader.result || "")); setMessage(`Arquivo ${file.name} carregado para pré-visualização.`); };
    reader.onerror = () => setMessage("Falha ao ler o arquivo selecionado.");
    reader.readAsText(file, "utf-8");
  };

  const renderForm = (isEdit) => (
    <Panel title={isEdit ? "Editar artigo" : "Cadastro de novo artigo"} subtitle={isEdit ? "Atualize o registro selecionado e salve as alterações." : "Criação de registro com persistência local e exportação de backup."}>
      <form onSubmit={isEdit ? handleUpdate : handleCreate} className="grid gap-4 md:grid-cols-2">
        <Field label="Ano de publicação"><input value={form.ano} onChange={(e) => setForm((prev) => ({ ...prev, ano: e.target.value }))} className={inputCls} placeholder="2025" /></Field>
        <Field label="Tipo de artigo"><select value={form.tipo} onChange={(e) => setForm((prev) => ({ ...prev, tipo: e.target.value }))} className={inputCls}>{typeOptions.map((opt) => <option key={opt}>{opt}</option>)}</select></Field>
        <Field label="Idioma"><select value={form.idioma} onChange={(e) => setForm((prev) => ({ ...prev, idioma: e.target.value }))} className={inputCls}>{languageOptions.map((opt) => <option key={opt}>{opt}</option>)}</select></Field>
        <Field label="Tema principal"><input value={form.tema} onChange={(e) => setForm((prev) => ({ ...prev, tema: e.target.value }))} className={inputCls} placeholder="Implantação, exposição, inflamação..." /></Field>
        <Field label="Título do artigo" className="md:col-span-2"><input value={form.titulo} onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))} className={inputCls} placeholder="Digite o título completo" /></Field>
        <Field label="Link de acesso" className="md:col-span-2"><input value={form.link} onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))} className={inputCls} placeholder="https://..." /></Field>
        <Field label="Autores" className="md:col-span-2"><input value={form.autores} onChange={(e) => setForm((prev) => ({ ...prev, autores: e.target.value }))} className={inputCls} placeholder="Sobrenome, Iniciais..." /></Field>
        <Field label="Palavras-chave" className="md:col-span-2"><input value={form.palavrasChave} onChange={(e) => setForm((prev) => ({ ...prev, palavrasChave: e.target.value }))} className={inputCls} placeholder="separe por ponto e vírgula" /></Field>
        <Field label="Resumo" className="md:col-span-2"><textarea value={form.resumo} onChange={(e) => setForm((prev) => ({ ...prev, resumo: e.target.value }))} className={textAreaCls} placeholder="Resumo do artigo" /></Field>
        <Field label="Objetivo principal" className="md:col-span-2"><textarea value={form.objetivo} onChange={(e) => setForm((prev) => ({ ...prev, objetivo: e.target.value }))} className={textAreaCls} placeholder="Objetivo do estudo" /></Field>
        <Field label="Metodologia"><textarea value={form.metodologia} onChange={(e) => setForm((prev) => ({ ...prev, metodologia: e.target.value }))} className={textAreaCls} placeholder="Revisão, estudo observacional..." /></Field>
        <Field label="Resultados"><textarea value={form.resultados} onChange={(e) => setForm((prev) => ({ ...prev, resultados: e.target.value }))} className={textAreaCls} placeholder="Principais achados" /></Field>
        <Field label="Conclusão"><textarea value={form.conclusao} onChange={(e) => setForm((prev) => ({ ...prev, conclusao: e.target.value }))} className={textAreaCls} placeholder="Conclusão principal" /></Field>
        <Field label="Uso da obra"><textarea value={form.uso} onChange={(e) => setForm((prev) => ({ ...prev, uso: e.target.value }))} className={textAreaCls} placeholder="Introdução, justificativa, discussão..." /></Field>
        <Field label="Citações diretas" className="md:col-span-2"><textarea value={form.citacoes} onChange={(e) => setForm((prev) => ({ ...prev, citacoes: e.target.value }))} className={textAreaCls} placeholder="Trechos importantes" /></Field>
        <Field label="Referência bibliográfica (ABNT)" className="md:col-span-2"><textarea value={form.abnt} onChange={(e) => setForm((prev) => ({ ...prev, abnt: e.target.value }))} className={textAreaCls} placeholder="Referência formatada" /></Field>
        <Field label="Status de leitura"><select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))} className={inputCls}>{statusOrder.map((opt) => <option key={opt}>{opt}</option>)}</select></Field>
        <Field label="Relevância"><select value={form.relevancia} onChange={(e) => setForm((prev) => ({ ...prev, relevancia: e.target.value }))} className={inputCls}>{relevanceOptions.map((opt) => <option key={opt}>{opt}</option>)}</select></Field>
        <label className="md:col-span-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"><input type="checkbox" checked={form.usadoTcc} onChange={(e) => setForm((prev) => ({ ...prev, usadoTcc: e.target.checked }))} className="h-4 w-4 rounded border-slate-300" />Marcar como artigo usado no TCC</label>
        <div className="md:col-span-2 flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap"><button type="submit" className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white">{isEdit ? "Salvar alterações" : "Salvar artigo"}</button><button type="button" onClick={() => setForm(isEdit && selectedArticle ? articleToForm(selectedArticle) : emptyForm)} className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700">Resetar formulário</button></div>
      </form>
    </Panel>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-[1700px] px-3 py-4 sm:px-4 sm:py-6 xl:px-8">
        <header className="mb-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:mb-6 sm:rounded-[32px] sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Academic Research System</div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Fichamento Científico Pro</h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">App completo de fichamento para registrar, filtrar, editar, importar, exportar e salvar artigos científicos com backup local e downloads reais.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
              {navItems.map((item) => <button key={item} onClick={() => goTo(item)} className={`rounded-2xl px-3 py-2.5 text-sm font-semibold transition sm:px-4 ${activeView === item ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>{item}</button>)}
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]"><div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{message}</div><div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700">{saveState}</div></div>
        </header>

        {activeView === "Dashboard" && <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.2fr_0.95fr]"><Panel title="Resumo da base" subtitle="Indicadores gerais da sua organização bibliográfica."><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 sm:gap-4"><KpiCard title="Total de artigos" value={dashboard.total} subtitle="Base cadastrada" /><KpiCard title="Com referência ABNT" value={dashboard.comAbnt} subtitle="Padronização" /><KpiCard title="Usados no TCC" value={dashboard.usadosNoTcc} subtitle="Aplicação" /><KpiCard title="Lidos ou revisados" value={dashboard.lidos} subtitle="Leitura" /><KpiCard title="Com link válido" value={dashboard.comLink} subtitle="Acesso externo" /><KpiCard title="Versão" value={APP_VERSION} subtitle="Build responsivo" /></div></Panel><Panel title="Ações principais" subtitle="Fluxos estáveis desta versão."><div className="grid gap-3 sm:grid-cols-2"><ActionButton onClick={saveBrowser} label="Salvar no navegador" /><ActionButton onClick={downloadBackupTxt} label="Baixar backup TXT" /><ActionButton onClick={() => goTo("Novo artigo")} label="Cadastrar artigo" /><ActionButton onClick={resetData} label="Restaurar base" danger /></div></Panel></section>}

        {activeView === "Artigos" && <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.3fr_0.95fr]"><Panel title="Lista de artigos" subtitle="Selecione uma linha ou card para abrir os detalhes."><div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5 sm:mb-5"><Input label="Busca" value={query} onChange={setQuery} placeholder="Título, autor, tema..." /><Select label="Idioma" value={languageFilter} onChange={setLanguageFilter} options={uniqueLanguages} /><Select label="Tipo" value={typeFilter} onChange={setTypeFilter} options={uniqueTypes} /><Select label="Status" value={statusFilter} onChange={setStatusFilter} options={uniqueStatuses} /><Select label="Ano" value={yearFilter} onChange={setYearFilter} options={uniqueYears} labels={{ "": "Todos" }} /></div><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap"><label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700"><input type="checkbox" checked={onlyTcc} onChange={(e) => setOnlyTcc(e.target.checked)} />Mostrar apenas artigos usados no TCC</label><ActionButton onClick={() => { setQuery(""); setLanguageFilter("Todos"); setTypeFilter("Todos"); setStatusFilter("Todos"); setYearFilter(""); setOnlyTcc(false); }} label="Limpar filtros" /></div><div className="hidden overflow-auto rounded-3xl border border-slate-200 lg:block"><table className="min-w-full border-collapse bg-white text-sm"><thead className="bg-slate-100 text-xs uppercase tracking-[0.14em] text-slate-600"><tr><th className="px-4 py-3 text-left">Número</th><th className="px-4 py-3 text-left">Ano</th><th className="px-4 py-3 text-left">Idioma</th><th className="px-4 py-3 text-left">Tipo</th><th className="px-4 py-3 text-left">Título do artigo</th><th className="px-4 py-3 text-left">Status</th></tr></thead><tbody>{filteredArticles.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Nenhum artigo encontrado com os filtros atuais.</td></tr> : filteredArticles.map((article) => <tr key={article.id} onClick={() => setSelectedId(article.id)} className={`cursor-pointer border-t border-slate-100 transition hover:bg-slate-50 ${selectedArticle?.id === article.id ? "bg-slate-100" : "bg-white"}`}><td className="px-4 py-4 font-semibold text-slate-700">{article.numero}</td><td className="px-4 py-4">{article.ano}</td><td className="px-4 py-4">{article.idioma}</td><td className="px-4 py-4">{article.tipo}</td><td className="px-4 py-4">{article.titulo}</td><td className="px-4 py-4">{article.status}</td></tr>)}</tbody></table></div><div className="space-y-3 lg:hidden">{filteredArticles.length === 0 ? <EmptyState text="Nenhum artigo encontrado com os filtros atuais." /> : filteredArticles.map((article) => <MobileArticleCard key={article.id} article={article} selected={selectedArticle?.id === article.id} onSelect={setSelectedId} />)}</div></Panel><Panel title="Painel do artigo selecionado" subtitle="Detalhamento completo, com ações de editar, duplicar, status e exclusão.">{!selectedArticle ? <EmptyState text="Selecione um artigo na lista para ver os detalhes." /> : <div className="space-y-4"><DetailBlock title="Título do artigo" content={selectedArticle.titulo} /><DetailGrid items={[["Número", String(selectedArticle.numero)], ["Ano", String(selectedArticle.ano)], ["Tipo", selectedArticle.tipo], ["Idioma", selectedArticle.idioma], ["Relevância", selectedArticle.relevancia], ["Status", selectedArticle.status], ["Tema principal", selectedArticle.tema || "—"], ["Usado no TCC", selectedArticle.usadoTcc ? "Sim" : "Não"]]} /><DetailBlock title="Autores" content={selectedArticle.autores || "—"} /><DetailBlock title="Palavras-chave" content={selectedArticle.palavrasChave || "—"} /><DetailBlock title="Resumo" content={selectedArticle.resumo || "—"} /><DetailBlock title="Objetivo principal" content={selectedArticle.objetivo || "—"} /><DetailBlock title="Metodologia" content={selectedArticle.metodologia || "—"} /><DetailBlock title="Resultados" content={selectedArticle.resultados || "—"} /><DetailBlock title="Conclusão" content={selectedArticle.conclusao || "—"} /><DetailBlock title="Uso da obra" content={selectedArticle.uso || "—"} /><DetailBlock title="Citações diretas" content={selectedArticle.citacoes || "—"} /><DetailBlock title="Referência ABNT" content={selectedArticle.abnt || "—"} /><DetailGrid items={[["Criado em", formatDateTime(selectedArticle.criadoEm)], ["Atualizado em", formatDateTime(selectedArticle.atualizadoEm)]]} /><div className="grid gap-3 sm:grid-cols-2"><ActionButton onClick={() => goTo("Editar artigo")} label="Editar artigo" /><ActionButton onClick={handleDuplicate} label="Duplicar artigo" /><ActionButton onClick={handleNextStatus} label="Alternar status" /><ActionButton onClick={handleToggleTcc} label={selectedArticle.usadoTcc ? "Remover do TCC" : "Marcar no TCC"} /><ActionButton onClick={() => { const url = safeExternalLink(selectedArticle.link); if (!url) return setMessage("Esse registro não possui um link externo válido."); window.open(url, "_blank", "noopener,noreferrer"); }} label="Abrir link" /><ActionButton onClick={handleDelete} label="Excluir artigo" danger /></div></div>}</Panel></section>}

        {activeView === "Novo artigo" && renderForm(false)}
        {activeView === "Editar artigo" && renderForm(true)}

        {activeView === "Importação" && <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.1fr_0.9fr]"><Panel title="Importação" subtitle="Aceita JSON do backup/exportação e CSV separado por ponto e vírgula. Também aceita arquivo local .json, .csv ou .txt."><div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"><button onClick={() => fileInputRef.current?.click()} className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700">Carregar arquivo</button><ActionButton onClick={loadImportPreview} label="Gerar prévia" /><ActionButton onClick={confirmImport} label="Confirmar importação" /></div><input ref={fileInputRef} type="file" accept=".json,.csv,.txt" onChange={handleImportFileChange} className="hidden" /><div className="mt-5 space-y-3"><div className="text-sm font-medium text-slate-700">Cole o conteúdo do arquivo aqui</div><textarea value={importText} onChange={(e) => setImportText(e.target.value)} className="min-h-[220px] w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 font-mono text-xs text-slate-800 sm:min-h-[260px] sm:px-4" placeholder="Cole JSON do backup/exportação ou CSV separado por ponto e vírgula..." />{importError && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{importError}</div>}</div></Panel><Panel title="Pré-visualização da importação" subtitle="Verifique os registros antes de confirmar.">{importPreview.length === 0 ? <EmptyState text="Nenhum registro em pré-visualização." /> : <div className="max-h-[620px] space-y-3 overflow-auto">{importPreview.map((article, index) => <div key={`${article.id}-${index}`} className="rounded-2xl border border-slate-200 p-4"><div className="text-sm font-semibold text-slate-900">{article.titulo || "Sem título"}</div><div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">#{index + 1} · {article.ano || "—"} · {article.tipo || "—"} · {article.idioma || "—"}</div><div className="mt-2 text-sm text-slate-700">{article.autores || "Sem autores"}</div></div>)}</div>}</Panel></section>}

        {activeView === "Exportação" && <Panel title="Exportação e backup" subtitle="Geração manual e download real de JSON, CSV e backup completo em TXT."><div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap"><ActionButton onClick={prepareJson} label="Preparar JSON" /><ActionButton onClick={prepareCsv} label="Preparar CSV" /><ActionButton onClick={downloadJson} label="Baixar JSON" /><ActionButton onClick={downloadCsv} label="Baixar CSV" /><ActionButton onClick={downloadBackupTxt} label="Baixar backup TXT" /></div><div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">Os downloads são gerados no navegador. Use JSON para backup/importação e CSV para abrir no Excel.</div><div className="mt-5 space-y-3"><div className="text-sm text-slate-600">Prévia do conteúdo exportado:</div><textarea readOnly value={exportPayload} className="min-h-[240px] w-full rounded-2xl border border-slate-300 bg-white px-3 py-3 font-mono text-xs text-slate-800 sm:min-h-[340px] sm:px-4" placeholder="Clique em Preparar JSON ou Preparar CSV para ver o conteúdo aqui." /></div></Panel>}

        {activeView === "Testes" && <Panel title="Testes executados no protótipo" subtitle="Verificações internas das funções principais do sistema."><div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{testReport.passed}/{testReport.total} testes aprovados.</div><div className="space-y-3">{testReport.tests.map((test) => <div key={test.name} className={`rounded-2xl border px-4 py-3 text-sm ${test.pass ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"}`}><strong>{test.pass ? "OK" : "FALHA"}</strong> — {test.name}</div>)}</div></Panel>}
      </div>
    </div>
  );
}
