document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("adminLoginForm");
  if (!form) return;

  const API_BASE = "https://sjcaisymposium.onrender.com";
  const ADMIN_LOGIN_ENDPOINT = `${API_BASE}/admin/adminlogin`;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const adminIdEl = document.getElementById("adminId");
    const passwordEl = document.getElementById("password");

    const adminId = adminIdEl.value.trim();
    const password = passwordEl.value.trim();

    /* ================= VALIDATION ================= */
    if (!adminId || !password) {
      Swal.fire("Required", "All fields are required", "warning");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    Swal.fire({
      title: "Logging in...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    /* ================= TIMEOUT HANDLING ================= */
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s

    try {
      const res = await fetch(ADMIN_LOGIN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Login failed");
      }

      /* ================= SUCCESS ================= */
      Swal.fire({
        icon: "success",
        title: result.message,
        timer: 1500,
        showConfirmButton: false
      });

      // 🔐 Store admin session
      sessionStorage.setItem("adminRole", result.role);
      sessionStorage.setItem("isAdminLoggedIn", "true");

      // 🔁 Role-based redirect
      setTimeout(() => {
        if (result.role === 1) {
          window.location.href = "superAdmin.html";
        } else {
          window.location.href = "moderateAdmin.html";
        }
      }, 1600);

    } catch (err) {
      console.error("Admin Login Error:", err);

      if (err.name === "AbortError") {
        Swal.fire("Timeout", "Server is taking too long. Try again.", "error");
      } else {
        Swal.fire("Login Failed", err.message, "error");
      }
    } finally {
      submitBtn.disabled = false;
      Swal.close();
    }
  });
});
