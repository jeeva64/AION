document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("eventForm");
  if (!form) return;

  // 🔧 CHANGE to your real backend URL
  const API_BASE = "https://sjcaisymposium.onrender.com";
  const EVENT_REGISTER_ENDPOINT = `${API_BASE}/studreg`; 
  // ⚠️ change path to match your backend exactly

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const data = {
      name: document.getElementById("name").value.trim(),
      rollnumber: document.getElementById("rollnumber").value.trim(),
      department: document.getElementById("department").value,
      degree: document.getElementById("degree").value,
      event1: document.getElementById("event1").value,
      event2: document.getElementById('event2').value
    };

    console.log("Event registration payload:", data);

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch(EVENT_REGISTER_ENDPOINT, {
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
        throw new Error(result.message || "Event registration failed");
      }

      alert(result.message || "Event registered successfully!");
      form.reset();

    } catch (err) {
      console.error("Event registration error:", err);
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
});
