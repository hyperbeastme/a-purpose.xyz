(() => {
  const mobileQuery = window.matchMedia(
    "(max-width: 767px), (orientation: landscape) and (max-height: 500px)"
  );

  const setupHeader = (header, index) => {
    const sourceNav = header.querySelector(".header-right, .desktop-nav");
    if (!sourceNav || header.querySelector(".mobile-menu-button")) return;

    const button = document.createElement("button");
    button.className = "mobile-menu-button";
    button.type = "button";
    button.setAttribute("aria-label", "Open menu");
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", `mobile-menu-${index}`);
    button.innerHTML = "<span></span><span></span><span></span>";

    const menu = sourceNav.cloneNode(true);
    menu.className = "mobile-menu";
    menu.id = `mobile-menu-${index}`;
    menu.setAttribute("aria-label", "Mobile navigation");
    menu.hidden = true;

    header.append(button, menu);

    const close = () => {
      header.classList.remove("menu-open");
      document.body.classList.remove("menu-open");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open menu");
      menu.hidden = true;
    };

    const sync = () => {
      button.hidden = !mobileQuery.matches;
      if (!mobileQuery.matches) close();
    };

    button.addEventListener("click", () => {
      const open = !header.classList.contains("menu-open");
      header.classList.toggle("menu-open", open);
      document.body.classList.toggle("menu-open", open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.hidden = !open;
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", close);
    });

    mobileQuery.addEventListener?.("change", sync);
    sync();
  };

  document.querySelectorAll(".header").forEach(setupHeader);
})();
