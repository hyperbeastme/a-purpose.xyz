(() => {
  const MOBILE_WIDTH = 1023;
  const BOARD_SELECTORS = [
    ".landing",
    ".project-preview",
    ".about",
    ".about-page-intro",
    ".contact-page",
    ".eternal-section",
    ".eternal-filmstrip",
    ".eternal-editorial",
    ".eternal-runway",
    ".reflections-section",
    ".catelier-section"
  ];

  const framedBoards = [];

  function useDesktopBoardRules() {
    if (window.innerWidth > MOBILE_WIDTH) return;

    for (const sheet of document.styleSheets) {
      const href = sheet.href || "";
      if (href.includes("responsive-boards.css")) continue;

      let rules;
      try {
        rules = sheet.cssRules;
      } catch {
        continue;
      }

      if (!rules) continue;

      for (const rule of rules) {
        if (!(rule instanceof CSSMediaRule)) continue;

        const query = rule.conditionText.toLowerCase();
        const phoneRule =
          query.includes("max-width:767px") ||
          query.includes("max-width: 767px") ||
          (query.includes("min-width:393px") && query.includes("max-width:440px")) ||
          (query.includes("min-width: 393px") && query.includes("max-width: 440px"));
        const touchTabletRule =
          query.includes("min-width:768px") &&
          query.includes("max-width:1199px") &&
          query.includes("pointer:coarse");
        const desktopBoardRule =
          query.includes("min-width:1024px") &&
          query.includes("pointer:fine");

        if (phoneRule || touchTabletRule) {
          rule.media.mediaText = "not all";
        } else if (desktopBoardRule) {
          rule.media.mediaText = "all";
        }
      }
    }
  }

  function frameBoard(board) {
    if (board.parentElement?.classList.contains("responsive-board-frame")) return;

    const styles = getComputedStyle(board);
    const baseWidth = parseFloat(styles.width) || board.offsetWidth || 1440;
    const baseHeight = parseFloat(styles.height) || board.offsetHeight || 1024;
    const marginTop = parseFloat(styles.marginTop) || 0;
    const marginBottom = parseFloat(styles.marginBottom) || 0;

    const frame = document.createElement("div");
    frame.className = "responsive-board-frame";
    board.parentNode.insertBefore(frame, board);
    frame.appendChild(board);

    board.classList.add("responsive-board");
    board.style.width = baseWidth + "px";
    board.style.height = baseHeight + "px";
    board.style.minWidth = baseWidth + "px";
    board.style.minHeight = baseHeight + "px";
    board.style.maxWidth = "none";
    board.style.margin = "0";

    framedBoards.push({
      board,
      frame,
      baseWidth,
      baseHeight,
      marginTop,
      marginBottom
    });
  }

  function fitBoards() {
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.visualViewport?.height || window.innerHeight;

    for (const item of framedBoards) {
      const scale = Math.min(
        viewportWidth / item.baseWidth,
        viewportHeight / item.baseHeight,
        1
      );
      const renderedWidth = item.baseWidth * scale;
      const renderedHeight = item.baseHeight * scale;
      const left = Math.max(0, (viewportWidth - renderedWidth) / 2);

      item.frame.style.height = renderedHeight + "px";
      item.frame.style.marginTop = item.marginTop * scale + "px";
      item.frame.style.marginBottom = item.marginBottom * scale + "px";
      item.board.style.left = left + "px";
      item.board.style.transform = "scale(" + scale + ")";
    }
  }

  function initialize() {
    if (window.innerWidth > MOBILE_WIDTH) return;

    document.body.classList.add("responsive-scale-active");
    useDesktopBoardRules();

    for (const selector of BOARD_SELECTORS) {
      document.querySelectorAll(selector).forEach(frameBoard);
    }

    fitBoards();
    window.addEventListener("resize", fitBoards, { passive:true });
    window.visualViewport?.addEventListener("resize", fitBoards, { passive:true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once:true });
  } else {
    initialize();
  }
})();
