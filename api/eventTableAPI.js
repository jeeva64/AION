document.addEventListener("DOMContentLoaded", () => {

  const leaderId = sessionStorage.getItem("userid");
  if (!leaderId) {
    Swal.fire("Session Expired", "Please login again", "warning").then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  const API_BASE = "https://sjcaisymposium.onrender.com";
  const GET_ENDPOINT = `${API_BASE}/getcandidates`;
  const PUT_ENDPOINT = `${API_BASE}/studreg`;

  const registeredBody = document.getElementById("registeredBody");

  const TECH_EVENTS = ["Fixathon", "VisonX", "QRush", "ThinkSync"];
  const NON_TECH_EVENTS = ["Bid Mayhem", "Crazy Sell", "Mute Masters", "Treasure Titans"];

  const event1 = document.getElementById("event1");
  const event2 = document.getElementById("event2");

  /* ===================== SWEET ALERT HELPERS ===================== */

  function showSuccess(msg) {
    Swal.fire({
      icon: "success",
      title: msg,
      timer: 1500,
      showConfirmButton: false
    });
  }

  function showError(msg) {
    Swal.fire({
      icon: "error",
      title: "Oops!",
      text: msg
    });
  }

  function showLoading(msg = "Processing...") {
    Swal.fire({
      title: msg,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  }

  /* ===================== EVENT DROPDOWNS ===================== */

function buildEventOptions(selected = "", disabled = "") {
  let html = `<option value="">Select Event</option>`;

  html += `<optgroup label="Technical Events">`;
  TECH_EVENTS.forEach(e => {
    html += `
      <option value="${e}"
        ${selected === e ? "selected" : ""}
        ${disabled === e ? "disabled" : ""}>
        ${e}
      </option>`;
  });
  html += `</optgroup>`;

  html += `<optgroup label="Non‑Technical Events">`;
  NON_TECH_EVENTS.forEach(e => {
    html += `
      <option value="${e}"
        ${selected === e ? "selected" : ""}
        ${disabled === e ? "disabled" : ""}>
        ${e}
      </option>`;
  });
  html += `</optgroup>`;

  return html;
}

/* INITIAL LOAD (ADD NEW CANDIDATE) */
event1.innerHTML = buildEventOptions();
event2.innerHTML = buildEventOptions();

/* PREVENT SAME EVENT (ADD FORM) */
event1.addEventListener("change", () => {
  event2.innerHTML = buildEventOptions(event2.value, event1.value);
});

event2.addEventListener("change", () => {
  event1.innerHTML = buildEventOptions(event1.value, event2.value);
});


  /* ===================== LOAD REGISTERED CANDIDATES ===================== */

  async function loadCandidates() {
    registeredBody.innerHTML = "";

    try {
      const res = await fetch(GET_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: leaderId })
      });

      const result = await res.json();
      if (!result.success) return;

      result.data.forEach((c, i) => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
          <td class="border px-2 py-1">${i + 1}</td>
          <td class="border px-2 py-1">
            <input value="${c.name}" class="edit name border rounded px-1 py-1 w-full" disabled>
          </td>
          <td class="border px-2 py-1">
            <input value="${c.registerNumber}" class="edit reg border rounded px-1 py-1 w-full" disabled>
          </td>
          <td class="border px-2 py-1">
            <select class="edit degree border rounded px-1 py-1 w-full" disabled>
              <option value="ug" ${c.degree === "ug" ? "selected" : ""}>UG</option>
              <option value="pg" ${c.degree === "pg" ? "selected" : ""}>PG</option>
            </select>
          </td>
          <td class="border px-2 py-1">
            <select class="edit event1 border rounded px-1 py-1 w-full" disabled>
              ${buildEventOptions(c.event1)}
            </select>
          </td>
          <td class="border px-2 py-1">
            <select class="edit event2 border rounded px-1 py-1 w-full" disabled>
              ${buildEventOptions(c.event2)}
            </select>
          </td>
          <td class="border px-2 py-1 text-center">
            <button class="editBtn bg-slate-300 px-2 py-1 rounded text-xs">Edit</button>
            <button class="submitBtn bg-blue-600 text-white px-2 py-1 rounded text-xs hidden">Submit</button>
            <button class="cancelBtn bg-red-500 text-white px-2 py-1 rounded text-xs hidden">Cancel</button>
          </td>
        `;
        registeredBody.appendChild(tr);
      });

    } catch (err) {
      console.error(err);
      showError("Failed to load candidates");
    }
  }

  loadCandidates();

  /* ===================== ADD NEW CANDIDATE ===================== */

  document.getElementById("submitBtn").addEventListener("click", async () => {
    const name = document.getElementById("name").value.trim();
    const registerno = document.getElementById("registerno").value.trim();
    const degree = document.getElementById("degree").value;
    const ev1 = event1.value;
    const ev2 = event2.value;

    if (!name || !registerno || !degree || !ev1 || !ev2) {
      showError("Fill all fields!");
      return;
    }

    if (ev1 === ev2) {
      showError("Events cannot be same!");
      return;
    }

    const data = { id: leaderId, name, registerno, degree, event1: ev1, event2: ev2 };

    try {
      showLoading("Submitting...");
      const res = await fetch(PUT_ENDPOINT, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      Swal.close();

      if (!result.success) {
        showError(result.message);
        return;
      }

      showSuccess("Candidate Added!");
      loadCandidates();
      /* ✅ RESET ADD FORM */
      document.getElementById("name").value = "";
      document.getElementById("registerno").value = "";
      document.getElementById("degree").value = "";

      // reset event dropdowns properly
      event1.innerHTML = buildEventOptions();
      event2.innerHTML = buildEventOptions();

      // optional UX: focus back to first input
      document.getElementById("name").focus();


    } catch (err) {
      Swal.close();
      console.error(err);
      showError("Submission failed");
    }
  });

  /* ===================== EDIT & UPDATE EXISTING ===================== */

  registeredBody.addEventListener("click", async (e) => {
    const row = e.target.closest("tr");
    if (!row) return;

    const editBtn = row.querySelector(".editBtn");
    const submitBtn = row.querySelector(".submitBtn");
    const cancelBtn = row.querySelector(".cancelBtn");
    const fields = row.querySelectorAll(".edit");

    // Store original values once
  if (!row.dataset.original) {
    row.dataset.original = JSON.stringify({
      name: row.querySelector(".name").value,
      reg: row.querySelector(".reg").value,
      degree: row.querySelector(".degree").value,
      event1: row.querySelector(".event1").value,
      event2: row.querySelector(".event2").value
    });
  }

  if (e.target === editBtn) {
    fields.forEach(f => f.disabled = false);

    const ev1 = row.querySelector(".event1");
    const ev2 = row.querySelector(".event2");

    ev1.innerHTML = buildEventOptions(ev1.value, ev2.value);
    ev2.innerHTML = buildEventOptions(ev2.value, ev1.value);

    ev1.addEventListener("change", () => {
      ev2.innerHTML = buildEventOptions(ev2.value, ev1.value);
    });

    ev2.addEventListener("change", () => {
      ev1.innerHTML = buildEventOptions(ev1.value, ev2.value);
    });

    
    editBtn.classList.add("hidden");
    submitBtn.classList.remove("hidden");
    cancelBtn.classList.remove("hidden");
  }
/* ===================== Cancel button Logic ===================== */
  if (e.target === cancelBtn) {
  const original = JSON.parse(row.dataset.original);

  row.querySelector(".name").value = original.name;
  row.querySelector(".reg").value = original.reg;
  row.querySelector(".degree").value = original.degree;
  row.querySelector(".event1").value = original.event1;
  row.querySelector(".event2").value = original.event2;

  fields.forEach(f => f.disabled = true);

  submitBtn.classList.add("hidden");
  cancelBtn.classList.add("hidden");
  editBtn.classList.remove("hidden");
}



    if (e.target === submitBtn) {
      const data = {
        id: leaderId,
        name: row.querySelector(".name").value.trim(),
        registerno: row.querySelector(".reg").value.trim(),
        degree: row.querySelector(".degree").value,
        event1: row.querySelector(".event1").value,
        event2: row.querySelector(".event2").value
      };

      if (!data.name || !data.registerno || !data.degree || !data.event1 || !data.event2) {
        showError("Fill all fields!");
        return;
      }

      if (data.event1 === data.event2) {
        showError("Events cannot be same!");
        return;
      }

      try {
        showLoading("Updating...");
        const res = await fetch(PUT_ENDPOINT, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const result = await res.json();
        Swal.close();

        if (!result.success) {
          showError(result.message);
          return;
        }

        showSuccess("Updated Successfully!");
        loadCandidates();

      } catch (err) {
        Swal.close();
        console.error(err);
        showError("Update failed");
      }
    }
  });

});
const logout = () =>{
  localStorage.removeItem("userid");
  window.location.href = "login.html";
}