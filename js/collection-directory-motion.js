(() => {
  const board = document.querySelector(".collection-directory");
  const links = board ? Array.from(board.querySelectorAll(":scope > a")) : [];

  if (!board || links.length === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const speeds = [
    { x:0.055, y:0.043 },
    { x:0, y:-0.072 },
    { x:0.061, y:-0.049 }
  ];

  const items = links.map((link, index) => ({
    link,
    x:0,
    y:0,
    vx:speeds[index % speeds.length].x,
    vy:speeds[index % speeds.length].y,
    paused:false
  }));

  items.forEach((item) => {
    item.link.addEventListener("pointerenter", () => {
      item.paused = true;
    });
    item.link.addEventListener("pointerleave", () => {
      item.paused = false;
    });
    item.link.addEventListener("focusin", () => {
      item.paused = true;
    });
    item.link.addEventListener("focusout", () => {
      item.paused = false;
    });
  });

  let previousTime = performance.now();

  const animate = (time) => {
    const elapsed = Math.min(time - previousTime, 32);
    previousTime = time;
    const boardRect = board.getBoundingClientRect();

    items.forEach((item) => {
      if (item.paused) {
        return;
      }

      const baseLeft = item.link.offsetLeft;
      const baseTop = item.link.offsetTop;
      const maxX = Math.max(0, boardRect.width - item.link.offsetWidth);
      const maxY = Math.max(0, boardRect.height - item.link.offsetHeight);

      item.x += item.vx * elapsed;
      item.y += item.vy * elapsed;

      const nextLeft = baseLeft + item.x;
      const nextTop = baseTop + item.y;

      if (nextLeft <= 0 || nextLeft >= maxX) {
        item.vx *= -1;
        item.x = Math.min(maxX - baseLeft, Math.max(-baseLeft, item.x));
      }

      if (nextTop <= 0 || nextTop >= maxY) {
        item.vy *= -1;
        item.y = Math.min(maxY - baseTop, Math.max(-baseTop, item.y));
      }

      item.link.style.transform = `translate3d(${item.x}px, ${item.y}px, 0)`;
    });

    requestAnimationFrame(animate);
  };

  requestAnimationFrame(animate);
})();
