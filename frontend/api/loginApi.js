document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  // 🔧 CHANGE to your real Render backend URL
  const API_BASE = "https://sjcaisymposium.onrender.com";
  const LOGIN_ENDPOINT = `${API_BASE}/loginleader`; 
  // or `${API_BASE}/regleader/login` or `/api/login` — match backend exactly

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    const data = {
      email,
      password
    };

    console.log("Login payload:", data);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const ct = res.headers.get("content-type") || "";
      const result = ct.includes("application/json")
        ? await res.json()
        : { message: await res.text() };

      if (!res.ok) {
        throw new Error(result.message || "Invalid email or password");
      }

      // ✅ Login success
      alert(result.message || "Login successful!");
      sessionStorage.setItem("leaderId", result.id);

      // 🔐 OPTIONAL: store token or user info
      if (result.token) {
        localStorage.setItem("authToken", result.token);
      }

      // Redirect to admin dashboard
      window.location.href = "dashboard.html";

    } catch (err) {
      console.error("Login error:", err);
      alert(err.message || "Login failed. Please try again.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
