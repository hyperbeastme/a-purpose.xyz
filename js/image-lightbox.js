(() => {
    if (!document.querySelector('link[href="/css/components/lightbox.css"]')) {
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = "/css/components/lightbox.css";
        document.head.append(stylesheet);
    }

    const SELECTOR = "img:not([data-no-lightbox])";
    let activeTrigger = null;

    const overlay = document.createElement("div");
    overlay.className = "image-lightbox";
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Expanded image");

    const closeButton = document.createElement("button");
    closeButton.className = "image-lightbox-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close expanded image");
    closeButton.textContent = "×";

    const expandedImage = document.createElement("img");
    expandedImage.className = "image-lightbox-image";
    expandedImage.alt = "";

    overlay.append(closeButton, expandedImage);
    document.body.append(overlay);

    const closeLightbox = () => {
        if (overlay.hidden) {
            return;
        }

        overlay.hidden = true;
        expandedImage.removeAttribute("src");
        expandedImage.alt = "";
        document.body.classList.remove("lightbox-open");

        if (activeTrigger) {
            activeTrigger.focus();
            activeTrigger = null;
        }
    };

    const openLightbox = (image) => {
        activeTrigger = image;
        expandedImage.src = image.currentSrc || image.src;
        expandedImage.alt = image.alt || "";
        overlay.hidden = false;
        document.body.classList.add("lightbox-open");
        closeButton.focus();
    };

    const makeClickable = (image) => {
        if (
            image.dataset.lightboxReady === "true" ||
            image.closest("a, button, .image-lightbox")
        ) {
            return;
        }

        image.dataset.lightboxReady = "true";
        image.classList.add("image-lightbox-trigger");
        image.tabIndex = 0;
        image.setAttribute("role", "button");
        image.setAttribute(
            "aria-label",
            image.alt
                ? `Enlarge image: ${image.alt}`
                : "Enlarge image"
        );

        image.addEventListener("click", () => openLightbox(image));
        image.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openLightbox(image);
            }
        });
    };

    document.querySelectorAll(SELECTOR).forEach(makeClickable);

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (!(node instanceof Element)) {
                    return;
                }

                if (node.matches(SELECTOR)) {
                    makeClickable(node);
                }

                node.querySelectorAll?.(SELECTOR).forEach(makeClickable);
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    closeButton.addEventListener("click", closeLightbox);

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeLightbox();
        }
    });
})();
