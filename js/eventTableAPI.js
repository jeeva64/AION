document.addEventListener("DOMContentLoaded", () => {

  const leaderId = sessionStorage.getItem("userid");
  if (!leaderId) {
    Swal.fire("Session Expired", "Please login again", "warning").then(() => {
      window.location.href = "login.html";
    });
    return;
  }

  const API_BASE        = "https://sjcaisymposium.onrender.com";
  const GET_ENDPOINT    = `${API_BASE}/getcandidates`;
  const TEAM_ENDPOINT   = `${API_BASE}/registerteam`;   // ← single call for the whole team

  const registeredBody    = document.getElementById("registeredBody");
  const eventSelect       = document.getElementById("eventSelect");
  const participantInputs = document.getElementById("participantInputs");
  const conflictWarning   = document.getElementById("conflictWarning");
  const conflictMessage   = document.getElementById("conflictMessage");

  // ─── EVENT CONFIGURATION ─────────────────────────────────────────
  const EVENT_CONFIG = {
    "Fixathon":        { slot: "1",    participants: 2, time: "11:00 AM - 1:00 PM" },
    "Bid Mayhem":      { slot: "BOTH", participants: 2, time: "11:00 AM - 4:00 PM (Prelims & Mains)" },
    "Mute Masters":    { slot: "1",    participants: 2, time: "11:00 AM - 1:00 PM" },
    "Treasure Titans": { slot: "1",    participants: 2, time: "11:00 AM - 1:00 PM" },
    "QRush":           { slot: "2",    participants: 2, time: "2:00 PM - 4:00 PM" },
    "VisionX":         { slot: "2",    participants: 1, time: "2:00 PM - 4:00 PM" },
    "ThinkSync":       { slot: "2",    participants: 2, time: "2:00 PM - 4:00 PM" },
    "Crazy Sell":      { slot: "2",    participants: 4, time: "2:00 PM - 4:00 PM" }
  };

  const SLOT_1_EVENTS = ["Fixathon", "Bid Mayhem", "Mute Masters", "Treasure Titans"];
  const SLOT_2_EVENTS = ["QRush", "VisionX", "ThinkSync", "Crazy Sell"];

  // ─── LIVE STATE ──────────────────────────────────────────────────
  // studentMap: registerNumber → { event1, slot1, event2, slot2 }
  //   rebuilt every time we reload from the server.
  let studentMap            = {};
  let registeredEvents      = [];   // events that already have a team
  let totalStudentCount     = 0;    // number of student docs (the 15-cap counter)

  /* ===================== SWEET ALERT HELPERS ===================== */
  function showSuccess(msg) {
    Swal.fire({ icon: "success", title: msg, timer: 2000, showConfirmButton: false });
  }
  function showError(msg) {
    Swal.fire({ icon: "error", title: "Oops!", text: msg });
  }
  function showLoading(msg = "Processing...") {
    Swal.fire({ title: msg, allowOutsideClick: false, didOpen: () => Swal.showLoading() });
  }

  /* ===================== POPULATE EVENT DROPDOWN ===================== */
  function populateEventDropdown() {
    let html = `<option value="">-- Choose Event --</option>`;

    html += `<optgroup label="Slot 1 (11:00 AM - 1:00 PM)">`;
    SLOT_1_EVENTS.forEach(event => {
      const config       = EVENT_CONFIG[event];
      const isRegistered = registeredEvents.includes(event);
      html += `<option value="${event}" ${isRegistered ? 'disabled' : ''}>
        ${event} (${config.participants} ${config.participants === 1 ? 'participant' : 'participants'})
        ${isRegistered ? '✓ Registered' : ''}
      </option>`;
    });
    html += `</optgroup>`;

    html += `<optgroup label="Slot 2 (2:00 PM - 4:00 PM)">`;
    SLOT_2_EVENTS.forEach(event => {
      const config       = EVENT_CONFIG[event];
      const isRegistered = registeredEvents.includes(event);
      html += `<option value="${event}" ${isRegistered ? 'disabled' : ''}>
        ${event} (${config.participants} ${config.participants === 1 ? 'participant' : 'participants'})
        ${isRegistered ? '✓ Registered' : ''}
      </option>`;
    });
    html += `</optgroup>`;

    eventSelect.innerHTML = html;
  }

  /* ===================== STATS BANNER ===================== */
  function updateStatsBanner() {
    const existing = document.getElementById("stats-banner");
    if (existing) existing.remove();

    const remaining   = 15 - totalStudentCount;
    const bannerColor = remaining <= 3 ? 'bg-red-50 border-red-300'
                      : remaining <= 7 ? 'bg-yellow-50 border-yellow-300'
                      :                  'bg-green-50 border-green-300';
    const textColor   = remaining <= 3 ? 'text-red-700'
                      : remaining <= 7 ? 'text-yellow-700'
                      :                  'text-green-700';

    const banner = document.createElement('div');
    banner.id        = 'stats-banner';
    banner.className = `${bannerColor} border-2 rounded-lg p-4 mb-6`;
    banner.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="${textColor} font-bold text-lg">📊 Department Student Limit</p>
          <p class="text-sm ${textColor} mt-1">
            ${totalStudentCount} / 15 students registered
            <span class="font-semibold ml-2">${remaining} slot${remaining !== 1 ? 's' : ''} remaining</span>
          </p>
        </div>
        <div class="${textColor} text-3xl font-bold">${totalStudentCount}/15</div>
      </div>`;

    const formSection = document.querySelector('.form-section');
    if (formSection) formSection.insertBefore(banner, formSection.firstChild);
  }

  /* ===================== CHECK PARTICIPANT CONFLICTS ===================== */
  // Reads from studentMap which mirrors the event1/event2 shape in the DB.
  function checkParticipantConflicts(registerNumber, selectedEvent) {
    const doc = studentMap[registerNumber];
    if (!doc) return { hasConflict: false, message: "" };

    const selectedSlot = EVENT_CONFIG[selectedEvent].slot;

    // Already in Bid Mayhem
    if (doc.event1 === "Bid Mayhem" || doc.event2 === "Bid Mayhem") {
      return { hasConflict: true, message: "Already in Bid Mayhem (blocks all other events)" };
    }

    // Trying to add Bid Mayhem but student already has an event
    if (selectedEvent === "Bid Mayhem" && doc.event1) {
      return {
        hasConflict: true,
        message: `Already in ${doc.event1}${doc.event2 ? ' & ' + doc.event2 : ''}. Bid Mayhem cannot be combined.`
      };
    }

    // Already has 2 events
    if (doc.event2) {
      return {
        hasConflict: true,
        message: `Already in 2 events: ${doc.event1} & ${doc.event2}`
      };
    }

    // Slot clash with event1
    if (doc.slot1 === selectedSlot) {
      return { hasConflict: true, message: `Time conflict with ${doc.event1} (same slot)` };
    }

    return { hasConflict: false, message: "" };
  }

  /* ===================== GENERATE PARTICIPANT INPUTS ===================== */
  function generateParticipantInputs(event) {
    const config = EVENT_CONFIG[event];
    if (!config) { participantInputs.innerHTML = ""; return; }

    const count = config.participants;
    let html = `
      <div class="participant-card">
        <h3 class="font-bold text-lg mb-4 flex items-center gap-2">
          <span class="text-2xl">👥</span>
          Team Members for ${event}
          <span class="text-sm font-normal text-slate-600">(${count} ${count === 1 ? 'participant' : 'participants'})</span>
        </h3>
        <div class="grid md:grid-cols-2 gap-4">
    `;

    for (let i = 1; i <= count; i++) {
      html += `
        <div class="space-y-2 bg-white/60 rounded-xl p-4 border border-slate-200">
          <label class="block text-sm font-semibold text-slate-700">
            ${count === 1 ? 'Participant' : `Member ${i}`} Name *
          </label>
          <input type="text" id="participant_name_${i}" placeholder="Enter full name"
            class="participant-input w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />

          <label class="block text-sm font-semibold text-slate-700 mt-3">Register Number *</label>
          <input type="text" id="participant_reg_${i}" placeholder="e.g., 21MSC001"
            class="participant-input w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
          <div id="conflict_warning_${i}" class="text-xs text-red-600 font-semibold mt-1 hidden"></div>

          <label class="block text-sm font-semibold text-slate-700 mt-3">Mobile Number *</label>
          <input type="tel" id="participant_mobile_${i}" placeholder="e.g., 9876543210" maxlength="10"
            class="participant-input w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all" />
          <div id="mobile_warning_${i}" class="text-xs text-red-600 font-semibold mt-1 hidden"></div>

          <label class="block text-sm font-semibold text-slate-700 mt-3">Degree *</label>
          <select id="participant_degree_${i}"
            class="w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all">
            <option value="">Select Degree</option>
            <option value="ug">UG</option>
            <option value="pg">PG</option>
          </select>
        </div>`;
    }

    html += `</div></div>`;
    participantInputs.innerHTML = html;

    // ── Blur listeners ──────────────────────────────────────────
    for (let i = 1; i <= count; i++) {
      // Register-number conflict check
      const regInput = document.getElementById(`participant_reg_${i}`);
      const warnDiv  = document.getElementById(`conflict_warning_${i}`);
      regInput?.addEventListener('blur', () => {
        const val = regInput.value.trim().toUpperCase();
        if (val && event) {
          const c = checkParticipantConflicts(val, event);
          warnDiv.textContent = c.hasConflict ? `⚠️ ${c.message}` : '';
          warnDiv.classList.toggle('hidden', !c.hasConflict);
          regInput.classList.toggle('border-red-500', c.hasConflict);
        }
      });

      // Mobile: digits-only filter + blur validation
      const mobileInput = document.getElementById(`participant_mobile_${i}`);
      const mobileWarn  = document.getElementById(`mobile_warning_${i}`);
      mobileInput?.addEventListener('input', () => {
        mobileInput.value = mobileInput.value.replace(/\D/g, '').slice(0, 10);
      });
      mobileInput?.addEventListener('blur', () => {
        const val   = mobileInput.value.trim();
        const valid = /^[6-9]\d{9}$/.test(val);
        if (val && !valid) {
          mobileWarn.textContent = '⚠️ Valid 10-digit number starting with 6, 7, 8 or 9';
          mobileWarn.classList.remove('hidden');
          mobileInput.classList.add('border-red-500');
        } else {
          mobileWarn.classList.add('hidden');
          mobileInput.classList.remove('border-red-500');
        }
      });
    }
  }

  /* ===================== EVENT SELECTION HANDLER ===================== */
  eventSelect.addEventListener("change", () => {
    const sel = eventSelect.value;
    if (!sel) { participantInputs.innerHTML = ""; conflictWarning.style.display = "none"; return; }
    generateParticipantInputs(sel);
    conflictWarning.style.display = "none";
  });

  /* ===================== LOAD & RENDER REGISTERED TEAMS ===================== */
  async function loadCandidates() {
    registeredBody.innerHTML = "";
    studentMap               = {};
    registeredEvents         = [];
    totalStudentCount        = 0;

    try {
      const res    = await fetch(GET_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: leaderId })
      });
      const result = await res.json();

      if (!result.success || !result.data || result.data.length === 0) {
        registeredBody.innerHTML = `
          <tr><td colspan="4" class="text-center py-8 text-slate-500">
            No teams registered yet. Start by adding your first team!
          </td></tr>`;
        populateEventDropdown();
        updateStatsBanner();
        return;
      }

      totalStudentCount = result.totalStudents;
      registeredEvents  = result.registeredEvents;

      // ── Rebuild studentMap from every doc ───────────────────────
      result.data.forEach(doc => {
        studentMap[doc.registerNumber] = {
          name:   doc.name,
          mobile: doc.mobile,
          degree: doc.degree,
          event1: doc.event1,
          slot1:  doc.slot1,
          event2: doc.event2 || null,
          slot2:  doc.slot2  || null
        };
      });

      // ── Group by event for the table ────────────────────────────
      // Each student can appear in up to 2 event groups.
      const teamsByEvent = {};

      result.data.forEach(doc => {
        [
          { event: doc.event1, slot: doc.slot1 },
          { event: doc.event2, slot: doc.slot2 }
        ].forEach(({ event, slot }) => {
          if (!event) return;                          // event2 can be null
          if (!teamsByEvent[event]) {
            teamsByEvent[event] = { event, slot, participants: [] };
          }
          teamsByEvent[event].participants.push({
            name:           doc.name,
            registerNumber: doc.registerNumber,
            degree:         doc.degree,
            mobile:         doc.mobile
          });
        });
      });

      // ── Render rows ─────────────────────────────────────────────
      let index = 1;
      Object.values(teamsByEvent).forEach(team => {
        const slotBadge =
          team.slot === "1"    ? '<span class="slot-badge slot-1">Slot 1</span>'
        : team.slot === "2"    ? '<span class="slot-badge slot-2">Slot 2</span>'
        :                        '<span class="slot-badge" style="background:linear-gradient(135deg,#667eea 0%,#f5576c 100%);">Both Slots</span>';

        const participantsList = team.participants.map(p => `
          <div class="mb-2">
            <div class="font-semibold text-sm">${p.name}</div>
            <div class="text-xs text-slate-600">${p.registerNumber}
              <span class="ml-2 inline-block px-1.5 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-700 uppercase">${p.degree}</span>
            </div>
            <div class="text-xs text-slate-500 mt-0.5">📞 ${p.mobile || '—'}</div>
          </div>`
        ).join('');

        const tr = document.createElement("tr");
        tr.className = "hover:bg-blue-50 transition-colors";
        tr.innerHTML = `
          <td class="border border-slate-200 px-3 py-3">${index++}</td>
          <td class="border border-slate-200 px-3 py-3 font-semibold">${team.event}</td>
          <td class="border border-slate-200 px-3 py-3">${slotBadge}</td>
          <td class="border border-slate-200 px-3 py-3">${participantsList}</td>`;
        registeredBody.appendChild(tr);
      });

      populateEventDropdown();
      updateStatsBanner();

    } catch (err) {
      console.error("Load candidates error:", err);
      showError("Failed to load teams");
      populateEventDropdown();
      updateStatsBanner();
    }
  }

  loadCandidates();

  /* ===================== SUBMIT — REGISTER WHOLE TEAM ===================== */
  document.getElementById("submitBtn").addEventListener("click", async () => {
    const event = eventSelect.value;
    if (!event) { showError("Please select an event!"); return; }

    if (registeredEvents.includes(event)) {
      showError(`Your team is already registered for ${event}. Only one team per event is allowed.`);
      return;
    }

    const config          = EVENT_CONFIG[event];
    const participantCount = config.participants;

    // ── Collect & validate every member before sending anything ────
    const participants     = [];
    const regNumbers       = [];
    let   newStudents      = 0;

    for (let i = 1; i <= participantCount; i++) {
      const name           = document.getElementById(`participant_name_${i}`)?.value.trim();
      const registerNumber = document.getElementById(`participant_reg_${i}`)?.value.trim().toUpperCase();
      const mobile         = document.getElementById(`participant_mobile_${i}`)?.value.trim();
      const degree         = document.getElementById(`participant_degree_${i}`)?.value;

      if (!name || !registerNumber || !mobile || !degree) {
        showError(`Please fill all details for Member ${i} (name, register number, mobile, degree).`);
        return;
      }
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        showError(`Member ${i}: Invalid mobile. Must be 10 digits starting with 6, 7, 8 or 9.`);
        return;
      }

      // Client-side conflict check
      const conflict = checkParticipantConflicts(registerNumber, event);
      if (conflict.hasConflict) {
        showError(`${name} (${registerNumber}): ${conflict.message}`);
        return;
      }

      if (!studentMap[registerNumber]) newStudents++;
      regNumbers.push(registerNumber);
      participants.push({ name, registerNumber, mobile, degree });
    }

    // Duplicate reg numbers inside the form
    const dups = regNumbers.filter((r, i) => regNumbers.indexOf(r) !== i);
    if (dups.length) {
      showError(`Duplicate register numbers in the form: ${[...new Set(dups)].join(", ")}`);
      return;
    }

    // 15-student cap (client-side pre-check)
    if (totalStudentCount + newStudents > 15) {
      showError(
        `Would exceed the 15-student limit.\n` +
        `Current: ${totalStudentCount} | New in this team: ${newStudents} | Available: ${15 - totalStudentCount}`
      );
      return;
    }

    // ── Single request — all members in one payload ────────────────
    try {
      showLoading("Registering team...");

      const res = await fetch(TEAM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaderId,
          event,
          participants   // the whole array, server handles everything
        })
      });

      const result = await res.json();
      Swal.close();

      if (result.success) {
        showSuccess(result.message);

        // Reset form
        eventSelect.value           = "";
        participantInputs.innerHTML = "";
        conflictWarning.style.display = "none";

        loadCandidates();   // refresh table + banner + dropdown
      } else {
        showError(result.message || "Registration failed");
      }

    } catch (err) {
      Swal.close();
      console.error("Submit error:", err);
      showError("Network error. Please try again.");
    }
  });

});

const logout = () => {
  sessionStorage.removeItem("userid");
  localStorage.removeItem("userid");
  window.location.href = "login.html";
};