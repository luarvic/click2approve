// Material controls the palette; the app's colorMode preference is shared across tabs.
const colorModeSwitch = document.querySelector(".docs-color-mode input");
const syncColorModeSwitch = () => {
  colorModeSwitch.checked = document.body.dataset.mdColorScheme === "slate";
};

syncColorModeSwitch();
new MutationObserver(syncColorModeSwitch).observe(document.body, {
  attributes: true,
  attributeFilter: ["data-md-color-scheme"],
});

const applyColorMode = (colorMode) => {
  const scheme = colorMode === "dark" ? "slate" : "default";
  if (document.body.dataset.mdColorScheme === scheme) return;
  document
    .querySelector(
      `[data-md-component="palette"] input[data-md-color-scheme="${scheme}"]`,
    )
    .click();
};

colorModeSwitch.addEventListener("change", () => {
  const colorMode = colorModeSwitch.checked ? "dark" : "light";
  localStorage.setItem(docsColorModeStorageKey, colorMode);
  applyColorMode(colorMode);
});

const synchronizeSharedColorMode = () => {
  const storedMode = localStorage.getItem(docsColorModeStorageKey);
  const colorMode =
    storedMode === "light" || storedMode === "dark"
      ? storedMode
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  applyColorMode(colorMode);
};

window.addEventListener("storage", (event) => {
  if (
    event.storageArea === localStorage &&
    (event.key === docsColorModeStorageKey || event.key === null)
  ) {
    synchronizeSharedColorMode();
  }
});
window.addEventListener("pageshow", synchronizeSharedColorMode);

document.querySelectorAll("[data-docs-toggle]").forEach((button) => {
  button.addEventListener("click", () => {
    const toggle = document.getElementById(button.dataset.docsToggle);
    toggle.click();
  });
});

// Match the app's persistent desktop drawer and temporary mobile drawer.
if (document.querySelector(".md-sidebar--primary")) {
  const drawerToggle = document.getElementById("__drawer");
  const drawer = document.querySelector(".md-sidebar--primary");
  const drawerButton = document.querySelector("[data-docs-toggle='__drawer']");
  const desktopLayout = window.matchMedia("(min-width: 1200px)");
  const syncDrawer = () => {
    const temporaryDrawerIsOpen =
      !desktopLayout.matches && drawerToggle.checked;
    drawer.inert = !desktopLayout.matches && !temporaryDrawerIsOpen;
    drawerButton.setAttribute("aria-expanded", String(temporaryDrawerIsOpen));
    if (temporaryDrawerIsOpen) {
      drawer.setAttribute("role", "dialog");
      drawer.setAttribute("aria-modal", "true");
      drawer.setAttribute("aria-label", "Documentation menu");
      drawer.querySelector("a").focus();
    } else {
      drawer.removeAttribute("role");
      drawer.removeAttribute("aria-modal");
      drawer.removeAttribute("aria-label");
    }
  };

  drawerToggle.addEventListener("change", () => {
    syncDrawer();
    if (!drawerToggle.checked && !desktopLayout.matches) drawerButton.focus();
  });
  desktopLayout.addEventListener("change", () => {
    drawerToggle.checked = false;
    syncDrawer();
  });
  drawer.addEventListener("keydown", (event) => {
    if (desktopLayout.matches || !drawerToggle.checked) return;
    if (event.key === "Escape") {
      event.preventDefault();
      drawerToggle.click();
    }
    if (event.key === "Tab") {
      const controls = [...drawer.querySelectorAll("a[href], summary")].filter(
        (element) => element.checkVisibility(),
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  syncDrawer();
}
