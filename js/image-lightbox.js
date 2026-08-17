(() => {
    if (!document.querySelector('link[href="/css/components/lightbox.css"]')) {
        const stylesheet = document.createElement("link");
        stylesheet.rel = "stylesheet";
        stylesheet.href = "/css/components/lightbox.css";
        document.head.append(stylesheet);
    }

    const SELECTOR = "img:not([data-no-lightbox])";
    let returnFocusTo = null;
    let activeGallery = [];
    let activeIndex = 0;

    const overlay = document.createElement("div");
    overlay.className = "image-lightbox";
    overlay.hidden = true;
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Image gallery");

    const closeButton = document.createElement("button");
    closeButton.className = "image-lightbox-close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Close image gallery");
    closeButton.textContent = "×";

    const previousButton = document.createElement("button");
    previousButton.className = "image-lightbox-nav image-lightbox-previous";
    previousButton.type = "button";
    previousButton.setAttribute("aria-label", "Previous image");
    previousButton.textContent = "‹";

    const nextButton = document.createElement("button");
    nextButton.className = "image-lightbox-nav image-lightbox-next";
    nextButton.type = "button";
    nextButton.setAttribute("aria-label", "Next image");
    nextButton.textContent = "›";

    const expandedImage = document.createElement("img");
    expandedImage.className = "image-lightbox-image";
    expandedImage.alt = "";

    const status = document.createElement("p");
    status.className = "image-lightbox-status";
    status.setAttribute("aria-live", "polite");

    overlay.append(
        closeButton,
        previousButton,
        expandedImage,
        nextButton,
        status
    );
    document.body.append(overlay);

    const isOutlineImage = (image) => {
        const metadata = [
            image.currentSrc,
            image.getAttribute("src"),
            image.className,
            image.alt
        ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

        return metadata.includes("outline");
    };

    const isEligible = (image) =>
        image.matches(SELECTOR) &&
        !isOutlineImage(image) &&
        !image.closest("a, button, .image-lightbox");

    const findGallerySection = (image) => {
        let section = image.closest("section");

        while (section) {
            if (Array.from(section.children).some((child) => child.matches?.("h2"))) {
                return section;
            }

            section = section.parentElement?.closest("section") || null;
        }

        return image.closest("main") || document.body;
    };

    const getGallery = (image) =>
        Array.from(findGallerySection(image).querySelectorAll(SELECTOR))
            .filter(isEligible);

    const getSectionName = (image) => {
        const section = findGallerySection(image);
        const heading = Array.from(section.children)
            .find((child) => child.matches?.("h2"));

        return heading?.textContent?.trim() || "Gallery";
    };

    const showImage = (index) => {
        if (!activeGallery.length) {
            return;
        }

        activeIndex = (index + activeGallery.length) % activeGallery.length;
        const image = activeGallery[activeIndex];
        const hasMultipleImages = activeGallery.length > 1;

        expandedImage.src = image.currentSrc || image.src;
        expandedImage.alt = image.alt || "";
        overlay.setAttribute(
            "aria-label",
            `${getSectionName(image)} image gallery`
        );
        status.textContent = hasMultipleImages
            ? `${activeIndex + 1} / ${activeGallery.length}`
            : "";
        previousButton.hidden = !hasMultipleImages;
        nextButton.hidden = !hasMultipleImages;
    };

    const closeLightbox = () => {
        if (overlay.hidden) {
            return;
        }

        overlay.hidden = true;
        expandedImage.removeAttribute("src");
        expandedImage.alt = "";
        status.textContent = "";
        activeGallery = [];
        document.body.classList.remove("lightbox-open");

        if (returnFocusTo) {
            returnFocusTo.focus();
            returnFocusTo = null;
        }
    };

    const openLightbox = (image) => {
        activeGallery = getGallery(image);
        activeIndex = Math.max(0, activeGallery.indexOf(image));
        returnFocusTo = image;
        showImage(activeIndex);
        overlay.hidden = false;
        document.body.classList.add("lightbox-open");
        closeButton.focus();
    };

    const showPrevious = () => showImage(activeIndex - 1);
    const showNext = () => showImage(activeIndex + 1);

    const makeClickable = (image) => {
        if (image.dataset.lightboxReady === "true" || !isEligible(image)) {
            return;
        }

        image.dataset.lightboxReady = "true";
        image.classList.add("image-lightbox-trigger");
        image.tabIndex = 0;
        image.setAttribute("role", "button");
        image.setAttribute(
            "aria-label",
            image.alt
                ? `Open ${image.alt} in its section gallery`
                : "Open image in its section gallery"
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
    previousButton.addEventListener("click", showPrevious);
    nextButton.addEventListener("click", showNext);
    expandedImage.addEventListener("click", () => {
        if (activeGallery.length > 1) {
            showNext();
        }
    });

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
            closeLightbox();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (overlay.hidden) {
            return;
        }

        if (event.key === "Escape") {
            closeLightbox();
        } else if (event.key === "ArrowLeft") {
            event.preventDefault();
            showPrevious();
        } else if (event.key === "ArrowRight") {
            event.preventDefault();
            showNext();
        }
    });
})();
