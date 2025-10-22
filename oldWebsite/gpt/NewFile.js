							// Theme switcher logic
const themeSelect = document.getElementById("themeSelect");

// Load saved theme on page load
const savedTheme = localStorage.getItem("upa-theme") || "default";
setTheme(savedTheme);
themeSelect.value = savedTheme;

themeSelect.addEventListener("change", () => {
  const selectedTheme = themeSelect.value;
  setTheme(selectedTheme);
  localStorage.setItem("upa-theme", selectedTheme);
});

function setTheme(theme) {
  document.body.classList.remove("dark-theme", "corporate-theme");
  if (theme === "dark") {
    document.body.classList.add("dark-theme");
  } else if (theme === "corporate") {
    document.body.classList.add("corporate-theme");
  }
}

// Navbar active link highlight on scroll
const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {
  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop - 70;
    if (pageYOffset >= sectionTop) {
      current = section.getAttribute("id");
    }
  });
  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});
