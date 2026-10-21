"use strict";

window.WMCalendar = (() => {
const DEFAULT_SELECTORS = {
  title: "#calendarTitle", content: "#calendarContent", dialog: "#eventDialog", form: "#eventForm",
  eventTitle: "#eventTitle", eventStart: "#eventStart", eventEnd: "#eventEnd", eventColor: "#eventColor",
  error: "#dialogError", deleteButton: "#deleteEventBtn", dialogTitle: "#dialogTitle",
  previous: "#prevBtn", next: "#nextBtn", today: "#todayBtn", close: "#closeDialogBtn",
  cancel: "#cancelBtn", viewButtons: ".view-button"
};

const CALENDAR_MARKUP = `
  <header class="toolbar">
    <div class="toolbar__brand"><span class="brand-mark" aria-hidden="true">▦</span><h1>Calendrier</h1></div>
    <div class="toolbar__navigation">
      <button class="button button--today" id="todayBtn" type="button">Aujourd’hui</button>
      <div class="nav-arrows" aria-label="Naviguer dans le calendrier">
        <button class="icon-button" id="prevBtn" type="button" aria-label="Période précédente">‹</button>
        <button class="icon-button" id="nextBtn" type="button" aria-label="Période suivante">›</button>
      </div>
      <h2 id="calendarTitle" aria-live="polite"></h2>
    </div>
    <div class="toolbar__view" role="group" aria-label="Choisir une vue">
      <button class="view-button is-active" data-view="month" type="button">Mois</button>
      <button class="view-button" data-view="week" type="button">Semaine</button>
      <button class="view-button" data-view="year" type="button">Année</button>
    </div>
  </header>
  <section class="calendar-content" id="calendarContent" aria-label="Vue du calendrier"></section>
  <p class="calendar-hint">Cliquez sur une date ou un créneau pour ajouter un événement. Dans la vue Mois, faites glisser la souris sur plusieurs jours pour créer un événement sur toute la plage. Cliquez sur un événement pour le modifier ou le supprimer.</p>
  <dialog class="event-dialog" id="eventDialog" aria-labelledby="dialogTitle">
    <form id="eventForm">
      <div class="dialog-header"><div><p class="dialog-eyebrow">Événement</p><h2 id="dialogTitle">Ajouter un événement</h2></div><button class="icon-button dialog-close" id="closeDialogBtn" type="button" aria-label="Fermer">×</button></div>
      <label>Titre<input id="eventTitle" name="title" type="text" maxlength="80" placeholder="Ex. Réunion d’équipe" required></label>
      <div class="form-row"><label>Début<input id="eventStart" name="start" type="datetime-local" required></label><label>Fin<input id="eventEnd" name="end" type="datetime-local" required></label></div>
      <label>Couleur<select id="eventColor" name="color"><option value="blue">Bleu</option><option value="violet">Violet</option><option value="green">Vert</option><option value="orange">Orange</option><option value="rose">Rose</option></select></label>
      <p class="dialog-error" id="dialogError" role="alert"></p>
      <div class="dialog-actions"><button class="button button--danger" id="deleteEventBtn" type="button" hidden>Supprimer</button><span class="dialog-actions__spacer"></span><button class="button button--secondary" id="cancelBtn" type="button">Annuler</button><button class="button button--primary" type="submit">Enregistrer</button></div>
    </form>
  </dialog>`;

/** Crée un calendrier autonome dans l'élément fourni. */
function create(root, options = {}) {
  if (typeof root === "string") root = document.querySelector(root);
  if (!root || typeof root.querySelector !== "function") throw new TypeError("Un élément racine de calendrier est requis.");

  const selectors = {...DEFAULT_SELECTORS, ...options.selectors};
  if (root.childElementCount === 0) {
    root.classList.add("calendar");
    root.setAttribute("aria-label", "Calendrier");
    root.innerHTML = CALENDAR_MARKUP;
  }
  const element = name => root.querySelector(selectors[name]);
  const requiredElements = Object.keys(DEFAULT_SELECTORS).filter(name => name !== "viewButtons");
  for (const name of requiredElements) {
    if (!element(name)) throw new Error(`Élément de calendrier introuvable : ${selectors[name]}`);
  }

  const HOUR_HEIGHT = options.hourHeight ?? 56, FIRST_HOUR = options.firstHour ?? 7, LAST_HOUR = options.lastHour ?? 21;
  const WEEKDAYS = options.weekdays ?? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  const LOCALE = options.locale ?? "fr-FR";
  const COLORS = {
    blue:{bg:"#eaf0ff",text:"#4058bd",edge:"#6077e8"}, violet:{bg:"#f1ebff",text:"#734fc1",edge:"#9870e8"},
    green:{bg:"#e8f7f0",text:"#27825b",edge:"#40ae7b"}, orange:{bg:"#fff2e5",text:"#b86c24",edge:"#ed9b4b"}, rose:{bg:"#ffedf0",text:"#b94e68",edge:"#df738c"},
    ...options.colors
  };
  const todayValue = options.today ? new Date(options.today) : new Date();
  if (Number.isNaN(todayValue.getTime())) throw new TypeError("La date du jour est invalide.");
  const today = startOfDay(todayValue);
  const initialDate = options.initialDate ? new Date(options.initialDate) : today;
  if (Number.isNaN(initialDate.getTime())) throw new TypeError("La date initiale est invalide.");
  let currentDate = startOfDay(initialDate);
  let currentView = options.view ?? "month", editingEventId = null;
  let events = (options.events ?? []).map(normalizeEvent);
  const backgroundRanges = (options.backgroundRanges ?? []).map(normalizeBackgroundRange);
  if (!["month", "week", "year"].includes(currentView)) throw new RangeError("La vue doit être month, week ou year.");
  const titleElement = element("title"), contentElement = element("content"), dialog = element("dialog"), form = element("form");
  const titleInput = element("eventTitle"), startInput = element("eventStart"), endInput = element("eventEnd");
  const colorInput = element("eventColor"), errorElement = element("error"), deleteButton = element("deleteButton");
  const viewButtons = root.querySelectorAll(selectors.viewButtons);
  const listenerController = new AbortController();
  let monthSelection = null, suppressMonthClick = false, suppressMonthClickTimer;
  viewButtons.forEach(button => button.classList.toggle("is-active", button.dataset.view === currentView));

  function listen(target, type, handler) {
    target.addEventListener(type, handler, {signal: listenerController.signal});
  }

  listen(element("previous"), "click", () => movePeriod(-1));
  listen(element("next"), "click", () => movePeriod(1));
  listen(element("today"), "click", () => { currentDate = new Date(today); render(); });
  viewButtons.forEach(button => listen(button, "click", () => setView(button.dataset.view)));
  listen(contentElement, "click", event => {
    if (currentView !== "year") return;
    const monthButton = event.target.closest("[data-year-month]");
    if (monthButton) {
      currentDate = new Date(currentDate.getFullYear(), Number(monthButton.dataset.yearMonth), 1);
      setView("month");
      return;
    }
    const dateButton = event.target.closest("[data-year-date]");
    if (dateButton) {
      currentDate = startOfDay(fromDateTime(dateButton.dataset.yearDate));
      setView("month");
    }
  });
  listen(contentElement, "pointerdown", event => {
    if (currentView !== "month" || event.button !== 0 || event.target.closest("[data-event-id]")) return;
    const cell = event.target.closest(".month-cell");
    if (!cell) return;
    const date = startOfDay(fromDateTime(cell.dataset.date));
    monthSelection = {pointerId: event.pointerId, start: date, end: date, moved: false};
    contentElement.classList.add("is-selecting-range");
  });
  listen(document, "pointermove", event => {
    if (!monthSelection || event.pointerId !== monthSelection.pointerId) return;
    const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest(".month-cell");
    if (!cell) return;
    const date = startOfDay(fromDateTime(cell.dataset.date));
    if (!sameDay(date, monthSelection.end)) {
      monthSelection.end = date;
      monthSelection.moved = true;
      updateMonthSelection();
      if (monthSelection.moved) event.preventDefault();
    }
  });
  listen(document, "pointerup", event => {
    if (!monthSelection || event.pointerId !== monthSelection.pointerId) return;
    const selection = monthSelection;
    monthSelection = null;
    contentElement.classList.remove("is-selecting-range");
    updateMonthSelection();
    if (!selection.moved) return;
    suppressMonthClick = true;
    clearTimeout(suppressMonthClickTimer);
    suppressMonthClickTimer = setTimeout(() => { suppressMonthClick = false; }, 100);
    const start = selection.start < selection.end ? selection.start : selection.end;
    const lastDay = selection.start > selection.end ? selection.start : selection.end;
    openCreateDialog(start, addDays(lastDay, 1));
  });
  listen(document, "pointercancel", event => {
    if (!monthSelection || event.pointerId !== monthSelection.pointerId) return;
    monthSelection = null;
    contentElement.classList.remove("is-selecting-range");
    updateMonthSelection();
  });
  listen(element("close"), "click", closeDialog);
  listen(element("cancel"), "click", closeDialog);
  listen(deleteButton, "click", deleteCurrentEvent);
  listen(form, "submit", saveEvent);
  listen(dialog, "click", event => { if (event.target === dialog) closeDialog(); });
  render();

  return {
    render,
    setView,
    setDate,
    previous: () => movePeriod(-1),
    next: () => movePeriod(1),
    today: () => { currentDate = new Date(today); render(); },
    getEvents,
    addEvent,
    updateEvent,
    removeEvent,
    destroy() {
      listenerController.abort();
      closeDialog();
    }
  };

  function setView(view) {
    if (!["month", "week", "year"].includes(view)) throw new RangeError("La vue doit être month, week ou year.");
    currentView = view;
    viewButtons.forEach(button => button.classList.toggle("is-active", button.dataset.view === view));
    render();
  }

  function setDate(date) {
    const nextDate = new Date(date);
    if (Number.isNaN(nextDate.getTime())) throw new TypeError("La date du calendrier est invalide.");
    currentDate = startOfDay(nextDate);
    render();
  }

  function getEvents() {
    return events.map(event => ({...event, start: new Date(event.start), end: new Date(event.end)}));
  }

  function addEvent(event) {
    const normalized = normalizeEvent(event);
    if (events.some(item => item.id === normalized.id)) throw new Error(`Un événement avec l'identifiant ${normalized.id} existe déjà.`);
    events.push(normalized);
    render();
    notifyChange("add", normalized);
    return {...normalized, start: new Date(normalized.start), end: new Date(normalized.end)};
  }

  function updateEvent(id, changes) {
    const index = events.findIndex(event => event.id === String(id));
    if (index === -1) return null;
    const updated = normalizeEvent({...events[index], ...changes, id});
    events[index] = updated;
    render();
    notifyChange("update", updated);
    return {...updated, start: new Date(updated.start), end: new Date(updated.end)};
  }

  function removeEvent(id) {
    const index = events.findIndex(event => event.id === String(id));
    if (index === -1) return false;
    const [removed] = events.splice(index, 1);
    render();
    notifyChange("remove", removed);
    return true;
  }

  function notifyChange(action, event) {
    if (typeof options.onChange === "function") {
      options.onChange({action, event: {...event, start: new Date(event.start), end: new Date(event.end)}, events: getEvents()});
    }
  }

  function normalizeEvent(event) {
    const start = new Date(event.start), end = new Date(event.end), title = String(event.title ?? "").trim();
    if (!title) throw new TypeError("Un événement doit avoir un titre.");
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      throw new RangeError("La date de fin doit être postérieure à la date de début.");
    }
    return {id: String(event.id ?? createEventId()), title, start, end, color: event.color ?? "blue"};
  }

  function normalizeBackgroundRange(range) {
    const start = normalizeCalendarDate(range.start), end = normalizeCalendarDate(range.end);
    const title = String(range.title ?? "").trim();
    if (!title) throw new TypeError("Une plage de dates doit avoir un titre.");
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      throw new RangeError("La date de fin d'une plage doit être égale ou postérieure à la date de début.");
    }
    return {title, start, end};
  }

  function normalizeCalendarDate(value) {
    if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        return new Date(NaN);
      }
      return date;
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? date : startOfDay(date);
  }

  function backgroundRangesForDate(date) {
    return backgroundRanges.filter(range => date >= range.start && date <= range.end);
  }

  function createEventId() {
    return `event-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

/** Retourne une nouvelle date positionnée au début du jour indiqué. */
function startOfDay(date){return new Date(date.getFullYear(),date.getMonth(),date.getDate());}
/** Décale une date d'un nombre donné de jours, sans modifier la date d'origine. */
function addDays(date,amount){const result=new Date(date);result.setDate(result.getDate()+amount);return result;}
/** Décale une date d'un nombre de mois et la positionne au premier du mois obtenu. */
function addMonths(date,amount){return new Date(date.getFullYear(),date.getMonth()+amount,1);}
/** Indique si deux dates correspondent au même jour du calendrier. */
function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
/** Détermine si un événement commence et finit à minuit, donc couvre une journée entière. */
function isAllDay(event){return event.start.getHours()===0&&event.start.getMinutes()===0&&event.end.getHours()===0&&event.end.getMinutes()===0;}
/** Formate une date pour les champs de formulaire de type date et heure locale. */
function formatDateTime(date){
  // Complète chaque composante numérique avec un zéro si nécessaire.
  const pad=n=>String(n).padStart(2,"0");
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
/** Convertit la valeur locale d'un champ date-heure en objet Date. */
function fromDateTime(value){const [d,t]=value.split("T"),[y,m,day]=d.split("-").map(Number),[h,min]=t.split(":").map(Number);return new Date(y,m-1,day,h,min);}
/** Formate une heure selon les conventions françaises, sans afficher les secondes. */
function formatTime(date){return date.toLocaleTimeString(LOCALE,{hour:"2-digit",minute:"2-digit"});}
/** Produit les variables CSS correspondant à la couleur d'un événement. */
function eventStyle(event){const color=COLORS[event.color]||COLORS.blue;return `--event-bg:${color.bg};--event-text:${color.text};--event-color:${color.edge}`;}
/** Renvoie les événements qui chevauchent l'intervalle [start, end). */
function visibleEvents(start,end){return events.filter(event=>event.start<end&&event.end>start);}
/** Déplace la période affichée selon la vue active, puis actualise le calendrier. */
function movePeriod(direction){
  if(currentView==="year"){
    const year=currentDate.getFullYear()+direction, month=currentDate.getMonth();
    currentDate=new Date(year,month,Math.min(currentDate.getDate(),new Date(year,month+1,0).getDate()));
  }
  else if(currentView==="month")currentDate=addMonths(currentDate,direction);
  else currentDate=addDays(currentDate,direction*7);
  render();
}
/** Choisit et affiche le rendu adapté à la vue calendrier sélectionnée. */
function render(){if(currentView==="year")renderYear();else if(currentView==="month")renderMonth();else renderTimeView();}

/** Construit une vue annuelle compacte avec navigation vers chacun des mois et jours. */
function renderYear(){
  const year=currentDate.getFullYear();
  titleElement.textContent=String(year);
  contentElement.innerHTML=`<div class="year-grid" aria-label="Calendrier de l’année ${year}">
    ${Array.from({length:12},(_,month)=>{
      const firstOfMonth=new Date(year,month,1), daysInMonth=new Date(year,month+1,0).getDate();
      const mondayOffset=(firstOfMonth.getDay()+6)%7;
      const monthName=firstOfMonth.toLocaleDateString(LOCALE,{month:"long"});
      return `<section class="year-month" aria-label="${escapeHtml(monthName)} ${year}">
        <button class="year-month-title" type="button" data-year-month="${month}">${escapeHtml(monthName)}</button>
        <div class="year-month-grid" role="grid" aria-label="${escapeHtml(monthName)} ${year}">
          ${WEEKDAYS.map(day=>`<span class="year-weekday" aria-hidden="true">${escapeHtml(day.slice(0,2))}</span>`).join("")}
          ${Array.from({length:mondayOffset},()=>`<span class="year-day year-day--empty" aria-hidden="true"></span>`).join("")}
          ${Array.from({length:daysInMonth},(_,index)=>{
            const date=new Date(year,month,index+1), nextDate=addDays(date,1);
            const hasEvents=visibleEvents(date,nextDate).length>0;
            const classes=["year-day",sameDay(date,today)?"is-today":"",hasEvents?"has-events":""].filter(Boolean).join(" ");
            return `<button class="${classes}" type="button" data-year-date="${formatDateTime(date)}" aria-label="${escapeHtml(date.toLocaleDateString(LOCALE,{day:"numeric",month:"long",year:"numeric"}))}${hasEvents?", événements prévus":""}">${index+1}</button>`;
          }).join("")}
        </div>
      </section>`;
    }).join("")}
  </div>`;
}

/** Construit la grille mensuelle et relie ses cases et événements aux actions. */
function renderMonth(){
  titleElement.textContent=currentDate.toLocaleDateString(LOCALE,{month:"long",year:"numeric"});
  const firstOfMonth=new Date(currentDate.getFullYear(),currentDate.getMonth(),1);
  // La grille commence le lundi de la semaine contenant le premier jour du mois.
  // getDay() renvoie 0 pour dimanche ; le modulo décale correctement vers lundi.
  const mondayOffset=(firstOfMonth.getDay()+6)%7, gridStart=addDays(firstOfMonth,-mondayOffset);
  const lastOfMonth=new Date(currentDate.getFullYear(),currentDate.getMonth()+1,0);
  // On complète les semaines entières : le nombre de cases est toujours un multiple de 7.
  const gridEnd=addDays(lastOfMonth,6-((lastOfMonth.getDay()+6)%7));
  const dayCount=Math.round((gridEnd-gridStart)/86400000)+1;
  contentElement.innerHTML=`<div class="month-grid" role="grid" aria-label="${escapeHtml(titleElement.textContent)}">
    ${WEEKDAYS.map(day=>`<div class="weekday" role="columnheader">${day}</div>`).join("")}
    ${Array.from({length:dayCount},(_,index)=>{
      const date=addDays(gridStart,index), nextDate=addDays(date,1);
      const found=visibleEvents(date,nextDate), allDay=found.filter(isAllDay), timed=found.filter(event=>!isAllDay(event));
      const shown=[...allDay,...timed].slice(0,3), more=allDay.length+timed.length-shown.length;
      const dateRanges=backgroundRangesForDate(date);
      const classes=["month-cell",date.getMonth()!==currentDate.getMonth()?"is-outside":"",sameDay(date,today)?"is-today":"",dateRanges.length?"has-background-range":""].filter(Boolean).join(" ");
      const defaultDate=new Date(date.getFullYear(),date.getMonth(),date.getDate(),9);
      const rangeTitles=dateRanges.map(range=>range.title).join(", ");
      return `<div class="${classes}" role="gridcell" data-date="${formatDateTime(defaultDate)}"${rangeTitles?` title="${escapeHtml(rangeTitles)}" aria-label="${escapeHtml(date.toLocaleDateString(LOCALE,{dateStyle:"full"}))} : ${escapeHtml(rangeTitles)}"`:""}><span class="day-number">${date.getDate()}</span>
        ${shown.map(event=>`<button class="event-chip" type="button" data-event-id="${escapeHtml(event.id)}" style="${eventStyle(event)}" title="${escapeHtml(event.title)}">${isAllDay(event)?"":`${formatTime(event.start)} `}${escapeHtml(event.title)}</button>`).join("")}
        ${more>0?`<div class="more-events">+ ${more} autre${more>1?"s":""}</div>`:""}</div>`;
    }).join("")}</div><div class="calendar-legend"><span class="calendar-legend__swatch" aria-hidden="true"></span>Vacances scolaires</div>`;
  contentElement.querySelectorAll(".month-cell").forEach(cell=>listen(cell,"click",event=>{
    if(suppressMonthClick){suppressMonthClick=false;clearTimeout(suppressMonthClickTimer);return;}
    if(event.target.closest("[data-event-id]"))return;const start=fromDateTime(cell.dataset.date);openCreateDialog(start,new Date(start.getTime()+3600000));
  }));
  updateMonthSelection();
  bindEventButtons();
}

function updateMonthSelection(){
  contentElement.querySelectorAll(".month-cell").forEach(cell=>{
    const date=startOfDay(fromDateTime(cell.dataset.date));
    const start=monthSelection?monthSelection.start:null,end=monthSelection?monthSelection.end:null;
    cell.classList.toggle("is-range-selected",!!start&&date>= (start<end?start:end)&&date<= (start>end?start:end));
  });
}

/** Calcule le lundi de la semaine contenant la date indiquée. */
function startOfWeek(date){return addDays(startOfDay(date),-((date.getDay()+6)%7));}
/** Construit la vue hebdomadaire avec ses créneaux horaires. */
function renderTimeView(){
  const weekStart=startOfWeek(currentDate);
  const dates=Array.from({length:7},(_,index)=>addDays(weekStart,index)), rangeEnd=addDays(dates[dates.length-1],1);
  const weekEnd=addDays(weekStart,6);
  titleElement.textContent=`${weekStart.toLocaleDateString(LOCALE,{day:"numeric",month:"short"})} – ${weekEnd.toLocaleDateString(LOCALE,{day:"numeric",month:"short",year:"numeric"})}`;
  const allDayEvents=visibleEvents(weekStart,rangeEnd).filter(isAllDay);
  const headers=dates.map((date,index)=>`<div class="time-day-heading ${sameDay(date,today)?"is-today":""}">${WEEKDAYS[index]}<strong>${date.getDate()}</strong></div>`).join("");
  const rows=[];
  for(let hour=FIRST_HOUR;hour<LAST_HOUR;hour++)rows.push(`<div class="time-row"><div class="time-label">${String(hour).padStart(2,"0")}:00</div>${dates.map(date=>`<div class="time-slot" data-date="${formatDateTime(new Date(date.getFullYear(),date.getMonth(),date.getDate(),hour))}" aria-label="${date.toLocaleDateString(LOCALE)} à ${hour} heures">${hour===FIRST_HOUR?renderTimedEvents(date):""}</div>`).join("")}</div>`);
  contentElement.innerHTML=`<div class="time-grid" style="--columns:7;--hour-height:${HOUR_HEIGHT}px"><div class="time-header"><div class="time-header-spacer"></div>${headers}</div>
    <div class="all-day-row"><div class="all-day-label">Journée</div>${dates.map(date=>`<div class="all-day-cell">${allDayEvents.filter(event=>event.start<addDays(date,1)&&event.end>date).map(event=>`<button class="all-day-event" type="button" data-event-id="${escapeHtml(event.id)}" style="${eventStyle(event)}">${escapeHtml(event.title)}</button>`).join("")}</div>`).join("")}</div>${rows.join("")}</div>`;
  contentElement.querySelectorAll(".time-slot").forEach(slot=>listen(slot,"click",event=>{
    if(event.target.closest("[data-event-id]"))return;const start=fromDateTime(slot.dataset.date);openCreateDialog(start,new Date(start.getTime()+3600000));
  }));
  bindEventButtons();
}
/** Génère les événements horaires visibles dans la colonne d'une journée. */
function renderTimedEvents(date){
  const dayStart=startOfDay(date), nextDay=addDays(dayStart,1);
  return visibleEvents(dayStart,nextDay).filter(event=>!isAllDay(event)).map(event=>{
    const startMinutes=event.start.getHours()*60+event.start.getMinutes();
    const endMinutes=event.end.getTime()>nextDay.getTime()?LAST_HOUR*60:event.end.getHours()*60+event.end.getMinutes();
    const visibleStart=Math.max(startMinutes,FIRST_HOUR*60),visibleEnd=Math.min(endMinutes,LAST_HOUR*60);
    if(visibleEnd<=visibleStart)return "";
    const top=((visibleStart-FIRST_HOUR*60)/60)*HOUR_HEIGHT,height=Math.max(22,((visibleEnd-visibleStart)/60)*HOUR_HEIGHT-3);
    return `<button class="timed-event" type="button" data-event-id="${escapeHtml(event.id)}" style="${eventStyle(event)};top:${top}px;height:${height}px" title="${escapeHtml(event.title)}">${escapeHtml(event.title)}<span>${formatTime(event.start)}–${formatTime(event.end)}</span></button>`;
  }).join("");
}
/** Attache le clic d'ouverture aux boutons représentant des événements. */
function bindEventButtons(){contentElement.querySelectorAll("[data-event-id]").forEach(button=>listen(button,"click",event=>{event.stopPropagation();openEditDialog(button.dataset.eventId);}));}
/** Prépare et ouvre la boîte de dialogue pour créer un événement. */
function openCreateDialog(start,end){editingEventId=null;form.reset();element("dialogTitle").textContent="Ajouter un événement";titleInput.value="";startInput.value=formatDateTime(start);endInput.value=formatDateTime(end);colorInput.value="blue";deleteButton.hidden=true;errorElement.textContent="";dialog.showModal();titleInput.focus();}
/** Charge les données de l'événement choisi dans la boîte de modification. */
function openEditDialog(id){const event=events.find(item=>item.id===id);if(!event)return;editingEventId=id;element("dialogTitle").textContent="Modifier l’événement";titleInput.value=event.title;startInput.value=formatDateTime(event.start);endInput.value=formatDateTime(event.end);colorInput.value=event.color;deleteButton.hidden=false;errorElement.textContent="";dialog.showModal();titleInput.focus();}
/** Valide le formulaire, crée ou met à jour l'événement, puis rafraîchit la vue. */
function saveEvent(event){
  event.preventDefault();const title=titleInput.value.trim(),start=fromDateTime(startInput.value),end=fromDateTime(endInput.value);
  if(!title){errorElement.textContent="Veuillez saisir un titre.";return;}
  if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime())||end<=start){errorElement.textContent="L’heure de fin doit être postérieure à l’heure de début.";return;}
  if(editingEventId)updateEvent(editingEventId,{title,start,end,color:colorInput.value});
  else addEvent({title,start,end,color:colorInput.value});
  closeDialog();
}
/** Supprime l'événement en cours de modification et actualise le calendrier. */
function deleteCurrentEvent(){if(!editingEventId)return;removeEvent(editingEventId);closeDialog();}
/** Ferme la boîte de dialogue uniquement si elle est actuellement ouverte. */
function closeDialog(){if(dialog.open)dialog.close();}
/** Échappe les caractères HTML spéciaux avant d'insérer une valeur dans le balisage. */
function escapeHtml(value){return String(value).replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[character]);}

}

return Object.freeze({create});
})();

const demoRoot = document.querySelector("[data-calendar-demo]");
if (demoRoot) {
  window.demoCalendar = window.WMCalendar.create(demoRoot, {
    initialDate: new Date(2026, 9, 1),
    events: [
      {id:"event-1",title:"Lancement du projet",start:new Date(2026,9,20,9,30),end:new Date(2026,9,20,11),color:"blue"},
      {id:"event-2",title:"Déjeuner avec Camille",start:new Date(2026,9,21,12),end:new Date(2026,9,21,13,30),color:"orange"},
      {id:"event-3",title:"Atelier de conception",start:new Date(2026,9,22,14),end:new Date(2026,9,22,16),color:"violet"},
      {id:"event-4",title:"Conférence produit",start:new Date(2026,9,24),end:new Date(2026,9,26),color:"green"},
      {id:"event-5",title:"Revue hebdomadaire",start:new Date(2026,9,26,10),end:new Date(2026,9,26,11),color:"rose"}
    ],
    backgroundRanges: [
      {title:"Vacances de la Toussaint",start:"2026-10-17",end:"2026-11-01"},
      {title:"Vacances de Noël",start:"2026-12-19",end:"2027-01-03"},
      {title:"Vacances d’hiver",start:"2027-02-13",end:"2027-02-28"},
      {title:"Vacances de printemps",start:"2027-04-10",end:"2027-04-25"},
      {title:"Vacances d’été",start:"2027-07-03",end:"2027-08-31"}
    ]
  });
}
