(() => {
  const container = document.querySelector(".projects-index");
  const links = Array.from(document.querySelectorAll(".project-index-link"));

  if (!container || links.length === 0) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const directions = [0.68, 2.42, 5.58, 3.74, 1.18, 4.96, 2.86, 5.92];
  const itemsByElement = new Map();
  let items = [];
  let frameId = 0;
  let previousTime = 0;

  const clamp = (value, minimum, maximum) =>
    Math.min(Math.max(value, minimum), maximum);

  const updateBounds = (item) => {
    item.maxX = Math.max(0, container.clientWidth - item.element.offsetWidth);
    item.maxY = Math.max(0, container.clientHeight - item.element.offsetHeight);
    item.x = clamp(item.x, 0, item.maxX);
    item.y = clamp(item.y, 0, item.maxY);
  };

  const render = (item) => {
    item.element.style.transform =
      `translate3d(${item.x.toFixed(2)}px, ${item.y.toFixed(2)}px, 0)`;
  };

  const tick = (time) => {
    const elapsed = Math.min((time - previousTime) / 1000, 0.04);
    previousTime = time;

    if (!document.hidden) {
      items.forEach((item) => {
        if (item.paused) return;

        item.x += item.velocityX * elapsed;
        item.y += item.velocityY * elapsed;

        if (item.x <= 0 || item.x >= item.maxX) {
          item.x = clamp(item.x, 0, item.maxX);
          item.velocityX *= -1;
        }

        if (item.y <= 0 || item.y >= item.maxY) {
          item.y = clamp(item.y, 0, item.maxY);
          item.velocityY *= -1;
        }

        render(item);
      });
    }

    frameId = window.requestAnimationFrame(tick);
  };

  const stop = () => {
    window.cancelAnimationFrame(frameId);
    frameId = 0;
    items = [];
    itemsByElement.clear();

    links.forEach((link) => {
      delete link.dataset.roamingTitle;
      link.style.removeProperty("transform");
    });
  };

  const start = () => {
    if (reducedMotion.matches || frameId) return;

    const containerRect = container.getBoundingClientRect();

    items = links.map((element, index) => {
      const elementRect = element.getBoundingClientRect();
      const speed = 44 + (index % 4) * 9;
      const angle = directions[index % directions.length];
      const item = {
        element,
        x: elementRect.left - containerRect.left,
        y: elementRect.top - containerRect.top,
        maxX: 0,
        maxY: 0,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        paused: false,
      };

      element.dataset.roamingTitle = "true";
      updateBounds(item);
      render(item);
      itemsByElement.set(element, item);
      return item;
    });

    previousTime = performance.now();
    frameId = window.requestAnimationFrame(tick);
  };

  links.forEach((link) => {
    link.addEventListener("pointerenter", () => {
      const item = itemsByElement.get(link);
      if (item) item.paused = true;
    });

    link.addEventListener("pointerleave", () => {
      const item = itemsByElement.get(link);
      if (item) item.paused = false;
    });

    link.addEventListener("focus", () => {
      const item = itemsByElement.get(link);
      if (item) item.paused = true;
    });

    link.addEventListener("blur", () => {
      const item = itemsByElement.get(link);
      if (item) item.paused = false;
    });
  });

  const resizeObserver = new ResizeObserver(() => {
    items.forEach((item) => {
      updateBounds(item);
      render(item);
    });
  });

  resizeObserver.observe(container);

  const syncMotionPreference = () => {
    stop();
    start();
  };

  if (typeof reducedMotion.addEventListener === "function") {
    reducedMotion.addEventListener("change", syncMotionPreference);
  } else {
    reducedMotion.addListener(syncMotionPreference);
  }

  start();
})();
