(function () {
    "use strict";

    (function initHeroV2Intro() {
        var hero = document.querySelector(".hero-v2");
        if (!hero) return;

        var motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");

        function replayIntro() {
            hero.classList.remove("hero-v2--play");
            if (motionMq.matches) {
                hero.classList.add("hero-v2--play");
                return;
            }
            void hero.offsetWidth;
            hero.classList.add("hero-v2--play");
        }

        replayIntro();
    })();

    (function initHeroV2Scale() {
        var MOBILE_MQ = window.matchMedia("(max-width: 1439px)");
        var heroV2ScaleRaf = null;

        function parsePx(value) {
            return parseFloat(value) || 0;
        }

        function updateHeroV2Scale() {
            var root = document.documentElement;
            var hero = document.querySelector(".hero-v2");
            if (!hero) return;

            var style = getComputedStyle(root);
            var headerH = parsePx(style.getPropertyValue("--header-h"));
            var isMobile = MOBILE_MQ.matches;
            var designW = parsePx(style.getPropertyValue(
                isMobile ? "--hero-v2-design-w-mobile" : "--hero-v2-design-w"
            ));
            var designH = parsePx(style.getPropertyValue(
                isMobile ? "--hero-v2-design-h-mobile" : "--hero-v2-design-h"
            ));

            if (!designW || !designH) return;

            var viewportW = window.innerWidth;
            var viewportH = window.visualViewport
                ? window.visualViewport.height
                : window.innerHeight;
            var availableH = isMobile
                ? viewportH
                : Math.max(0, viewportH - headerH);

            var scale = Math.max(viewportW / designW, availableH / designH);
            root.style.setProperty("--hero-v2-scale", String(scale));
        }

        function requestHeroV2ScaleUpdate() {
            if (heroV2ScaleRaf) return;
            heroV2ScaleRaf = window.requestAnimationFrame(function () {
                heroV2ScaleRaf = null;
                updateHeroV2Scale();
            });
        }

        if (typeof MOBILE_MQ.addEventListener === "function") {
            MOBILE_MQ.addEventListener("change", requestHeroV2ScaleUpdate);
        } else if (typeof MOBILE_MQ.addListener === "function") {
            MOBILE_MQ.addListener(requestHeroV2ScaleUpdate);
        }

        window.addEventListener("resize", requestHeroV2ScaleUpdate);

        if (window.visualViewport) {
            window.visualViewport.addEventListener("resize", requestHeroV2ScaleUpdate);
        }

        requestHeroV2ScaleUpdate();
    })();

    var navToggle = document.querySelector(".nav-toggle");
    var siteNav = document.getElementById("site-nav");
    var navOverlay = document.getElementById("site-nav-overlay");
    var navClose = document.querySelector(".site-nav__close");
    var navLinks = document.querySelectorAll(".nav-list a");

    function setNavOpen(open) {
        if (!siteNav || !navToggle) return;
        siteNav.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("nav-open", open);
        document.body.style.overflow = open ? "hidden" : "";
        if (navOverlay) {
            navOverlay.hidden = !open;
        }
    }

    if (navToggle && siteNav) {
        navToggle.addEventListener("click", function () {
            var isOpen = siteNav.classList.contains("is-open");
            setNavOpen(!isOpen);
        });

        if (navOverlay) {
            navOverlay.addEventListener("click", function () {
                setNavOpen(false);
            });
        }

        if (navClose) {
            navClose.addEventListener("click", function () {
                setNavOpen(false);
            });
        }

        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && siteNav.classList.contains("is-open")) {
                setNavOpen(false);
            }
        });

        navLinks.forEach(function (a) {
            a.addEventListener("click", function () {
                setNavOpen(false);
            });
        });

        var navBrand = document.querySelector(".site-nav__brand");
        if (navBrand) {
            navBrand.addEventListener("click", function () {
                setNavOpen(false);
            });
        }
    }

    (function initNavIndicator() {
        var indicator = document.getElementById("nav-indicator");
        var navListWrap = document.querySelector(".nav-list-wrap");
        if (!indicator || !navListWrap || !navLinks.length) return;

        function navSectionIds() {
            return ["intro", "story", "news", "character", "gallery", "spec"];
        }

        var sectionIds = navSectionIds();
        var sections = sectionIds
            .map(function (id) {
                return document.getElementById(id);
            })
            .filter(Boolean);

        var mobileMq = window.matchMedia("(max-width: 1439px)");

        function linkForId(id) {
            return document.querySelector('.nav-list a[href="#' + id + '"]');
        }

        function setActiveLink(link) {
            navLinks.forEach(function (a) {
                if (a === link) {
                    a.setAttribute("aria-current", "page");
                } else {
                    a.removeAttribute("aria-current");
                }
            });
        }

        function moveIndicator(link) {
            if (!link || mobileMq.matches) {
                indicator.classList.remove("is-ready");
                return;
            }

            var wrapRect = navListWrap.getBoundingClientRect();
            var linkRect = link.getBoundingClientRect();

            indicator.style.left = linkRect.left - wrapRect.left + "px";
            indicator.style.width = linkRect.width + "px";
            indicator.classList.add("is-ready");
        }

        function setIntroDefault() {
            var introLink = linkForId("intro");
            if (!introLink) return;
            setActiveLink(introLink);
            moveIndicator(introLink);
        }

        function activeSectionId() {
            var headerH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 58;
            var offset = headerH + 32;
            var current = sectionIds[0];

            sections.forEach(function (sec) {
                var top = sec.getBoundingClientRect().top;
                if (top <= offset) {
                    current = sec.id;
                }
            });

            return current;
        }

        function updateFromScroll() {
            var id = activeSectionId();
            var link = linkForId(id);
            if (link) {
                setActiveLink(link);
                moveIndicator(link);
            }
        }

        var scrollRaf = 0;
        function onScroll() {
            if (scrollRaf) return;
            scrollRaf = requestAnimationFrame(function () {
                scrollRaf = 0;
                updateFromScroll();
            });
        }

        navLinks.forEach(function (a) {
            a.addEventListener("click", function () {
                var href = a.getAttribute("href");
                if (href && href.charAt(0) === "#") {
                    var id = href.slice(1);
                    var link = linkForId(id);
                    if (link) {
                        setActiveLink(link);
                        requestAnimationFrame(function () {
                            moveIndicator(link);
                        });
                    }
                }
            });
        });

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", updateFromScroll);

        if (mobileMq.addEventListener) {
            mobileMq.addEventListener("change", updateFromScroll);
        } else if (mobileMq.addListener) {
            mobileMq.addListener(updateFromScroll);
        }

        setIntroDefault();
        requestAnimationFrame(function () {
            requestAnimationFrame(updateFromScroll);
        });
        window.addEventListener("load", updateFromScroll);
    })();

    var CHAR_ORDER = ["ren", "eric", "lucas", "caleb", "jack", "theo"];
    var charSection = document.getElementById("character");
    var iconBtns = document.querySelectorAll(".char-icon-btn");
    var panels = document.querySelectorAll(".char-sheet");
    var btnPrev = charSection ? charSection.querySelector(".char-arrow--prev") : null;
    var btnNext = charSection ? charSection.querySelector(".char-arrow--next") : null;

    function indexOfChar(id) {
        var i = CHAR_ORDER.indexOf(id);
        return i < 0 ? 0 : i;
    }

    function currentCharId() {
        var el = document.querySelector(".char-sheet.is-active");
        if (el) {
            var id = el.getAttribute("data-char-panel");
            if (id) return id;
        }
        return CHAR_ORDER[0];
    }

    function activateChar(id) {
        if (CHAR_ORDER.indexOf(id) < 0) {
            id = CHAR_ORDER[0];
        }

        iconBtns.forEach(function (btn) {
            var active = btn.getAttribute("data-char") === id;
            btn.classList.toggle("is-active", active);
            btn.setAttribute("aria-selected", active ? "true" : "false");
        });
        panels.forEach(function (panel) {
            var match = panel.getAttribute("data-char-panel") === id;
            panel.classList.toggle("is-active", match);
            panel.setAttribute("aria-hidden", match ? "false" : "true");
        });
        if (charSection) {
            charSection.setAttribute("data-char-theme", id);
        }
    }

    function activateByDelta(delta) {
        var i = indexOfChar(currentCharId());
        var n = CHAR_ORDER.length;
        var j = (i + delta) % n;
        if (j < 0) j += n;
        activateChar(CHAR_ORDER[j]);
    }

    iconBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            var id = btn.getAttribute("data-char");
            if (id) activateChar(id);
        });
    });

    if (btnPrev) {
        btnPrev.addEventListener("click", function () {
            activateByDelta(-1);
        });
    }
    if (btnNext) {
        btnNext.addEventListener("click", function () {
            activateByDelta(1);
        });
    }

    (function initGallery() {
        var gallerySection = document.getElementById("gallery");
        if (!gallerySection) return;

        var slides = gallerySection.querySelectorAll(".gallery-slide");
        var galBtns = gallerySection.querySelectorAll(".gallery-icon-btn");
        var galPrev = gallerySection.querySelector(".char-arrow--prev");
        var galNext = gallerySection.querySelector(".char-arrow--next");
        var n = slides.length;
        if (!n) return;

        function activateGalleryIndex(i) {
            i = ((i % n) + n) % n;
            galBtns.forEach(function (btn) {
                var idx = parseInt(btn.getAttribute("data-gallery-index"), 10);
                var on = idx === i;
                btn.classList.toggle("is-active", on);
                btn.setAttribute("aria-selected", on ? "true" : "false");
            });
            slides.forEach(function (slide) {
                var idx = parseInt(slide.getAttribute("data-gallery-slide"), 10);
                var on = idx === i;
                slide.classList.toggle("is-active", on);
                slide.setAttribute("aria-hidden", on ? "false" : "true");
            });
        }

        function currentGalleryIndex() {
            var el = gallerySection.querySelector(".gallery-slide.is-active");
            if (!el) return 0;
            var idx = parseInt(el.getAttribute("data-gallery-slide"), 10);
            return isNaN(idx) ? 0 : idx;
        }

        function galleryDelta(delta) {
            activateGalleryIndex(currentGalleryIndex() + delta);
        }

        galBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var idx = parseInt(btn.getAttribute("data-gallery-index"), 10);
                if (!isNaN(idx)) activateGalleryIndex(idx);
            });
        });

        if (galPrev) {
            galPrev.addEventListener("click", function () {
                galleryDelta(-1);
            });
        }
        if (galNext) {
            galNext.addEventListener("click", function () {
                galleryDelta(1);
            });
        }
    })();

    (function initSectionReveal() {
        var mainEl = document.querySelector("main");
        if (!mainEl) return;

        var sections = mainEl.querySelectorAll(".section:not(.section--hero)");
        if (!sections.length) return;

        var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        function markInView(sec) {
            sec.classList.add("is-inview");
        }

        if (reduceMotion) {
            sections.forEach(markInView);
            return;
        }

        function alreadyVisible(el) {
            var r = el.getBoundingClientRect();
            var vh = window.innerHeight || document.documentElement.clientHeight;
            var margin = vh * 0.06;
            return r.top < vh - margin && r.bottom > margin;
        }

        sections.forEach(function (sec) {
            if (alreadyVisible(sec)) {
                markInView(sec);
            }
        });

        document.documentElement.classList.add("reveal-on");

        if (!("IntersectionObserver" in window)) {
            sections.forEach(markInView);
            return;
        }

        var io = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        markInView(entry.target);
                        io.unobserve(entry.target);
                    }
                });
            },
            { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.06 }
        );

        sections.forEach(function (sec) {
            if (!sec.classList.contains("is-inview")) {
                io.observe(sec);
            }
        });
    })();

    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());
})();
