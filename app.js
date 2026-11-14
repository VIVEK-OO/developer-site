(function () {
  "use strict";

  const cfg = window.SITE_CONFIG || {};

  // 1. Bind configuration tokens across all pages
  function applyConfig() {
    document.querySelectorAll("[data-config]").forEach((el) => {
      const key = el.getAttribute("data-config");
      if (key && cfg[key] !== undefined && cfg[key] !== "") {
        el.textContent = cfg[key];
      }
    });

    document.querySelectorAll("[data-config-email]").forEach((el) => {
      if (cfg.supportEmail) {
        el.textContent = cfg.supportEmail;
        if (el.tagName === "A") {
          el.setAttribute("href", `mailto:${cfg.supportEmail}`);
        }
      }
    });

    // Update page title suffix if template uses data-title-suffix
    const titleEl = document.querySelector("title[data-title-pattern]");
    if (titleEl && cfg.appName) {
      const pattern = titleEl.getAttribute("data-title-pattern");
      titleEl.textContent = pattern
        .replace("{appName}", cfg.appName)
        .replace("{developerName}", cfg.developerName || cfg.appName);
    }

    // Bind dynamic store/download buttons
    document.querySelectorAll("[data-store-link]").forEach((btn) => {
      const kind = btn.getAttribute("data-store-link");
      const url = kind === "play" ? cfg.playStoreUrl : cfg.macAppUrl;
      if (url && url !== "#") {
        btn.setAttribute("href", url);
        btn.setAttribute("target", "_blank");
        btn.setAttribute("rel", "noopener noreferrer");
      } else {
        btn.addEventListener("click", (e) => {
          e.preventDefault();
          const label =
            kind === "play"
              ? `${cfg.appName || "App"} Android companion is preparing for Google Play release.`
              : `${cfg.appName || "App"} for macOS installer will be published soon.`;
          showToast(label);
        });
      }
    });
  }

  // 2. Theme switcher (system-aware + persistent)
  function initTheme() {
    const root = document.documentElement;
    const saved = localStorage.getItem("site-theme");
    const prefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const initial = saved || (prefersDark ? "dark" : "light");
    root.setAttribute("data-theme", initial);
    updateThemeIcon(initial);

    const toggle = document.getElementById("theme-toggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const next =
          root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem("site-theme", next);
        updateThemeIcon(next);
      });
    }
  }

  function updateThemeIcon(theme) {
    const sun = document.getElementById("icon-sun");
    const moon = document.getElementById("icon-moon");
    if (!sun || !moon) return;
    sun.style.display = theme === "dark" ? "block" : "none";
    moon.style.display = theme === "dark" ? "none" : "block";
  }

  // 3. Interactive macOS Preview Window Tabs
  const PREVIEW_PANELS = {
    mirror: {
      title: "Low-latency screen mirror & input",
      desc: "View your Android screen right inside a native macOS window and interact naturally with your Mac trackpad, mouse, and keyboard over Wi-Fi or USB.",
      specs: [
        "Direct peer-to-peer stream with hardware-accelerated decoding",
        "Pointer clicks, scrolling, and keyboard typing forwarded smoothly",
        "Works over local Wi-Fi or wired USB tether",
      ],
      status: "Encrypted · Wi-Fi / USB",
      phoneBadge: "Mirror Active",
      card1Title: "Display Session",
      card1Meta: "60 fps · Local",
      card1Sub: "1080 × 2400 · Trackpad & Keyboard Ready",
      card2Title: "Transport",
      card2Sub: "TLS + AES-256-GCM tunnel · Zero cloud relay",
      otp: "",
    },
    notify: {
      title: "Notifications & instant 2FA codes",
      desc: "See incoming calls, messages, and app alerts in a quiet macOS floating HUD, with automatic verification code detection so you never have to reach for your phone.",
      specs: [
        "Instant OTP & verification code extraction on-device",
        "Real-time notification mirroring from Android to macOS",
        "Processed strictly in memory — never stored on external servers",
      ],
      status: "AES-256-GCM · Local",
      phoneBadge: "Alerts Synced",
      card1Title: "2FA Verification Code",
      card1Meta: "Just now",
      card1Sub: "Auto-detected from SMS and copied to Mac",
      card2Title: "Notifications",
      card2Sub: "Calls, Messages & App Alerts forwarded locally",
      otp: "482 910",
    },
    clipboard: {
      title: "Universal clipboard between devices",
      desc: "Copy a link, snippet, or verification code on your Android phone and paste immediately on your Mac — or push text back from Mac to Android in one click.",
      specs: [
        "Quick Settings tile and one-tap share sheet support",
        "End-to-end encrypted transfer over your home or office LAN",
        "No account login or cloud clipboard history",
      ],
      status: "Clipboard Ready",
      phoneBadge: "Synced",
      card1Title: "Copied on Android",
      card1Meta: "Synced to Mac",
      card1Sub: "https://developer.android.com/distribute/console",
      card2Title: "Security",
      card2Sub: "Session keys stored in Keychain & EncryptedSharedPreferences",
      otp: "",
    },
    drop: {
      title: "AirDrop-style local file drop",
      desc: "Send photos, videos, APKs, and documents straight from Android’s Share menu to your Mac Finder at full local Wi-Fi speed without compression.",
      specs: [
        "Appears directly in the native Android Share sheet",
        "Automatic local discovery via mDNS / Bonjour",
        "Original file quality preserved — zero file size caps",
      ],
      status: "Bonjour · LAN",
      phoneBadge: "Ready to Receive",
      card1Title: "Incoming Transfer",
      card1Meta: "42.8 MB/s",
      card1Sub: "IMG_2026_RAW.dng · Saved to ~/Downloads",
      card2Title: "Discovery",
      card2Sub: "Found via local mDNS · Direct peer socket",
      otp: "",
    },
  };

  function initPreviewTabs() {
    const tabs = document.querySelectorAll("[data-preview-tab]");
    if (!tabs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const key = tab.getAttribute("data-preview-tab");
        const data = PREVIEW_PANELS[key];
        if (!data) return;

        tabs.forEach((t) =>
          t.setAttribute("aria-selected", t === tab ? "true" : "false")
        );

        setText("preview-title", data.title);
        setText("preview-desc", data.desc);
        setText("preview-status", data.status);
        setText("phone-badge", data.phoneBadge);
        setText("card1-title", data.card1Title);
        setText("card1-meta", data.card1Meta);
        setText("card1-sub", data.card1Sub);
        setText("card2-title", data.card2Title);
        setText("card2-sub", data.card2Sub);

        const otpEl = document.getElementById("card1-otp");
        if (otpEl) {
          otpEl.style.display = data.otp ? "block" : "none";
          otpEl.textContent = data.otp || "";
        }

        const specsEl = document.getElementById("preview-specs");
        if (specsEl) {
          specsEl.innerHTML = data.specs
            .map(
              (s) =>
                `<li><span class="check-badge" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>${escapeHtml(s)}</span></li>`
            )
            .join("");
        }
      });
    });
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function escapeHtml(str) {
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  // 4. Toast helper
  let toastTimer = null;
  function showToast(msg) {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 3200);
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyConfig();
    initTheme();
    initPreviewTabs();
  });
})();
