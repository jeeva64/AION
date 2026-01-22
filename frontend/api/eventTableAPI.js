document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("tableBody");

  // 🔐 Get leader ID from sessionStorage
  const leaderId = sessionStorage.getItem("leaderId");
  if (!leaderId) {
    alert("Session expired. Please login again.");
    window.location.href = "login.html";
    return;
  }

  const API_BASE = "https://sjcaisymposium.onrender.com";
  const EVENT_REGISTER_ENDPOINT = `${API_BASE}/studreg`;

  const TECH_EVENTS = [
    "Debugging",
    "AI Prompt Creation",
    "AI Quiz",
    "Tech-Connection"
  ];

  const NON_TECH_EVENTS = [
    "IPL Auction",
    "Adzap",
    "Dumb Charades",
    "Treasure Hunt"
  ];

  // 🔁 Generate 15 rows
  for (let i = 1; i <= 15; i++) {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="border px-2 py-1 text-center">${i}</td>

      <td class="border px-2 py-1">
        <input class="name w-full border rounded px-1 py-1" placeholder="Name">
      </td>

      <td class="border px-2 py-1">
        <input class="roll w-full border rounded px-1 py-1" placeholder="Register No">
      </td>

      <td class="border px-2 py-1">
        <select class="degree w-full border rounded px-1 py-1">
          <option value="">Select</option>
          <option value="UG">UG</option>
          <option value="PG">PG</option>
        </select>
      </td>

      <td class="border px-2 py-1">
        ${buildEventDropdown("event1")}
      </td>

      <td class="border px-2 py-1">
        ${buildEventDropdown("event2")}
      </td>

      <td class="border px-2 py-1 text-center">
        <button class="saveBtn bg-blue-600 text-white px-2 py-1 rounded text-xs mr-1">
          Save
        </button>
        <button class="editBtn bg-slate-300 text-slate-800 px-2 py-1 rounded text-xs" disabled>
          Edit
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  }

  // Build dropdown HTML
  function buildEventDropdown(cls) {
    let html = `<select class="${cls} w-full border rounded px-1 py-1">
      <option value="">Select</option>
      <optgroup label="Technical Events">`;
    TECH_EVENTS.forEach(e => {
      html += `<option value="${e}">${e}</option>`;
    });
    html += `</optgroup><optgroup label="Non-Technical Events">`;
    NON_TECH_EVENTS.forEach(e => {
      html += `<option value="${e}">${e}</option>`;
    });
    html += `</optgroup></select>`;
    return html;
  }

  // 🔘 Handle Save / Edit clicks
  tableBody.addEventListener("click", async (e) => {
    const btn = e.target;
    if (!btn.classList.contains("saveBtn") && !btn.classList.contains("editBtn")) return;

    const row = btn.closest("tr");

    const nameInput = row.querySelector(".name");
    const rollInput = row.querySelector(".roll");
    const degreeSelect = row.querySelector(".degree");
    const event1Select = row.querySelector(".event1");
    const event2Select = row.querySelector(".event2");

    // SAVE
    if (btn.classList.contains("saveBtn")) {
      const name = nameInput.value.trim();
      const registerno = rollInput.value.trim();
      const degree = degreeSelect.value;
      const event1 = event1Select.value;
      const event2 = event2Select.value;

      if (!name || !registerno || !degree || !event1 || !event2) {
        alert("Please fill all fields in this row.");
        return;
      }

      if (event1 === event2) {
        alert("Event 1 and Event 2 cannot be the same.");
        return;
      }

      const data = {
        id: leaderId,
        name,
        registerno,
        degree,
        event1,
        event2
      };

      btn.disabled = true;
      btn.textContent = "Saving...";

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
          throw new Error(result.message || "Save failed");
        }

        alert(`Row saved: ${name}`);

        // lock row
        [nameInput, rollInput, degreeSelect, event1Select, event2Select]
          .forEach(el => el.disabled = true);

        row.querySelector(".editBtn").disabled = false;

      } catch (err) {
        console.error("Save error:", err);
        alert(err.message || "Error saving row");
      } finally {
        btn.disabled = false;
        btn.textContent = "Save";
      }
    }

    // EDIT
    if (btn.classList.contains("editBtn")) {
      [nameInput, rollInput, degreeSelect, event1Select, event2Select]
        .forEach(el => el.disabled = false);

      row.querySelector(".editBtn").disabled = true;
    }
  });

});
