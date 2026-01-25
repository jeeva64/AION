document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const API_BASE = "https://sjcaisymposium.onrender.com"; // change to Render URL later
  const LOGIN_ENDPOINT = `${API_BASE}/loginleader`;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const emailEl = document.getElementById("email");
    const passwordEl = document.getElementById("password");

    const email = emailEl.value.trim();
    const password = passwordEl.value.trim();

    /* ===================== CLIENT VALIDATION ===================== */

    if (!email || !password) {
      Swal.fire("Required", "Please fill all fields", "warning");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire("Invalid Email", "Please enter a valid email address", "error");
      emailEl.focus();
      return;
    }

    if (password.length < 6) {
      Swal.fire("Weak Password", "Password must be at least 6 characters", "error");
      passwordEl.focus();
      return;
    }

    /* ===================== UI LOCK ===================== */

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Please wait...";

    /* ===================== TIMEOUT HANDLING ===================== */

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    let wakeMessageShown = false;

    try {
      const wakeTimer = setTimeout(() => {
        wakeMessageShown = true;
        Swal.fire({
          icon: "info",
          title: "Server is waking up",
          text: "Please wait a few seconds...",
          allowOutsideClick: false
        });
      }, 5000);

      const res = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(wakeTimer);
      clearTimeout(timeoutId);

      const result = await res.json();

      if (!res.ok || result.success !== true) {
        throw new Error(result.message || "Invalid login credentials");
      }

      Swal.fire({
        icon: "success",
        title: "Login Successful",
        timer: 1200,
        showConfirmButton: false
      });

      sessionStorage.setItem("userid", result.userid);

      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1200);

    } catch (err) {
      console.error("Login error:", err);

      if (err.name === "AbortError") {
        Swal.fire("Timeout", "Server is taking too long. Try again.", "error");
      } else {
        Swal.fire("Login Failed", err.message || "Please try again", "error");
      }

    } finally {
      clearTimeout(timeoutId);
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });

});

// Mobile Menu Toggle
document.getElementById("menuBtn")?.addEventListener("click", () => {
  document.getElementById("mobileMenu").classList.toggle("hidden");
});