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

  const TECH_EVENTS = ["Debugging", "AI Prompt Creation", "AI Quiz", "Tech-Connection"];
  const NON_TECH_EVENTS = ["IPL Auction", "Adzap", "Dumb Charades", "Treasure Hunt"];

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

  function fillEventOptions(select) {
    select.innerHTML = `<option value="">Select Event</option>`;
    TECH_EVENTS.forEach(e => select.innerHTML += `<option value="${e}">${e}</option>`);
    NON_TECH_EVENTS.forEach(e => select.innerHTML += `<option value="${e}">${e}</option>`);
  }

  fillEventOptions(event1);
  fillEventOptions(event2);

  function buildEventOptions(selected) {
    let html = `<option value="">Select</option>`;
    TECH_EVENTS.forEach(e => {
      html += `<option value="${e}" ${selected === e ? "selected" : ""}>${e}</option>`;
    });
    NON_TECH_EVENTS.forEach(e => {
      html += `<option value="${e}" ${selected === e ? "selected" : ""}>${e}</option>`;
    });
    return html;
  }

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
    const fields = row.querySelectorAll(".edit");

    if (e.target === editBtn) {
      fields.forEach(f => f.disabled = false);
      editBtn.classList.add("hidden");
      submitBtn.classList.remove("hidden");
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