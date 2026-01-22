document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("eventForm");
  if (!form) return;

  // 🔐 Get leader ID from sessionStorage
  const leaderId = sessionStorage.getItem("leaderId");
  if (!leaderId) {
    alert("Session expired. Please login again.");
    window.location.href = "login.html";
    return;
  }

  const API_BASE = "https://sjcaisymposium.onrender.com";
  const EVENT_REGISTER_ENDPOINT = `${API_BASE}/studreg`;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // ✅ EXACT payload backend expects
    const data = {
      id: leaderId,
      name: document.getElementById("name").value.trim(),
      registerno: document.getElementById("rollnumber").value.trim(),
      degree: document.getElementById("degree").value,
      event1: document.getElementById("event1").value,
      event2: document.getElementById("event2").value
    };

    console.log("Event registration payload (ALIGNED):", data);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch(EVENT_REGISTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const ct = res.headers.get("content-type") || "";
      const result = ct.includes("application/json")
        ? await res.json()
        : { message: await res.text() };

      if (!res.ok) {
        console.error("Backend status:", res.status);
        console.error("Backend response:", result);
        throw new Error(result.message || "Server error");
      }

      alert(result.message || "Student registered successfully!");
      form.reset();

    } catch (err) {
      console.error("Event registration error:", err);
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
