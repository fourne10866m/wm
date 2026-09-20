document.addEventListener("DOMContentLoaded", function () {
	var menuButtons = document.querySelectorAll(".menu-toggle");

	function closeMenus() {
		document.querySelectorAll(".popup-menu.is-open").forEach(function (menu) {
			menu.classList.remove("is-open");
			menu.previousElementSibling.setAttribute("aria-expanded", "false");
		});
	}

	menuButtons.forEach(function (button) {
		button.addEventListener("click", function (event) {
			event.stopPropagation();

			var menu = button.nextElementSibling;
			var isOpen = menu.classList.contains("is-open");

			closeMenus();
			if (!isOpen) {
				menu.classList.add("is-open");
				button.setAttribute("aria-expanded", "true");
			}
		});
	});

	document.querySelectorAll("[role=menuitem]").forEach(function (item) {
		item.addEventListener("click", function () {
			var action = item.dataset.action;
			var elementName = item.closest(".list-item").querySelector("span").textContent;

			alert(action + " : " + elementName);
			closeMenus();
		});
	});

	document.addEventListener("click", closeMenus);

	document.addEventListener("keydown", function (event) {
		if (event.key === "Escape") {
			closeMenus();
		}
	});
});
