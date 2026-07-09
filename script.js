const competencyItems = document.querySelectorAll("[data-accordion-item]");
const competencyAnimationDuration = 320;
const competencyAnimationTimers = new WeakMap();
const heroCard = document.querySelector(".hero-card");
const heroNav = document.querySelector(".hero-card__nav");
const heroNavParent = heroNav?.parentNode;
const heroNavNextSibling = heroNav?.nextSibling;
let heroNavAnimationFrame = 0;
let heroNavOffsetTop = heroNav?.offsetTop || 0;

const getOriginalHeroNavBottom = () => {
  if (!heroCard || !heroNav) return 0;

  return heroCard.getBoundingClientRect().top + heroNavOffsetTop + heroNav.offsetHeight;
};

const setHeroNavFixed = (shouldFix) => {
  if (!heroNav || !heroNavParent) return;
  const isFixed = heroNav.classList.contains("hero-card__nav--fixed");

  if (shouldFix) {
    if (isFixed) return;

    if (heroNav.parentNode !== document.body) {
      document.body.append(heroNav);
    }

    heroNav.classList.add("hero-card__nav--fixed");
    window.cancelAnimationFrame(heroNavAnimationFrame);
    heroNavAnimationFrame = window.requestAnimationFrame(() => {
      heroNavAnimationFrame = window.requestAnimationFrame(() => {
        heroNav.classList.add("hero-card__nav--visible");
      });
    });
    return;
  }

  if (!isFixed) return;

  window.cancelAnimationFrame(heroNavAnimationFrame);
  heroNav.classList.remove("hero-card__nav--visible", "hero-card__nav--fixed");

  if (heroNav.parentNode !== heroNavParent) {
    heroNavParent.insertBefore(heroNav, heroNavNextSibling);
  }
};

const updateHeroNavPosition = () => {
  if (!heroCard || !heroNav) return;

  const shouldFix = getOriginalHeroNavBottom() <= 0;

  setHeroNavFixed(shouldFix);
};

updateHeroNavPosition();
window.addEventListener("scroll", updateHeroNavPosition, { passive: true });
window.addEventListener("resize", () => {
  if (heroNav?.parentNode === heroNavParent) {
    heroNavOffsetTop = heroNav.offsetTop;
  }

  updateHeroNavPosition();
});

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
