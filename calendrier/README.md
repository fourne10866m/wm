# wm
Api de WebMapping
Utilisation d'Openlayers

## Calendrier réutilisable

Le fichier `calendrier/script.js` expose l'API globale `WMCalendar`. Il génère le balisage du calendrier et de sa boîte de dialogue dans l'élément racine, qui peut donc rester vide. Pour une initialisation manuelle, charger `calendrier/style.css` et `calendrier/script.js`, puis créer l'instance :

```html
<link rel="stylesheet" href="calendrier/style.css">
<div id="calendar"></div>
<script src="calendrier/script.js" defer></script>
<script>
window.addEventListener("DOMContentLoaded", () => {
  const calendar = WMCalendar.create("#calendar", {
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

La racine passée à `create(root, options)` est un élément DOM ou un sélecteur CSS. Les identifiants par défaut sont générés par le script; `options.selectors` permet de les remplacer si un balisage personnalisé est fourni. Les options de présentation sont `locale`, `view` (`year`, `month` ou `week`), `initialDate`, `today`, `firstHour`, `lastHour`, `hourHeight`, `weekdays` et `colors`. `options.events` initialise les événements; `options.onChange` est appelée après chaque ajout, modification ou suppression.

### Ajouter un événement

La méthode `calendar.addEvent(event)` ajoute immédiatement l'événement, actualise l'affichage et renvoie une copie de l'événement ajouté. Elle peut être appelée depuis n'importe quel code ayant accès à l'instance, par exemple après une action utilisateur ou le chargement d'une donnée :

```js
const added = calendar.addEvent({
	title: "Point d'équipe",
	start: new Date(2026, 9, 20, 9, 30),
	end: new Date(2026, 9, 20, 10, 30),
	color: "green"
});
console.log(added.id); // identifiant généré automatiquement
```

L'objet événement accepte les propriétés suivantes :

| Propriété | Requise | Description |
| --- | --- | --- |
| `title` | Oui | Titre non vide; les espaces en début et fin sont retirés. |
| `start` | Oui | Date et heure de début, sous forme de `Date` ou de valeur convertible par `new Date(...)`. |
| `end` | Oui | Date et heure de fin, strictement postérieure au début. |
| `id` | Non | Identifiant; converti en chaîne. Un identifiant est généré s'il est absent. Il doit être unique dans le calendrier. |
| `color` | Non | Clé de couleur définie dans `options.colors`; vaut `"blue"` par défaut. Une clé inconnue est affichée avec le style bleu. |

Les dates sont manipulées en heure locale par l'interface. Pour éviter les ambiguïtés de fuseau lors du passage de chaînes, privilégier un objet `Date` construit explicitement (comme dans l'exemple). `addEvent` lève une `TypeError` si le titre est vide et une `RangeError` si les dates sont invalides, si la fin n'est pas après le début ou si l'identifiant existe déjà.

La vue `"year"` affiche les douze mini-calendriers de l'année. Les flèches changent d'année; cliquer sur un nom de mois ouvre sa vue mensuelle et cliquer sur un jour ouvre le mois correspondant. Un point signale les jours qui contiennent un événement.

Dans la vue `"month"`, cliquez sur une journée pour préparer un événement d'une heure. Pour un événement sur plusieurs jours, faites glisser la souris du premier au dernier jour : le formulaire s'ouvre avec toute la plage sélectionnée, jours de début et de fin inclus. Les heures sont initialisées à minuit, ce qui crée un événement sur la journée entière; elles restent modifiables dans le formulaire.

### Autres méthodes

Chaque instance possède son propre état et expose :

| Méthode | Comportement |
| --- | --- |
| `render()` | Redessine la vue courante. |
| `setView(view)` | Affiche `"year"`, `"month"` ou `"week"`; lève une `RangeError` pour une autre valeur. |
| `setDate(date)` | Affiche la période contenant la date fournie. |
| `previous()` / `next()` | Navigue vers la période précédente ou suivante selon la vue. |
| `today()` | Revient à la date du jour enregistrée à la création de l'instance. |
| `getEvents()` | Renvoie une copie du tableau d'événements, avec des copies des dates. |
| `updateEvent(id, changes)` | Met à jour l'événement et renvoie sa copie; renvoie `null` si l'identifiant est introuvable. Les règles de validation de `addEvent` s'appliquent aussi. |
| `removeEvent(id)` | Supprime l'événement et renvoie `true`, ou renvoie `false` si l'identifiant est introuvable. |
| `destroy()` | Retire les gestionnaires d'événements de l'instance. |

Le callback `onChange({action, event, events})` reçoit `action` (`"add"`, `"update"` ou `"remove"`), l'événement concerné et une copie complète de la liste après changement. Il est appelé aussi bien pour les opérations de l'API que pour les actions du formulaire.

La page de démonstration initialise automatiquement son exemple sur l'élément marqué `data-calendar-demo`.
