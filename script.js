const competencyItems = document.querySelectorAll("[data-accordion-item]");

competencyItems.forEach((item) => {
  const trigger = item.querySelector(".competency-item__trigger");
  const panelId = trigger?.getAttribute("aria-controls");
  const panel = panelId ? document.getElementById(panelId) : null;

  trigger?.addEventListener("click", () => {
    competencyItems.forEach((nextItem) => {
      const nextTrigger = nextItem.querySelector(".competency-item__trigger");
      const nextPanelId = nextTrigger?.getAttribute("aria-controls");
      const nextPanel = nextPanelId ? document.getElementById(nextPanelId) : null;
      const isActive = nextItem === item;

      nextItem.classList.toggle("competency-item--open", isActive);
      nextTrigger?.setAttribute("aria-expanded", String(isActive));

      if (nextPanel) {
        nextPanel.hidden = !isActive;
      }
    });

    if (panel) {
      panel.hidden = false;
    }
  });
});
