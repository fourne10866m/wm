document.addEventListener("DOMContentLoaded", function () {
	var draggedItem = null;

	document.querySelectorAll(".groupe").forEach(function (groupe) {
		groupe.addEventListener("dragstart", function (event) {
			var item = event.target.closest(".item");
			if (!item) return;

			draggedItem = item;
			event.dataTransfer.effectAllowed = "move";
		//	event.dataTransfer.setData("text/plain", item.textContent);
			item.classList.add("en-deplacement");
		});

		groupe.addEventListener("dragover", function (event) {
			if (!draggedItem) return;

			event.preventDefault();
			event.dataTransfer.dropEffect = "move";

			var cible = event.target.closest(".item");
			if (!cible || cible === draggedItem) {
				if (!cible && event.target === groupe) groupe.appendChild(draggedItem);
				return;
			}

			var position = cible.getBoundingClientRect();
			var apresCible = event.clientY > position.top + position.height / 2;
			groupe.insertBefore(draggedItem, apresCible ? cible.nextSibling : cible);
		});

		groupe.addEventListener("dragend", function () {
			if (draggedItem) draggedItem.classList.remove("en-deplacement");
			draggedItem = null;
		});
	});

	document.querySelectorAll(".item").forEach(function (item) {
		item.draggable = true;
	});
});
