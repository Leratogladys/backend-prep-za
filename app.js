const glyphs = {
  terminal:'<path d="m4 7 5 5-5 5m8 0h8"/>', home:'<path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-7h6v7"/>',
  book:'<path d="M4 19V5a2 2 0 0 1 2-2h14v18H6a2 2 0 0 1 0-4h14M8 7h8m-8 4h5"/>', box:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v8l9 5 9-5V8m-9 5v8M7.5 5.5l9 5"/>',
  mic:'<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-3 0h6"/>',
  chart:'<path d="M3 3v17a1 1 0 0 0 1 1h17M8 16v-4m5 4V8m5 8V5"/>',
  globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18m0-18a15 15 0 0 0 0 18"/>',
  arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>', left:'<path d="M20 12H5m6 6-6-6 6-6"/>', external:'<path d="M13 5h6v6m0-6-8 8m7 0v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  chevron:'<path d="m9 18 6-6-6-6"/>', down:'<path d="m6 9 6 6 6-6"/>', check:'<path d="m5 12 4 4L19 6"/>',
  chat:'<path d="M21 11.5a7.5 7.5 0 0 1-7.5 7.5H5l-3 3v-8.5A7.5 7.5 0 0 1 9.5 6H16m1-3v6m3-3h-6"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 4 9 5 9-5"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5h2m4 0h2"/>',
  code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-2-14-4 16"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>', menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  search:'<circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/>', bookmark:'<path d="M6 4h12v17l-6-4-6 4z"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  play:'<path d="m8 5 11 7-11 7z"/>', pause:'<path d="M9 5v14m6-14v14"/>', reset:'<path d="M3 11a9 9 0 1 1 2 7m-2-7V5m0 6h6"/>',
  bulb:'<path d="M9 18h6m-5 3h4m-7-9a6 6 0 1 1 10 0c-1 1-2 2-2 3H9c0-1-1-2-2-3Z"/>',
  file:'<path d="M14 3H6v18h12V7l-4-4zm0 0v5h4m-9 5h6m-6 4h6"/>', close:'<path d="m6 6 12 12M18 6 6 18"/>'
};
const icon = (name, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[name] || glyphs.code}</svg>`;
const esc = (value = "") => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const dataKey = "backend-prep-za.v1";
const defaults = () => ({track:"All", practiced:[], saved:[], assignmentStatus:{}, coach:{}, rehearsals:[]});
let storageAvailable = true;
function readState() {
  try {
    const stored = JSON.parse(localStorage.getItem(dataKey));
    return stored && typeof stored === "object" ? {...defaults(), ...stored} : defaults();
  } catch {
    try { localStorage.getItem(dataKey); } catch { storageAvailable = false; }
    return defaults();
  }
}
let state = readState();
function persist() {
  try { localStorage.setItem(dataKey, JSON.stringify(state)); }
  catch { storageAvailable = false; announce("Browser storage is unavailable. Your progress is available for this session."); }
}
function announce(message) {
  document.getElementById("announcement").textContent = message;
}
const nav = [
  ["overview","Overview","home"],["questions","Question bank","book"],["assignments","Take-home labs","box"],
  ["coach","Interview coach","mic"],["progress","My progress","chart"],["research","Research & sources","globe"]
];
const kinds = ["All questions","Behavioural","Fundamentals","Technical","Live coding","Saved"];
const root = document.querySelector("#app");
let filters = {kind:kinds[0], query:""};
let reveal = new Set();
let menuOpen = false;
let routeTimerKey = "";
let timer = null;
const route = () => {
  const [path, query] = location.hash.replace(/^#\/?/, "").split("?");
  const [first, id] = path.split("/");
  return {page:nav.some(([key]) => key === first) ? first : "overview", id, params:new URLSearchParams(query)};
};
const href = (page, id) => `#${page}${id ? "/" + id : ""}`;
const link = (page, label, variant = "outline", id = "", glyph = "arrow") => `<a class="btn ${variant}" href="${href(page,id)}">${label}${glyph ? icon(glyph,17) : ""}</a>`;
const badge = (label, theme = "") => `<span class="badge ${theme}">${esc(label)}</span>`;
const tile = (glyph, theme) => `<span class="icon-tile ${theme}">${icon(glyph,21)}</span>`;
const getTrack = value => value === "Shared" ? "Both tracks" : value;
const isVisible = entry => state.track === "All" || entry.stack === "Shared" || entry.stack === state.track;
const questionTheme = q => q.stack === "C#" ? "lavender" : q.stack === "Java" ? "peach" : q.kind === "Behavioural" ? "peach" : "green";
const sourceLink = id => {
  const [title, , , url] = sources[id];
  return `<a class="source-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title)} ${icon("external",14)}</a>`;
};
const list = items => `<ul class="detail-list">${items.map(item => `<li>${esc(item)}</li>`).join("")}</ul>`;
const progressCounts = () => [state.practiced.length, Object.values(state.assignmentStatus).filter(value => value === "complete").length, state.rehearsals.length];
const pageHead = (kicker,title,subtitle) => `<header class="page-heading"><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${subtitle}</p></header>`;
function sidebar(page) {
  const navItem = ([key,label,glyph]) => `<a href="${href(key)}" class="nav-link ${page === key ? "active" : ""}" ${page === key ? 'aria-current="page"' : ""}>${icon(glyph,19)}${label}</a>`;
  return `<aside class="sidebar ${menuOpen ? "is-open" : ""}" id="sidebar">
    <a class="brand" href="#overview" aria-label="Backend Prep ZA overview">
      <img src="icon.svg" width="40" height="40" alt=""><span><strong>Backend<span class="brand-accent">Prep</span></strong><small>South Africa</small></span>
    </a>
    <nav class="navigation" aria-label="Main navigation">
      <p class="nav-label">WORKSPACE</p>${nav.slice(0,4).map(navItem).join("")}
      <p class="nav-label second">RESOURCES</p>${nav.slice(4).map(navItem).join("")}
    </nav>
    <div class="sidebar-foot"><span class="save-dot"></span>${storageAvailable ? "Progress saved on this device" : "Progress saved for this session"}</div>
  </aside>`;
}
function topbar(page) {
  return `<header class="topbar"><div class="crumb">
    <button class="icon-btn mobile-menu" type="button" data-action="menu" aria-controls="sidebar" aria-expanded="${menuOpen}" aria-label="${menuOpen ? "Close navigation" : "Open navigation"}">${icon(menuOpen ? "close" : "menu")}</button>
    <span class="crumb-parent">Workspace</span>${icon("chevron",14)}<strong>${nav.find(([key]) => key === page)[1]}</strong></div>
    <div class="track-control"><span class="track-label">Track</span><div class="segments" role="group" aria-label="Language track">
    ${[["All","All tracks"],["C#","C#"],["Java","Java"]].map(([id,label])=>`<button type="button" data-action="track" data-value="${id}" aria-pressed="${state.track === id}">${label}</button>`).join("")}</div></div></header>`;
}
const road = [
  ["Recruiter screen","Prepare a short introduction, your motivation and one project you can discuss.","questions","","chat","peach","Behavioural"],
  ["Technical interview","Explain backend fundamentals and practise thinking aloud through a short exercise.","questions","","code","lavender","Fundamentals"],
  ["Take-home & walkthrough","Build a scoped solution, then explain what you tested and what you’d improve.","assignments","","box","green",""],
  ["Team conversation","Prepare examples of feedback and teamwork, plus a question about how juniors get support.","coach","behavioural","mic","peach",""]
];
function overview() {
  const counts = progressCounts();
  const cards = [
    ["questions","book","lavender","Question bank","Drill behavioural prompts, language fundamentals and live coding with model answers.",`${questions.filter(isVisible).length} practice prompts`],
    ["assignments","box","peach","Take-home labs","Build small, realistic backend projects with clear requirements and review criteria.",`${assignments.filter(isVisible).length} project briefs`],
    ["coach","mic","green","Interview coach","Rehearse a STAR answer, explain a technical decision, or practise a timed project demo.","4 coaching formats"]
  ];
  return `<section class="hero" aria-labelledby="hero-title"><div class="hero-art"></div><div class="hero-content">
      <div class="hero-kicker"><span></span> JUNIOR BACKEND INTERVIEW PREP</div>
      <h1 id="hero-title">Practise the interview.<br><em>Present with confidence.</em></h1>
      <p>Prepare for C# and Java interviews with guided practice built around South African hiring formats.</p>
      <div class="hero-actions">${link("questions","Start practising","lime")}${link("coach","Open coach","hero-outline","","play")}</div>
    </div></section>
    <section class="section-block" aria-labelledby="tools-heading"><div class="section-heading"><h2 id="tools-heading">Your practice toolkit</h2></div>
    <div class="tool-grid">${cards.map(([page,glyph,theme,title,description,foot])=>`<a class="tool-card" href="#${page}">${tile(glyph,theme)}<h3>${title}</h3><p>${description}</p><div class="card-foot"><span>${foot}</span><span class="round-arrow">${icon("arrow",17)}</span></div></a>`).join("")}</div>
    </section>
    <section class="dashboard-grid section-block" aria-label="Interview roadmap and progress">
      <article class="panel roadmap"><header><h2>The interview roadmap</h2><p>Common formats from South African hiring guides and candidate reports.</p></header>
        ${road.map(([title,sub,page,id,glyph,theme,kind])=>`<a class="road-item" href="${href(page,id)}" ${kind ? `data-filter-link="${kind}"` : ""}>${tile(glyph,theme)}<span><strong>${title}</strong><small>${sub}</small></span>${icon("chevron",17)}</a>`).join("")}
      </article>
      <article class="panel dash-progress"><header><h2>Your progress</h2><p>Pick up where you left off.</p></header>
        ${["Questions practised","Labs completed","Rehearsals saved"].map((label,i)=>`<div class="mini-progress"><span>${label}</span><strong>${counts[i]}</strong></div>`).join("")}
        ${link("progress","View my progress","outline")}
      </article>
    </section>`;
}
function filterButtons() {
  return `<div class="filter-row" role="group" aria-label="Question type">${kinds.map(kind => `<button type="button" class="filter" aria-pressed="${filters.kind === kind}" data-action="filter" data-value="${kind}">${kind}</button>`).join("")}</div>`;
}
function visibleQuestions() {
  const tokens = filters.query.trim().toLowerCase().split(/\s+/);
  return questions.filter(q => isVisible(q) && (filters.kind === kinds[0] || q.kind === filters.kind || (filters.kind === "Saved" && state.saved.includes(q.id))) && tokens.every(token => `${q.prompt} ${q.topic} ${q.stack} ${q.kind} ${q.guide}`.toLowerCase().includes(token)));
}
function questionRowsHTML() {
  const matches = visibleQuestions();
  return `<p class="results-count" role="status">${matches.length} ${matches.length === 1 ? "question" : "questions"}</p>${matches.length ? `<div class="question-list">${matches.map(q => `<article class="question-row">
    <a class="question-main" href="${href("questions",q.id)}"><div class="badge-row">${badge(q.kind,questionTheme(q))}<span class="question-topic">${esc(q.topic)}</span></div><h2>${esc(q.prompt)}</h2><span class="track-text">${esc(getTrack(q.stack))}${state.practiced.includes(q.id) ? ` <span class="practised">${icon("check",13)} Practised</span>` : ""}</span></a>
    <button class="icon-btn bookmark" type="button" data-action="bookmark-row" data-value="${q.id}" aria-label="Save question: ${esc(q.prompt)}" aria-pressed="${state.saved.includes(q.id)}">${icon("bookmark",19)}</button>
  </article>`).join("")}</div>` : `<div class="empty">${icon("search",24)}<h2>${filters.kind === "Saved" ? "No saved questions here" : "No matching questions"}</h2><p>${filters.kind === "Saved" ? "Use the bookmark button on a question to save it for later." : "Try a different search, question type or language track."}</p><button type="button" class="btn outline" data-action="clear-filters">View all questions</button></div>`}`;
}
function questionBank() {
  return `${pageHead("PRACTICE","Question bank","Practise explaining your reasoning before revealing the model answer.")}
    <div class="search-control"><label class="sr-only" for="question-search">Search questions</label>${icon("search",19)}<input type="search" id="question-search" placeholder="Search topics, questions or technologies…" value="${esc(filters.query)}"></div>
    ${filterButtons()}<div id="question-results">${questionRowsHTML()}</div>`;
}
function questionDetail(q) {
  const shown = reveal.has(q.id);
  const mode = q.kind === "Behavioural" ? "behavioural" : q.kind === "Live coding" ? "live" : "technical";
  const practised = state.practiced.includes(q.id);
  const marked = state.saved.includes(q.id);
  const pool = visibleQuestions();
  const position = pool.findIndex(item => item.id === q.id);
  const next = pool[(position + 1) % pool.length];
  return `<a class="back-link" href="#questions">${icon("left",17)} Question bank</a>
    <header class="page-heading detail-heading"><div class="badge-row">${badge(q.kind,questionTheme(q))}${badge(getTrack(q.stack))}<span class="question-topic">${esc(q.topic)}</span></div><h1>${esc(q.prompt)}</h1></header>
    <div class="article-layout"><div class="detail-flow">
    <section class="panel detail-panel"><div class="block-title">${tile("bulb","green")}<div><h2>How to approach it</h2><p>Try speaking your answer before you open the example.</p></div></div><p>${esc(q.guide)}</p>
      <button type="button" class="btn outline" data-action="reveal" data-value="${q.id}" aria-controls="model-answer" aria-expanded="${shown}">${shown ? "Hide model answer" : "Reveal model answer"} ${icon("down",17)}</button>
      <div id="model-answer" class="model-answer" ${shown ? "" : "hidden"}><h3>Model answer</h3><p>${esc(q.answer)}</p></div>
    </section>
    <section class="panel detail-panel"><h2>Follow-up question</h2><p>${esc(q.followup)}</p></section>
    <section class="panel detail-panel"><h2>Further reading</h2>${sourceLink(q.source)}</section></div>
    <aside class="panel detail-panel action-panel"><h2>Practise this answer</h2><p>Use the coach to build an outline and rehearse it out loud.</p>
      <a class="btn primary" href="#coach/${mode}?question=${q.id}">Open in coach ${icon("arrow",17)}</a>
      <button class="btn outline" type="button" data-action="practice" data-value="${q.id}" aria-pressed="${practised}">${icon("check",17)} <span>${practised ? "Marked as practised" : "Mark as practised"}</span></button>
      <button class="btn outline bookmark" type="button" data-action="bookmark-detail" data-value="${q.id}" aria-pressed="${marked}">${icon("bookmark",17)} <span>${marked ? "Question saved" : "Save question"}</span></button>
      ${next && next.id !== q.id ? link("questions","Next question","text-btn",next.id) : ""}
    </aside></div>`;
}
function labs() {
  return `${pageHead("BUILD","Take-home labs","Choose a practice brief, timebox your work and prepare to explain what you built.")}
    <div class="lab-grid">${assignments.filter(isVisible).map(a => `<a class="tool-card lab-card" href="${href("assignments",a.id)}"><div class="lab-top">${tile(a.icon,a.theme)}${badge(getTrack(a.stack),a.theme)}</div>
      <h2>${a.title}</h2><p>${a.summary}</p><p class="framework">${a.framework}</p><div class="card-foot"><span>${icon("clock",15)} ${a.time}${state.assignmentStatus[a.id] ? " · " + (state.assignmentStatus[a.id] === "complete" ? "Completed" : "In progress") : ""}</span><span class="round-arrow">${icon("arrow",17)}</span></div></a>`).join("")}</div>
    <div class="callout">${icon("bulb",22)}<p>These original exercises use South African scenarios and public assessment formats. The time estimates are practice targets.</p></div>`;
}
function assignmentDetail(a) {
  const status = state.assignmentStatus[a.id] || "";
  return `<a class="back-link" href="#assignments">${icon("left",17)} Take-home labs</a>
    <header class="page-heading detail-heading"><div class="badge-row">${badge(getTrack(a.stack),a.theme)}${badge(a.framework)}<span class="question-topic">${icon("clock",16)} ${a.time}</span></div><h1>${a.title}</h1><p>${a.summary}</p></header>
    <div class="article-layout"><div class="detail-flow">
      <section class="panel detail-panel"><h2>Project brief</h2><p>${a.brief}</p><h3>Requirements</h3>${list(a.requirements)}<h3>Example run</h3><pre>${esc(a.example)}</pre></section>
      <section class="panel detail-panel"><h2>Tests to include</h2>${list(a.tests)}<h3>What to hand in</h3><p>Submit a repository with source, runnable tests, synthetic fixtures and a README covering setup, commands, assumptions and what you deferred. Include an example request or CLI invocation.</p></section>
      <section class="panel detail-panel"><h2>Walkthrough questions</h2>${list(a.discuss)}<a class="btn outline" href="#coach/walkthrough?assignment=${a.id}">Rehearse the walkthrough ${icon("arrow",17)}</a></section>
    </div><aside class="detail-flow"><section class="panel detail-panel action-panel"><h2>Lab status</h2><label class="sr-only" for="lab-status">Lab status</label>
      <select id="lab-status" data-action="lab-status" data-value="${a.id}"><option value="" ${status === "" ? "selected" : ""}>Not started</option><option value="started" ${status === "started" ? "selected" : ""}>In progress</option><option value="complete" ${status === "complete" ? "selected" : ""}>Completed</option></select>
      <button type="button" class="btn outline" data-action="download" data-value="${a.id}">${icon("file",17)} Download brief</button></section>
      <section class="panel detail-panel"><h2>Review rubric</h2>${list(a.review)}</section>
      <section class="panel detail-panel"><h2>References</h2>${sourceLink(a.source)}${sourceLink(a.tech)}</section>
    </aside></div>`;
}
function coachLanding() {
  return `${pageHead("REHEARSE","Interview coach","Build a speaking outline, rehearse against a timer and review your delivery.")}
    <div class="coach-grid">${Object.entries(coachModes).map(([id,m])=>`<a class="tool-card coach-card" href="#coach/${id}"><div class="lab-top">${tile(m.icon,m.theme)}${badge(m.format,m.theme)}</div><h2>${m.title}</h2><p>${m.description}</p><div class="card-foot"><span>${icon("clock",15)} ${m.time} min practice · ${m.steps.length} steps</span><span class="round-arrow">${icon("arrow",17)}</span></div></a>`).join("")}</div>
    <div class="callout">${icon("bulb",22)}<p>Use a prompt from the question bank or bring a question or project of your own. The coach guides your outline and gives a self-review checklist.</p></div>`;
}
function coachContext(current) {
  const mode = coachModes[current.id];
  const linkedQuestion = questions.find(q => q.id === current.params.get("question"));
  const linkedAssignment = assignments.find(a => a.id === current.params.get("assignment"));
  const key = [current.id,linkedQuestion?.id || linkedAssignment?.id || "custom"].join(":");
  const draft = state.coach[key] || {prompt:"", notes:[], checks:[]};
  const suggested = {behavioural:"Tell me about a difficult bug you fixed.",technical:"How would you prevent a retry from charging twice?",walkthrough:"Walk me through a backend project you built.",live:"Aggregate transaction totals by merchant."};
  return {mode,key,draft,linkedQuestion,linkedAssignment,suggested:suggested[current.id]};
}
function coachFeedback(ctx) {
  const missing = ctx.mode.steps.filter((_,i)=>!ctx.draft.notes[i]?.trim()).map(([label])=>label.split(" · ")[0]);
  const unchecked = ctx.mode.checks.filter((_,i)=>!ctx.draft.checks[i]);
  const passed = ctx.mode.steps.length - missing.length;
  return `<strong>${passed} of ${ctx.mode.steps.length} outline steps filled</strong>${missing.length ? `<p>Next, add a note for ${esc(missing.join(", "))}.</p>` : "<p>Your outline is ready to rehearse aloud. Keep only the details you can explain in the time available.</p>"}${unchecked.length ? `<p>Use these delivery checks during your next run:</p>${list(unchecked)}` : "<p>You checked every delivery item. Practise the follow-up without reading your outline.</p>"}`;
}
function formatRehearsalDate(date) {
  return new Intl.DateTimeFormat("en-ZA",{dateStyle:"medium",timeZone:"Africa/Johannesburg"}).format(new Date(date));
}
function savedRehearsal(id) {
  const record = state.rehearsals.find(item=>item.id === id);
  if (!record) return progressPage();
  const mode = coachModes[record.path.split("?")[0]];
  return `<a class="back-link" href="#progress">${icon("left",17)} My progress</a>
    ${pageHead("SAVED REHEARSAL",esc(record.title),mode.title + " · " + formatRehearsalDate(record.date))}
    <div class="article-layout"><div class="detail-flow">
      ${mode.steps.map(([label],i)=>record.notes[i]?.trim() ? `<section class="panel detail-panel"><h2>${esc(label)}</h2><p class="saved-note">${esc(record.notes[i])}</p></section>` : "").join("")}
    </div><section class="panel detail-panel"><h2>Delivery review</h2>${coachFeedback({mode,draft:record})}
    <a class="btn outline" href="#coach/${esc(record.path)}">Open current outline ${icon("arrow",17)}</a></section></div>`;
}
function coachSession(current) {
  const ctx = coachContext(current);
  const {mode,key,draft,linkedQuestion,linkedAssignment,suggested} = ctx;
  if (routeTimerKey !== key) {
    if (timer?.interval) clearInterval(timer.interval);
    routeTimerKey = key;
    timer = {seconds:mode.time*60, duration:mode.time*60, interval:null, deadline:0};
  }
  return `<a class="back-link" href="#coach">${icon("left",17)} Interview coach</a>
    <header class="page-heading detail-heading"><div class="badge-row">${badge(mode.format,mode.theme)}</div><h1>${mode.title}</h1><p>${mode.description}</p></header>
    <div class="article-layout coach-layout"><div class="detail-flow">
      <section class="panel detail-panel coach-prompt"><h2>Your prompt</h2>
      ${linkedQuestion || linkedAssignment ? `<p class="prompt-text">${esc(linkedQuestion?.prompt || linkedAssignment.title)}</p><p>${esc(linkedQuestion?.guide || linkedAssignment.summary)}</p>` : `<label class="sr-only" for="custom-prompt">Your own interview prompt</label><input type="text" id="custom-prompt" data-action="coach-prompt" maxlength="250" value="${esc(draft.prompt)}" placeholder="Bring your own prompt"><button type="button" class="text-btn inline-sample" data-action="suggest-prompt" data-value="${esc(suggested)}">Use a sample prompt</button>`}
      </section>
      <section class="panel detail-panel"><h2>Build your speaking outline</h2><div class="coach-steps">${mode.steps.map(([title,hint],index)=>`<div class="coach-step"><span class="step-number">${index+1}</span><div><label for="note-${index}">${esc(title)}</label><p>${esc(hint)}</p><textarea id="note-${index}" data-action="coach-note" data-value="${index}" maxlength="3000" rows="2" placeholder="Write a few speaking points…">${esc(draft.notes[index] || "")}</textarea></div></div>`).join("")}</div></section>
      ${linkedQuestion || linkedAssignment ? `<section class="panel detail-panel"><h2>Practise a follow-up</h2>${list(linkedQuestion ? [linkedQuestion.followup] : linkedAssignment.discuss)}</section>` : current.id === "walkthrough" ? `<section class="panel detail-panel"><h2>Practise a follow-up</h2>${list(["Why did you choose this design?", "What happens when a dependency fails?", "What would you prioritise with one more hour?"])}</section>` : ""}
    </div><aside class="detail-flow">
      <section class="panel detail-panel timer-panel"><div class="block-title">${tile("clock","lavender")}<h2>Rehearsal timer</h2></div>
        <div id="timer-readout" class="timer-readout" role="timer">${formatTime(timer.seconds)}</div>
        <p>Speak aloud using your outline.</p><div class="timer-actions"><button class="btn primary" type="button" data-action="timer-toggle">${icon(timer.interval ? "pause" : "play",17)} ${timer.interval ? "Pause" : "Start"}</button><button class="icon-btn timer-reset" type="button" data-action="timer-reset" aria-label="Reset timer">${icon("reset",19)}</button></div>
      </section>
      <section class="panel detail-panel review-panel"><h2>Self-review</h2><p>Check what you heard in your rehearsal.</p>${mode.checks.map((check,i)=>`<label class="check-row"><input type="checkbox" data-action="coach-check" data-value="${i}" ${draft.checks[i] ? "checked" : ""}><span>${esc(check)}</span></label>`).join("")}
        <button type="button" data-action="coach-feedback" class="btn outline">Review my outline ${icon("arrow",17)}</button><div id="coach-feedback" class="feedback" aria-live="polite" hidden></div>
        <button type="button" data-action="coach-save" class="btn primary">${icon("check",17)} Save rehearsal</button>
        <p class="field-notice" id="coach-notice" role="status"></p>
      </section>
    </aside></div>`;
}
function formatTime(seconds) {
  return `${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
}
function paintTimer() {
  const readout = document.getElementById("timer-readout");
  const button = document.querySelector('[data-action="timer-toggle"]');
  if (!readout || !button) return;
  readout.textContent = formatTime(timer.seconds);
  const label = timer.interval ? "Pause" : timer.seconds === timer.duration || timer.seconds === 0 ? "Start" : "Resume";
  if (button.textContent.trim() !== label) button.innerHTML = `${icon(timer.interval ? "pause" : "play",17)} ${label}`;
}
function tick() {
  timer.seconds = Math.max(0, Math.ceil((timer.deadline - Date.now())/1000));
  if (timer.seconds === 0) {
    clearInterval(timer.interval);
    timer.interval = null;
    announce("Rehearsal time is up.");
  }
  paintTimer();
}
function toggleTimer() {
  if (timer.interval) {
    tick();
    clearInterval(timer.interval);
    timer.interval = null;
  } else {
    if (!timer.seconds) timer.seconds = timer.duration;
    timer.deadline = Date.now() + timer.seconds * 1000;
    timer.interval = setInterval(tick, 200);
  }
  paintTimer();
}
function progressPage() {
  const [practiced,complete,rehearsals] = progressCounts();
  const recent = state.rehearsals.slice(0,8);
  const active = assignments.filter(a=>state.assignmentStatus[a.id]);
  const saved = questions.filter(q=>state.saved.includes(q.id));
  return `${pageHead("TRACK","My progress","See what you’ve practised and return to saved work.")}
    <div class="tool-grid progress-grid">${[[practiced,"Questions practised","book","lavender"],[complete,"Labs completed","box","peach"],[rehearsals,"Rehearsals saved","mic","green"]].map(([count,label,glyph,theme])=>`<div class="panel stat-card">${tile(glyph,theme)}<strong>${count}</strong><span>${label}</span></div>`).join("")}</div>
    <div class="dashboard-grid section-block progress-panels">
      <section class="panel detail-panel"><h2>Recent rehearsals</h2>${recent.length ? `<div class="progress-list">${recent.map(record=>`<a href="${record.id ? "#progress/" + esc(record.id) : "#coach/" + esc(record.path)}"><span><strong>${esc(record.title)}</strong><small>${formatRehearsalDate(record.date)} · ${record.filled} outline steps</small></span>${icon("chevron",17)}</a>`).join("")}</div>` : `<p>Save a rehearsal in the coach to see it here.</p>${link("coach","Open interview coach","outline")}`}</section>
      <section class="panel detail-panel"><h2>Your labs</h2>${active.length ? `<div class="progress-list">${active.map(a=>`<a href="#assignments/${a.id}"><span><strong>${a.title}</strong><small>${state.assignmentStatus[a.id] === "complete" ? "Completed" : "In progress"}</small></span>${icon("chevron",17)}</a>`).join("")}</div>` : `<p>Change a lab’s status to track it here.</p>${link("assignments","Browse labs","outline")}`}</section>
      <section class="panel detail-panel"><h2>Saved questions</h2>${saved.length ? `<div class="progress-list">${saved.map(q=>`<a href="#questions/${q.id}"><span><strong>${esc(q.prompt)}</strong><small>${q.kind} · ${esc(getTrack(q.stack))}</small></span>${icon("chevron",17)}</a>`).join("")}</div>` : `<p>Bookmark questions to come back to them later.</p>${link("questions","Browse questions","outline")}`}</section>
    </div>`;
}
function researchPage() {
  function group(title,ids) {
    return `<section class="section-block"><div class="section-heading"><h2>${title}</h2></div><div class="source-grid">${ids.map(id=>{
      const [name,publisher,type,url,summary] = sources[id];
      return `<a class="panel source-card" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><span class="source-meta">${esc(publisher)} · ${esc(type)}</span><h3>${esc(name)} ${icon("external",17)}</h3><p>${esc(summary)}</p></a>`;
    }).join("")}</div></section>`;
  }
  return `${pageHead("SOUTH AFRICAN HIRING","Research &amp; sources","See which public sources shaped the practice formats and read the technical references.")}
    <div class="callout">${icon("globe",22)}<p>Employers set their own interview stages and tool rules. Candidate stories describe individual experiences. The app’s questions and briefs are original practice material informed by these sources.</p></div>
    ${group("Employer, recruiter and blog guidance",["entelect","bbd","warp","offerzen","hiring","behaviour","coding","blog"])}
    ${group("Public candidate reports",["recap","reddit"])}
    ${group("Technical references",["dotnet","async","ef","spring","jpa","java","http","sql"])}`;
}
function render(focus = false) {
  const current = route();
  const {page,id} = current;
  const q = questions.find(item=>item.id === id);
  const a = assignments.find(item=>item.id === id);
  if ((page !== "coach" || !coachModes[id]) && timer) {
    if (timer.interval) clearInterval(timer.interval);
    timer = null;
    routeTimerKey = "";
  }
  const views = {overview, questions:()=>q ? questionDetail(q) : questionBank(), assignments:()=>a ? assignmentDetail(a) : labs(),
    coach:()=>Object.hasOwn(coachModes,id) ? coachSession(current) : coachLanding(), progress:()=>id ? savedRehearsal(id) : progressPage(), research:researchPage};
  root.innerHTML = `${sidebar(page)}<div class="shell">${topbar(page)}<main class="content" id="content" tabindex="-1">${views[page]()}</main></div>`;
  document.title = page === "overview" ? "Backend Prep ZA" : `${nav.find(([key])=>key === page)[1]} · Backend Prep ZA`;
  if (focus) {
    window.scrollTo(0,0);
    document.getElementById("content").focus({preventScroll:true});
  }
}
function writeDraft(change) {
  const {key,draft} = coachContext(route());
  state.coach[key] = draft;
  change(draft);
  persist();
}
function toggleValue(values,id) {
  const index = values.indexOf(id);
  if (index === -1) values.push(id);
  else values.splice(index,1);
  persist();
  return index === -1;
}
function downloadBrief(a) {
  const lines = items => items.map(item=>"- " + item).join("\n");
  const text = `# ${a.title}\n\n${a.framework} · ${a.time}\n\n${a.brief}\n\n## Requirements\n\n${lines(a.requirements)}\n\n## Example run\n\n${a.example}\n\n## Tests to include\n\n${lines(a.tests)}\n\n## What to hand in\n\nSource, runnable tests, synthetic fixtures and a README with setup, commands, assumptions, scope decisions and an example invocation.\n\n## Review rubric\n\n${lines(a.review)}\n\n## Walkthrough questions\n\n${lines(a.discuss)}\n\n## References\n\n${sources[a.source][3]}\n${sources[a.tech][3]}\n`;
  const url = URL.createObjectURL(new Blob([text], {type:"text/markdown;charset=utf-8"}));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${a.id}-take-home-brief.md`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function saveRehearsal() {
  const current = route();
  const ctx = coachContext(current);
  const filled = ctx.mode.steps.filter((_,i)=>ctx.draft.notes[i]?.trim()).length;
  const notice = document.getElementById("coach-notice");
  if (!filled) {
    notice.textContent = "Add at least one speaking point to save this rehearsal.";
    return;
  }
  const title = ctx.linkedQuestion?.prompt || ctx.linkedAssignment?.title || ctx.draft.prompt.trim() || ctx.mode.title;
  const query = ctx.linkedQuestion ? "?question=" + ctx.linkedQuestion.id : ctx.linkedAssignment ? "?assignment=" + ctx.linkedAssignment.id : "";
  const date = new Date().toISOString();
  const id = Date.now().toString(36) + "-" + state.rehearsals.length.toString(36);
  state.rehearsals.unshift({id,title,path:current.id+query,date,filled,notes:[...ctx.draft.notes],checks:[...ctx.draft.checks]});
  if (ctx.linkedQuestion && !state.practiced.includes(ctx.linkedQuestion.id)) state.practiced.push(ctx.linkedQuestion.id);
  persist();
  notice.textContent = storageAvailable ? "Rehearsal saved to My progress." : "Rehearsal saved for this session.";
}
function refreshQuestions() {
  const results = document.getElementById("question-results");
  if (results) results.innerHTML = questionRowsHTML();
}
const actions = {
  menu(button) {
    menuOpen = !menuOpen;
    document.getElementById("sidebar").classList.toggle("is-open",menuOpen);
    button.setAttribute("aria-expanded", menuOpen);
    button.setAttribute("aria-label", menuOpen ? "Close navigation" : "Open navigation");
    button.innerHTML = icon(menuOpen ? "close" : "menu");
  },
  track(button,value) {
    state.track = value;
    persist();
    render();
    document.querySelector(`[data-action="track"][data-value="${value}"]`).focus();
    announce(`Showing ${value === "All" ? "all tracks" : value + " and shared topics"}.`);
  },
  filter(button,value) {
    filters.kind = value;
    document.querySelectorAll(".filter").forEach(filter=>filter.setAttribute("aria-pressed",filter === button));
    refreshQuestions();
  },
  "clear-filters"() {
    filters = {kind:kinds[0],query:""};
    render();
    document.getElementById("question-search").focus();
  },
  "bookmark-row"(button,id) {
    const on = toggleValue(state.saved,id);
    if (!on && filters.kind === "Saved") {
      refreshQuestions();
      document.querySelector('#question-results .bookmark, #question-results .btn')?.focus();
    } else button.setAttribute("aria-pressed",on);
    announce(on ? "Question saved." : "Question removed from saved questions.");
  },
  "bookmark-detail"(button,id) {
    const on = toggleValue(state.saved,id);
    button.setAttribute("aria-pressed",on);
    button.querySelector("span").textContent = on ? "Question saved" : "Save question";
    announce(on ? "Question saved." : "Question removed from saved questions.");
  },
  practice(button,id) {
    const on = toggleValue(state.practiced,id);
    button.setAttribute("aria-pressed",on);
    button.querySelector("span").textContent = on ? "Marked as practised" : "Mark as practised";
    announce(on ? "Question marked as practised." : "Practice mark removed.");
  },
  reveal(button,id) {
    if (reveal.has(id)) reveal.delete(id);
    else reveal.add(id);
    const shown = reveal.has(id);
    button.setAttribute("aria-expanded",shown);
    button.innerHTML = `${shown ? "Hide model answer" : "Reveal model answer"} ${icon("down",17)}`;
    document.getElementById("model-answer").hidden = !shown;
  },
  download(button,id) { downloadBrief(assignments.find(a=>a.id === id)); },
  "suggest-prompt"(button,value) {
    const field = document.getElementById("custom-prompt");
    field.value = value;
    writeDraft(draft=>{ draft.prompt = value; });
    field.focus();
  },
  "timer-toggle":toggleTimer,
  "timer-reset"() {
    clearInterval(timer.interval);
    timer.interval = null;
    timer.seconds = timer.duration;
    paintTimer();
  },
  "coach-feedback"() {
    const node = document.getElementById("coach-feedback");
    node.hidden = false;
    node.innerHTML = coachFeedback(coachContext(route()));
  },
  "coach-save":saveRehearsal
};
root.addEventListener("click",event=>{
  const filtered = event.target.closest("[data-filter-link]");
  if (filtered) filters = {kind:filtered.dataset.filterLink,query:""};
  const navLink = event.target.closest(".sidebar a");
  if (navLink && menuOpen) {
    menuOpen = false;
    if (navLink.hash === location.hash) render(true);
  }
  const button = event.target.closest("button[data-action]");
  if (button) actions[button.dataset.action]?.(button,button.dataset.value);
});
root.addEventListener("input",event=>{
  const el = event.target;
  if (el.id === "question-search") {
    filters.query = el.value;
    refreshQuestions();
  }
  if (el.dataset.action === "coach-note") writeDraft(draft=>{ draft.notes[Number(el.dataset.value)] = el.value; });
  if (el.dataset.action === "coach-prompt") writeDraft(draft=>{ draft.prompt = el.value; });
  if (el.dataset.action === "coach-note" || el.dataset.action === "coach-prompt") {
    document.getElementById("coach-notice").textContent = "";
    const feedback = document.getElementById("coach-feedback");
    if (!feedback.hidden) feedback.innerHTML = coachFeedback(coachContext(route()));
  }
});
root.addEventListener("change",event=>{
  const el = event.target;
  if (el.dataset.action === "lab-status") {
    if (el.value) state.assignmentStatus[el.dataset.value] = el.value;
    else delete state.assignmentStatus[el.dataset.value];
    persist();
    announce("Lab status saved.");
  }
  if (el.dataset.action === "coach-check") {
    writeDraft(draft=>{ draft.checks[Number(el.dataset.value)] = el.checked; });
    const feedback = document.getElementById("coach-feedback");
    if (!feedback.hidden) feedback.innerHTML = coachFeedback(coachContext(route()));
  }
});
window.addEventListener("hashchange",()=>render(true));
document.querySelector(".skip").addEventListener("click",event=>{
  event.preventDefault();
  document.getElementById("content").focus();
});
render();
