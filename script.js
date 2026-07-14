const competencyItems = document.querySelectorAll("[data-accordion-item]");
const sectionTitles = document.querySelectorAll(
  "#hero-title, #about-title, #projects-title, #competency-title, #benefits-title, " +
    "#principles-title, #office-title, #footer-title, #footer-legal-title"
);
const revealCards = document.querySelectorAll(
  ".about-card, .project-card, .competency-item, .benefits-card, .principle-card, " +
    ".office-map, .site-footer__field, .site-footer__nav-group, .site-footer__licenses, .site-footer__note"
);
const competencyAnimationDuration = 320;
const competencyAnimationTimers = new WeakMap();
const heroCard = document.querySelector(".hero-card");
const principlesSection = document.querySelector(".principles-section");
const principlesSticky = document.querySelector(".principles-section__sticky");
const principleCards = [...document.querySelectorAll(".principle-card")];
const principleShelves = [...document.querySelectorAll(".principles-rack__shelf")];
const principleLines = [...document.querySelectorAll(".principles-connectors__line")];
const heroLogoIcon = document.querySelector(".hero-card__logo-icon");
const heroLogoMark = document.querySelector(".hero-card__logo-icon-mark");
const heroNav = document.querySelector(".hero-card__nav");
const heroNavParent = heroNav?.parentNode;
const heroNavNextSibling = heroNav?.nextSibling;
let heroNavAnimationFrame = 0;
let heroNavOffsetTop = heroNav?.offsetTop || 0;
let heroLogoAnimationFrame = 0;
let heroLogoPreviousTime = 0;
let heroLogoAngle = 0;
let heroLogoVelocity = 0;
let heroLogoTargetVelocity = 0;
let heroLogoRestAngle = 0;
let heroLogoIsSpinning = false;
let activePrincipleIndex = -1;
let principlesAnimationFrame = 0;

const revealSectionTitle = (title) => {
  title.classList.add("section-title-reveal--visible");
};

const revealCard = (card) => {
  card.classList.add("card-reveal--visible");

  if (card.classList.contains("office-map")) {
    card.classList.add("office-map--route-visible");
  }
};

sectionTitles.forEach((title) => {
  title.classList.add("section-title-reveal");
});

revealCards.forEach((card) => {
  card.classList.add("card-reveal");
});

const updateHeroLogoSpin = (time) => {
  if (!heroLogoPreviousTime) {
    heroLogoPreviousTime = time;
  }

  const delta = Math.min(time - heroLogoPreviousTime, 64);
  heroLogoPreviousTime = time;

  if (heroLogoIsSpinning) {
    const easing = 1 - Math.exp(-delta / 160);

    heroLogoVelocity += (heroLogoTargetVelocity - heroLogoVelocity) * easing;
    heroLogoAngle += heroLogoVelocity * delta;
  } else {
    const remainingAngle = heroLogoRestAngle - heroLogoAngle;
    const easing = 1 - Math.exp(-delta / 1400);

    heroLogoVelocity = 0;
    heroLogoAngle += remainingAngle * easing;

    if (Math.abs(remainingAngle) < 0.08) {
      heroLogoAngle = 0;
      heroLogoRestAngle = 0;
      heroLogoAnimationFrame = 0;
      heroLogoPreviousTime = 0;
      heroLogoMark.style.transform = "rotateY(0deg)";
      return;
    }
  }

  heroLogoMark.style.transform = `rotateY(${heroLogoAngle.toFixed(2)}deg)`;

  heroLogoAnimationFrame = window.requestAnimationFrame(updateHeroLogoSpin);
};

const requestHeroLogoFrame = () => {
  if (!heroLogoAnimationFrame) {
    heroLogoAnimationFrame = window.requestAnimationFrame(updateHeroLogoSpin);
  }
};

if (
  heroLogoIcon &&
  heroLogoMark &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches
) {
  heroLogoIcon.addEventListener("pointerenter", () => {
    heroLogoIsSpinning = true;
    heroLogoTargetVelocity = 0.18;
    requestHeroLogoFrame();
  });

  heroLogoIcon.addEventListener("pointerleave", () => {
    heroLogoIsSpinning = false;
    heroLogoRestAngle = Math.ceil(heroLogoAngle / 360) * 360;

    if (heroLogoRestAngle - heroLogoAngle < 24) {
      heroLogoRestAngle += 360;
    }

    requestHeroLogoFrame();
  });
}

if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
  sectionTitles.forEach(revealSectionTitle);
  revealCards.forEach(revealCard);
} else {
  const sectionTitleObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        revealSectionTitle(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.16,
    }
  );

  sectionTitles.forEach((title) => {
    sectionTitleObserver.observe(title);
  });

  const cardRevealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        revealCard(entry.target);
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.12,
    }
  );

  revealCards.forEach((card) => {
    cardRevealObserver.observe(card);
  });
}

const setActivePrinciple = (index) => {
  if (index === activePrincipleIndex) return;

  activePrincipleIndex = index;

  principleCards.forEach((card, cardIndex) => {
    card.classList.toggle("principle-card--highlight", cardIndex === index);
  });

  principleShelves.forEach((shelf, shelfIndex) => {
    shelf.classList.toggle("principles-rack__shelf--active", shelfIndex === index);
  });

  principleLines.forEach((line, lineIndex) => {
    line.classList.toggle("principles-connectors__line--active", lineIndex === index);
  });
};

const setPrinciplesPan = (progress) => {
  if (!principlesSticky) return;

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const maxPan = Math.max(0, principlesSticky.offsetHeight - viewportHeight);
  const pan = -maxPan * Math.min(Math.max(progress, 0), 1);

  principlesSticky.style.setProperty("--principles-pan-y", `${pan.toFixed(2)}px`);
};

const syncPrinciplesSectionHeight = () => {
  if (!principlesSection || !principlesSticky) return;

  if (window.matchMedia("(max-width: 900px)").matches) {
    principlesSection.style.removeProperty("--principles-scroll-height");
    return;
  }

  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const stickyHeight = principlesSticky.offsetHeight;
  const stickyPanDistance = Math.max(0, stickyHeight - viewportHeight);
  const principleStep = Math.max(viewportHeight * 0.28, stickyHeight * 0.12);
  const scrollDistance = principleStep * Math.max(principleCards.length - 1, 1);
  const bottomGap = 0;
  const sectionHeight = stickyHeight + scrollDistance - stickyPanDistance + bottomGap;

  principlesSection.style.setProperty("--principles-scroll-height", `${sectionHeight.toFixed(2)}px`);
};

const updatePrincipleScrollState = () => {
  principlesAnimationFrame = 0;

  if (!principlesSection || !principleCards.length) return;

  const rect = principlesSection.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  if (rect.top > 0) {
    setActivePrinciple(-1);
    setPrinciplesPan(0);
    return;
  }

  if (rect.bottom < viewportHeight) {
    setActivePrinciple(principleCards.length - 1);
    setPrinciplesPan(1);
    return;
  }

  const scrollRange = Math.max(1, rect.height - viewportHeight);
  const progress = Math.min(Math.max(-rect.top / scrollRange, 0), 0.999);
  const nextIndex = Math.floor(progress * principleCards.length);

  setPrinciplesPan(progress);
  setActivePrinciple(nextIndex);
};

const requestPrincipleScrollUpdate = () => {
  if (!principlesAnimationFrame) {
    principlesAnimationFrame = window.requestAnimationFrame(updatePrincipleScrollState);
  }
};

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

syncPrinciplesSectionHeight();
updateHeroNavPosition();
updatePrincipleScrollState();

window.addEventListener(
  "scroll",
  () => {
    updateHeroNavPosition();
    requestPrincipleScrollUpdate();
  },
  { passive: true }
);

window.addEventListener("resize", () => {
  if (heroNav?.parentNode === heroNavParent) {
    heroNavOffsetTop = heroNav.offsetTop;
  }

  syncPrinciplesSectionHeight();
  updateHeroNavPosition();
  updatePrincipleScrollState();
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
