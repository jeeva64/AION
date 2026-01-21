<script>
  // Mobile menu toggle
  function toggleMenu() {
    const menu = document.getElementById("mobileMenu");
    menu.classList.toggle("hidden");
  }

  // Navbar scroll blur
  window.addEventListener("scroll", () => {
    const nav = document.getElementById("navbar");
    if (window.scrollY > 10) {
      nav.classList.add("bg-white/80", "backdrop-blur-md", "shadow-sm");
    } else {
      nav.classList.remove("bg-white/80", "backdrop-blur-md", "shadow-sm");
    }
  });

  // Fake logout (for now)
  function logout() {
    window.location.href = "login.html";
  }
</script>
