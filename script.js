const competencyItems = document.querySelectorAll("[data-accordion-item]");
const competencyAnimationDuration = 320;
const competencyAnimationTimers = new WeakMap();

const clearCompetencyAnimation = (item) => {
  const timer = competencyAnimationTimers.get(item);

  if (timer) {
    window.clearTimeout(timer);
    competencyAnimationTimers.delete(item);
  }

  item.classList.remove("competency-item--animating", "competency-item--closing");
  item.style.removeProperty("height");
  item.style.removeProperty("overflow");
  item.style.removeProperty("transition");
};

const finishCompetencyAnimation = (item) => {
  item.classList.remove("competency-item--animating", "competency-item--closing");
  item.style.removeProperty("height");
  item.style.removeProperty("overflow");
  item.style.removeProperty("transition");
  competencyAnimationTimers.delete(item);
};

const getCompetencyClosedHeight = (item) => {
  const minHeight = parseFloat(window.getComputedStyle(item).minHeight);

  return Number.isFinite(minHeight) ? minHeight : 0;
};

const animateCompetencyOpen = (item, startHeight) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  clearCompetencyAnimation(item);

  const endHeight = item.getBoundingClientRect().height;

  item.classList.add("competency-item--animating");
  item.style.height = `${startHeight}px`;
  item.style.overflow = "hidden";
  item.style.transition = "none";

  item.getBoundingClientRect();
  item.style.transition = `height ${competencyAnimationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
  item.style.height = `${endHeight}px`;

  const timer = window.setTimeout(() => {
    finishCompetencyAnimation(item);
  }, competencyAnimationDuration + 50);

  competencyAnimationTimers.set(item, timer);
};

const animateCompetencyClose = (item, startHeight, onComplete) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onComplete();
    return;
  }

  clearCompetencyAnimation(item);

  const endHeight = getCompetencyClosedHeight(item);

  item.classList.add("competency-item--closing");
  item.style.height = `${startHeight}px`;
  item.style.overflow = "hidden";
  item.style.transition = "none";

  item.getBoundingClientRect();
  item.style.transition = `height ${competencyAnimationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
  item.style.height = `${endHeight}px`;

  const timer = window.setTimeout(() => {
    finishCompetencyAnimation(item);
    onComplete();
  }, competencyAnimationDuration + 50);

  competencyAnimationTimers.set(item, timer);
};

competencyItems.forEach((item) => {
  const trigger = item.querySelector(".competency-item__trigger");
  const panelId = trigger?.getAttribute("aria-controls");
  const panel = panelId ? document.getElementById(panelId) : null;

  trigger?.addEventListener("click", () => {
    const wasOpen = item.classList.contains("competency-item--open");

    competencyItems.forEach((nextItem) => {
      const nextTrigger = nextItem.querySelector(".competency-item__trigger");
      const nextPanelId = nextTrigger?.getAttribute("aria-controls");
      const nextPanel = nextPanelId ? document.getElementById(nextPanelId) : null;
      const isActive = !wasOpen && nextItem === item;
      const isOpen = nextItem.classList.contains("competency-item--open");
      const startHeight = nextItem.getBoundingClientRect().height;

      clearCompetencyAnimation(nextItem);
      nextTrigger?.setAttribute("aria-expanded", String(isActive));

      if (isActive) {
        if (nextPanel) nextPanel.hidden = false;

        nextItem.classList.add("competency-item--open");
        animateCompetencyOpen(nextItem, startHeight);
        return;
      }

      if (isOpen) {
        nextItem.classList.remove("competency-item--open");

        animateCompetencyClose(nextItem, startHeight, () => {
          if (nextPanel) nextPanel.hidden = true;
        });
        return;
      }

      nextItem.classList.remove("competency-item--open");
      if (nextPanel) nextPanel.hidden = true;
    });
  });
});
