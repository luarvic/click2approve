// Plain links work without JavaScript; remember explicit selections on this origin.
const languagePickers = [...document.querySelectorAll(".language-picker")];
for (const picker of languagePickers) {
  picker.addEventListener("toggle", () => {
    if (picker.open) {
      for (const other of languagePickers) if (other !== picker) other.open = false;
    }
  });
  picker.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && picker.open) {
      picker.open = false;
      picker.querySelector("summary").focus();
    }
  });
  for (const link of picker.querySelectorAll("a")) {
    const destination = new URL(link.href);
    destination.search = location.search;
    destination.hash = location.hash;
    link.href = destination.href;
    link.addEventListener("click", () => {
      try {
        localStorage.setItem("language", link.dataset.language);
      } catch {
        // Navigation still works when browser storage is unavailable.
      }
    });
  }
}
document.addEventListener("click", (event) => {
  for (const picker of languagePickers) if (!picker.contains(event.target)) picker.open = false;
});
