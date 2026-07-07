const competencyItems = document.querySelectorAll("[data-accordion-item]");
const competencyAnimationDuration = 320;

const animateCompetencyOpen = (item, startHeight) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const endHeight = item.getBoundingClientRect().height;

  item.classList.add("competency-item--animating");
  item.style.height = `${startHeight}px`;
  item.style.overflow = "hidden";
  item.style.transition = "none";

  item.getBoundingClientRect();
  item.style.transition = `height ${competencyAnimationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
  item.style.height = `${endHeight}px`;

  window.setTimeout(() => {
    item.classList.remove("competency-item--animating");
    item.style.removeProperty("height");
    item.style.removeProperty("overflow");
    item.style.removeProperty("transition");
  }, competencyAnimationDuration + 50);
};

competencyItems.forEach((item) => {
  const trigger = item.querySelector(".competency-item__trigger");
  const panelId = trigger?.getAttribute("aria-controls");
  const panel = panelId ? document.getElementById(panelId) : null;

  trigger?.addEventListener("click", () => {
    const wasOpen = item.classList.contains("competency-item--open");
    const startHeight = item.getBoundingClientRect().height;

    competencyItems.forEach((nextItem) => {
      const nextTrigger = nextItem.querySelector(".competency-item__trigger");
      const nextPanelId = nextTrigger?.getAttribute("aria-controls");
      const nextPanel = nextPanelId ? document.getElementById(nextPanelId) : null;
      const isActive = nextItem === item;

      nextItem.classList.toggle("competency-item--open", isActive);
      nextTrigger?.setAttribute("aria-expanded", String(isActive));

      if (nextPanel) nextPanel.hidden = !isActive;
    });

    if (panel) panel.hidden = false;

    if (!wasOpen) animateCompetencyOpen(item, startHeight);
  });
});
