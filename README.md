# wm
Api de WebMapping
Utilisation d'Openlayers

## Calendrier réutilisable

Le fichier `calendrier/script.js` expose l'API globale `WMCalendar`. La page qui l'utilise doit reprendre le balisage de `calendrier/index.html` (y compris la boîte de dialogue), charger `calendrier/style.css` et `calendrier/script.js`, puis créer une instance dans l'élément racine :

```html
<script src="calendrier/script.js" defer></script>
<script>
	window.addEventListener("DOMContentLoaded", () => {
	const calendar = WMCalendar.create(document.querySelector("#calendar"), {
		initialDate: new Date(),
		view: "week",
		events: [
			{id: "meeting-1", title: "Réunion", start: new Date("2026-10-20T09:00"), end: new Date("2026-10-20T10:00"), color: "blue"}
		],
		onChange: ({action, event, events}) => console.log(action, event, events)
	});
	});
</script>
```

La racine passée à `create` doit contenir les éléments du calendrier et sa boîte de dialogue. Les identifiants par défaut sont ceux du fichier HTML fourni; `options.selectors` permet de les remplacer. Les options de présentation sont `locale`, `view` (`month`, `week` ou `day`), `initialDate`, `today`, `firstHour`, `lastHour`, `hourHeight`, `weekdays`, `longWeekdays` et `colors`.

Chaque instance possède son propre état et renvoie les méthodes `render()`, `setView(view)`, `setDate(date)`, `previous()`, `next()`, `today()`, `getEvents()`, `addEvent(event)`, `updateEvent(id, changes)`, `removeEvent(id)` et `destroy()`. `onChange` reçoit les changements faits par l'API ou le formulaire. `destroy()` retire les gestionnaires d'événements de l'instance.

La page de démonstration initialise son exemple uniquement sur l'élément marqué `data-calendar-demo`.
