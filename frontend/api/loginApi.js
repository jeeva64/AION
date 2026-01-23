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
    const password = passwordEl.value;

    if (!email || !password) {
      alert("Please fill all fields!");
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = "Please wait...";

    // 🔹 Setup AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 45000); // 45 seconds max wait

    let wakeMessageShown = false;

    try {
      // 🔔 Show wake-up message after 5 seconds
      const wakeTimer = setTimeout(() => {
        wakeMessageShown = true;
        alert("Server is waking up. This may take some seconds. Please wait...");
      }, 5000);

      const res = await fetch(LOGIN_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      });

      clearTimeout(wakeTimer);
      clearTimeout(timeoutId);

      const result = await res.json();

      if (!res.ok || result.success !== true) {
        throw new Error(result.message || "Invalid login credentials");
      }

      alert("Login successful!");
      sessionStorage.setItem("userid", result.userid);
      window.location.href = "dashboard.html";

    } catch (err) {
      console.error("Login error:", err);

      if (err.name === "AbortError") {
        alert("Server is taking too long to respond. Please try again.");
      } else if (!wakeMessageShown) {
        alert(err.message || "Login failed. Please try again.");
      } else {
        alert("Server did not respond in time. Please try again.");
      }
    } finally {
      clearTimeout(timeoutId);
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });
});