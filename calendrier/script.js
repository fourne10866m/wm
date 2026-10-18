"use strict";

const HOUR_HEIGHT = 56, FIRST_HOUR = 7, LAST_HOUR = 21;
const WEEKDAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const LONG_WEEKDAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const COLORS = {
  blue:{bg:"#eaf0ff",text:"#4058bd",edge:"#6077e8"}, violet:{bg:"#f1ebff",text:"#734fc1",edge:"#9870e8"},
  green:{bg:"#e8f7f0",text:"#27825b",edge:"#40ae7b"}, orange:{bg:"#fff2e5",text:"#b86c24",edge:"#ed9b4b"}, rose:{bg:"#ffedf0",text:"#b94e68",edge:"#df738c"}
};
const today = startOfDay(new Date());
let currentDate = new Date(today), currentView = "month", editingEventId = null;
let events = [
  {id:"event-1",title:"Lancement du projet",start:new Date(2026,9,20,9,30),end:new Date(2026,9,20,11),color:"blue"},
  {id:"event-2",title:"Déjeuner avec Camille",start:new Date(2026,9,21,12),end:new Date(2026,9,21,13,30),color:"orange"},
  {id:"event-3",title:"Atelier de conception",start:new Date(2026,9,22,14),end:new Date(2026,9,22,16),color:"violet"},
  {id:"event-4",title:"Conférence produit",start:new Date(2026,9,24),end:new Date(2026,9,26),color:"green"},
  {id:"event-5",title:"Revue hebdomadaire",start:new Date(2026,9,26,10),end:new Date(2026,9,26,11),color:"rose"}
];
const titleElement=document.querySelector("#calendarTitle"), contentElement=document.querySelector("#calendarContent");
const dialog=document.querySelector("#eventDialog"), form=document.querySelector("#eventForm");
const titleInput=document.querySelector("#eventTitle"), startInput=document.querySelector("#eventStart"), endInput=document.querySelector("#eventEnd");
const colorInput=document.querySelector("#eventColor"), errorElement=document.querySelector("#dialogError"), deleteButton=document.querySelector("#deleteEventBtn");

document.querySelector("#prevBtn").addEventListener("click",()=>movePeriod(-1));
document.querySelector("#nextBtn").addEventListener("click",()=>movePeriod(1));
document.querySelector("#todayBtn").addEventListener("click",()=>{currentDate=new Date(today);render();});
document.querySelectorAll(".view-button").forEach(button=>button.addEventListener("click",()=>{
  currentView=button.dataset.view;
  document.querySelectorAll(".view-button").forEach(item=>item.classList.toggle("is-active",item===button)); render();
}));
document.querySelector("#closeDialogBtn").addEventListener("click",closeDialog);
document.querySelector("#cancelBtn").addEventListener("click",closeDialog);
deleteButton.addEventListener("click",deleteCurrentEvent);
form.addEventListener("submit",saveEvent);
dialog.addEventListener("click",event=>{if(event.target===dialog)closeDialog();});
render();

function startOfDay(date){return new Date(date.getFullYear(),date.getMonth(),date.getDate());}
function addDays(date,amount){const result=new Date(date);result.setDate(result.getDate()+amount);return result;}
function addMonths(date,amount){return new Date(date.getFullYear(),date.getMonth()+amount,1);}
function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function isAllDay(event){return event.start.getHours()===0&&event.start.getMinutes()===0&&event.end.getHours()===0&&event.end.getMinutes()===0;}
function formatDateTime(date){const pad=n=>String(n).padStart(2,"0");return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;}
function fromDateTime(value){const [d,t]=value.split("T"),[y,m,day]=d.split("-").map(Number),[h,min]=t.split(":").map(Number);return new Date(y,m-1,day,h,min);}
function formatTime(date){return date.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});}
function eventStyle(event){const color=COLORS[event.color]||COLORS.blue;return `--event-bg:${color.bg};--event-text:${color.text};--event-color:${color.edge}`;}
function visibleEvents(start,end){return events.filter(event=>event.start<end&&event.end>start);}
function movePeriod(direction){if(currentView==="month")currentDate=addMonths(currentDate,direction);else currentDate=addDays(currentDate,direction*(currentView==="week"?7:1));render();}
function render(){if(currentView==="month")renderMonth();else renderTimeView(currentView==="week"?7:1);}

function renderMonth(){
  titleElement.textContent=currentDate.toLocaleDateString("fr-FR",{month:"long",year:"numeric"});
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
      const classes=["month-cell",date.getMonth()!==currentDate.getMonth()?"is-outside":"",sameDay(date,today)?"is-today":""].filter(Boolean).join(" ");
      const defaultDate=new Date(date.getFullYear(),date.getMonth(),date.getDate(),9);
      return `<div class="${classes}" role="gridcell" data-date="${formatDateTime(defaultDate)}"><span class="day-number">${date.getDate()}</span>
        ${shown.map(event=>`<button class="event-chip" type="button" data-event-id="${event.id}" style="${eventStyle(event)}" title="${escapeHtml(event.title)}">${isAllDay(event)?"":`${formatTime(event.start)} `}${escapeHtml(event.title)}</button>`).join("")}
        ${more>0?`<div class="more-events">+ ${more} autre${more>1?"s":""}</div>`:""}</div>`;
    }).join("")}</div>`;
  contentElement.querySelectorAll(".month-cell").forEach(cell=>cell.addEventListener("click",event=>{
    if(event.target.closest("[data-event-id]"))return;const start=fromDateTime(cell.dataset.date);openCreateDialog(start,new Date(start.getTime()+3600000));
  }));
  bindEventButtons();
}

function startOfWeek(date){return addDays(startOfDay(date),-((date.getDay()+6)%7));}
function renderTimeView(columnCount){
  const weekStart=currentView==="week"?startOfWeek(currentDate):startOfDay(currentDate);
  const dates=Array.from({length:columnCount},(_,index)=>addDays(weekStart,index)), rangeEnd=addDays(dates[dates.length-1],1);
  if(currentView==="day")titleElement.textContent=currentDate.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  else{const weekEnd=addDays(weekStart,6);titleElement.textContent=`${weekStart.toLocaleDateString("fr-FR",{day:"numeric",month:"short"})} – ${weekEnd.toLocaleDateString("fr-FR",{day:"numeric",month:"short",year:"numeric"})}`;}
  const allDayEvents=visibleEvents(weekStart,rangeEnd).filter(isAllDay);
  const headers=dates.map((date,index)=>`<div class="time-day-heading ${sameDay(date,today)?"is-today":""}>${currentView==="week"?WEEKDAYS[index]:LONG_WEEKDAYS[(date.getDay()+6)%7]}<strong>${date.getDate()}</strong></div>`).join("");
  const rows=[];
  for(let hour=FIRST_HOUR;hour<LAST_HOUR;hour++)rows.push(`<div class="time-row"><div class="time-label">${String(hour).padStart(2,"0")}:00</div>${dates.map(date=>`<div class="time-slot" data-date="${formatDateTime(new Date(date.getFullYear(),date.getMonth(),date.getDate(),hour))}" aria-label="${date.toLocaleDateString("fr-FR")} à ${hour} heures">${hour===FIRST_HOUR?renderTimedEvents(date):""}</div>`).join("")}</div>`);
  contentElement.innerHTML=`<div class="time-grid" style="--columns:${columnCount}"><div class="time-header"><div class="time-header-spacer"></div>${headers}</div>
    <div class="all-day-row"><div class="all-day-label">Journée</div>${dates.map(date=>`<div class="all-day-cell">${allDayEvents.filter(event=>event.start<addDays(date,1)&&event.end>date).map(event=>`<button class="all-day-event" type="button" data-event-id="${event.id}" style="${eventStyle(event)}">${escapeHtml(event.title)}</button>`).join("")}</div>`).join("")}</div>${rows.join("")}</div>`;
  contentElement.querySelectorAll(".time-slot").forEach(slot=>slot.addEventListener("click",event=>{
    if(event.target.closest("[data-event-id]"))return;const start=fromDateTime(slot.dataset.date);openCreateDialog(start,new Date(start.getTime()+3600000));
  }));
  bindEventButtons();
}
function renderTimedEvents(date){
  const dayStart=startOfDay(date), nextDay=addDays(dayStart,1);
  return visibleEvents(dayStart,nextDay).filter(event=>!isAllDay(event)).map(event=>{
    const startMinutes=event.start.getHours()*60+event.start.getMinutes();
    const endMinutes=event.end.getTime()>nextDay.getTime()?LAST_HOUR*60:event.end.getHours()*60+event.end.getMinutes();
    const visibleStart=Math.max(startMinutes,FIRST_HOUR*60),visibleEnd=Math.min(endMinutes,LAST_HOUR*60);
    if(visibleEnd<=visibleStart)return "";
    const top=((visibleStart-FIRST_HOUR*60)/60)*HOUR_HEIGHT,height=Math.max(22,((visibleEnd-visibleStart)/60)*HOUR_HEIGHT-3);
    return `<button class="timed-event" type="button" data-event-id="${event.id}" style="${eventStyle(event)};top:${top}px;height:${height}px" title="${escapeHtml(event.title)}">${escapeHtml(event.title)}<span>${formatTime(event.start)}–${formatTime(event.end)}</span></button>`;
  }).join("");
}
function bindEventButtons(){contentElement.querySelectorAll("[data-event-id]").forEach(button=>button.addEventListener("click",event=>{event.stopPropagation();openEditDialog(button.dataset.eventId);}));}
function openCreateDialog(start,end){editingEventId=null;form.reset();document.querySelector("#dialogTitle").textContent="Ajouter un événement";titleInput.value="";startInput.value=formatDateTime(start);endInput.value=formatDateTime(end);colorInput.value="blue";deleteButton.hidden=true;errorElement.textContent="";dialog.showModal();titleInput.focus();}
function openEditDialog(id){const event=events.find(item=>item.id===id);if(!event)return;editingEventId=id;document.querySelector("#dialogTitle").textContent="Modifier l’événement";titleInput.value=event.title;startInput.value=formatDateTime(event.start);endInput.value=formatDateTime(event.end);colorInput.value=event.color;deleteButton.hidden=false;errorElement.textContent="";dialog.showModal();titleInput.focus();}
function saveEvent(event){
  event.preventDefault();const title=titleInput.value.trim(),start=fromDateTime(startInput.value),end=fromDateTime(endInput.value);
  if(!title){errorElement.textContent="Veuillez saisir un titre.";return;}
  if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime())||end<=start){errorElement.textContent="L’heure de fin doit être postérieure à l’heure de début.";return;}
  if(editingEventId){const existing=events.find(item=>item.id===editingEventId);Object.assign(existing,{title,start,end,color:colorInput.value});}
  else events.push({id:`event-${Date.now()}-${Math.random().toString(16).slice(2)}`,title,start,end,color:colorInput.value});
  closeDialog();render();
}
function deleteCurrentEvent(){if(!editingEventId)return;events=events.filter(event=>event.id!==editingEventId);closeDialog();render();}
function closeDialog(){if(dialog.open)dialog.close();}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[character]);}
