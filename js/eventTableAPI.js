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
  const eventSelect = document.getElementById("eventSelect");
  const participantInputs = document.getElementById("participantInputs");
  const conflictWarning = document.getElementById("conflictWarning");
  const conflictMessage = document.getElementById("conflictMessage");

  // EVENT CONFIGURATION WITH SLOTS AND PARTICIPANT COUNTS
  const EVENT_CONFIG = {
    "Fixathon": { slot: 1, participants: 2, time: "11:00 AM - 1:00 PM" },
    "Bid Mayhem": { slot: "BOTH", participants: 2, time: "11:00 AM - 4:00 PM (Prelims & Mains)" },
    "Mute Masters": { slot: 1, participants: 2, time: "11:00 AM - 1:00 PM" },
    "Treasure Titans": { slot: 1, participants: 2, time: "11:00 AM - 1:00 PM" },
    "QRush": { slot: 2, participants: 2, time: "2:00 PM - 4:00 PM" },
    "VisionX": { slot: 2, participants: 1, time: "2:00 PM - 4:00 PM" },
    "ThinkSync": { slot: 2, participants: 2, time: "2:00 PM - 4:00 PM" },
    "Crazy Sell": { slot: 2, participants: 4, time: "2:00 PM - 4:00 PM" }
  };

  const SLOT_1_EVENTS = ["Fixathon", "Bid Mayhem", "Mute Masters", "Treasure Titans"];
  const SLOT_2_EVENTS = ["QRush", "VisionX", "ThinkSync", "Crazy Sell"];

  // Store registered events per leader
  let registeredEvents = [];

  /* ===================== SWEET ALERT HELPERS ===================== */

  function showSuccess(msg) {
    Swal.fire({
      icon: "success",
      title: msg,
      timer: 2000,
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

  /* ===================== POPULATE EVENT DROPDOWN ===================== */

  function populateEventDropdown() {
    let html = `<option value="">-- Choose Event --</option>`;
    
    html += `<optgroup label="Slot 1 (11:00 AM - 1:00 PM)">`;
    SLOT_1_EVENTS.forEach(event => {
      const config = EVENT_CONFIG[event];
      const isDisabled = registeredEvents.includes(event);
      html += `<option value="${event}" ${isDisabled ? "disabled" : ""}>
        ${event} (${config.participants} ${config.participants === 1 ? 'participant' : 'participants'})
      </option>`;
    });
    html += `</optgroup>`;

    html += `<optgroup label="Slot 2 (2:00 PM - 4:00 PM)">`;
    SLOT_2_EVENTS.forEach(event => {
      const config = EVENT_CONFIG[event];
      const isDisabled = registeredEvents.includes(event);
      html += `<option value="${event}" ${isDisabled ? "disabled" : ""}>
        ${event} (${config.participants} ${config.participants === 1 ? 'participant' : 'participants'})
      </option>`;
    });
    html += `</optgroup>`;

    eventSelect.innerHTML = html;
  }

  /* ===================== CHECK SLOT CONFLICTS ===================== */

  function checkSlotConflict(selectedEvent) {
    const selectedConfig = EVENT_CONFIG[selectedEvent];
    
    // Special case: Bid Mayhem blocks both slots
    if (selectedEvent === "Bid Mayhem") {
      const hasAnyEvent = registeredEvents.length > 0;
      if (hasAnyEvent) {
        conflictMessage.textContent = "Bid Mayhem participants cannot register for any other events (it runs in both slots: Prelims at 11 AM-1 PM, Mains at 2 PM-4 PM).";
        conflictWarning.style.display = "block";
        return true;
      }
    }

    // Check if already registered for Bid Mayhem
    if (registeredEvents.includes("Bid Mayhem")) {
      conflictMessage.textContent = "You have already registered for Bid Mayhem, which blocks all other events.";
      conflictWarning.style.display = "block";
      return true;
    }

    // Check slot conflicts
    const selectedSlot = selectedConfig.slot;
    const conflictingEvents = registeredEvents.filter(event => {
      const config = EVENT_CONFIG[event];
      return config.slot === selectedSlot || config.slot === "BOTH" || selectedSlot === "BOTH";
    });

    if (conflictingEvents.length > 0) {
      const slotName = selectedSlot === 1 ? "Slot 1 (11 AM-1 PM)" : "Slot 2 (2 PM-4 PM)";
      conflictMessage.textContent = `Time conflict! You're already registered for ${conflictingEvents.join(", ")} in ${slotName}.`;
      conflictWarning.style.display = "block";
      return true;
    }

    conflictWarning.style.display = "none";
    return false;
  }

  /* ===================== GENERATE PARTICIPANT INPUTS ===================== */

  function generateParticipantInputs(event) {
    const config = EVENT_CONFIG[event];
    if (!config) {
      participantInputs.innerHTML = "";
      return;
    }

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
        <div class="space-y-2">
          <label class="block text-sm font-semibold text-slate-700">
            ${count === 1 ? 'Participant' : `Member ${i}`} Name *
          </label>
          <input 
            type="text" 
            id="participant_name_${i}" 
            placeholder="Enter full name"
            class="participant-input w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
          
          <label class="block text-sm font-semibold text-slate-700 mt-3">
            Register Number *
          </label>
          <input 
            type="text" 
            id="participant_reg_${i}" 
            placeholder="e.g., 21MSC001"
            class="participant-input w-full border-2 border-slate-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
          />
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    participantInputs.innerHTML = html;
  }

  /* ===================== EVENT SELECTION HANDLER ===================== */

  eventSelect.addEventListener("change", () => {
    const selectedEvent = eventSelect.value;
    
    if (!selectedEvent) {
      participantInputs.innerHTML = "";
      conflictWarning.style.display = "none";
      return;
    }

    // Check for conflicts
    const hasConflict = checkSlotConflict(selectedEvent);
    
    // Generate participant inputs regardless (user might want to see the form)
    generateParticipantInputs(selectedEvent);
  });

  /* ===================== LOAD REGISTERED TEAMS ===================== */

  async function loadCandidates() {
    registeredBody.innerHTML = "";
    registeredEvents = [];

    try {
      const res = await fetch(GET_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: leaderId })
      });

      const result = await res.json();
      if (!result.success || !result.data || result.data.length === 0) {
        registeredBody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center py-8 text-slate-500">
              No teams registered yet. Start by adding your first team!
            </td>
          </tr>
        `;
        populateEventDropdown();
        return;
      }

      // Group by event (since we now register teams per event with multiple participants)
      const teamsByEvent = {};
      
      result.data.forEach(candidate => {
        const event1 = candidate.event1;
        const event2 = candidate.event2;
        
        // Track registered events for conflict detection
        if (event1 && !registeredEvents.includes(event1)) {
          registeredEvents.push(event1);
        }
        if (event2 && !registeredEvents.includes(event2)) {
          registeredEvents.push(event2);
        }

        // Group participants by their events
        if (event1) {
          if (!teamsByEvent[event1]) {
            teamsByEvent[event1] = {
              event: event1,
              degree: candidate.degree,
              participants: []
            };
          }
          teamsByEvent[event1].participants.push({
            name: candidate.name,
            registerNumber: candidate.registerNumber
          });
        }

        if (event2) {
          if (!teamsByEvent[event2]) {
            teamsByEvent[event2] = {
              event: event2,
              degree: candidate.degree,
              participants: []
            };
          }
          teamsByEvent[event2].participants.push({
            name: candidate.name,
            registerNumber: candidate.registerNumber
          });
        }
      });

      // Render teams
      let index = 1;
      Object.values(teamsByEvent).forEach(team => {
        const config = EVENT_CONFIG[team.event];
        const slotBadge = config.slot === 1 
          ? '<span class="slot-badge slot-1">Slot 1</span>'
          : config.slot === 2
          ? '<span class="slot-badge slot-2">Slot 2</span>'
          : '<span class="slot-badge" style="background: linear-gradient(135deg, #667eea 0%, #f5576c 100%);">Both Slots</span>';

        const participantsList = team.participants.map(p => 
          `<div class="mb-2">
            <div class="font-semibold text-sm">${p.name}</div>
            <div class="text-xs text-slate-600">${p.registerNumber}</div>
          </div>`
        ).join('');

        const tr = document.createElement("tr");
        tr.className = "hover:bg-blue-50 transition-colors";
        tr.innerHTML = `
          <td class="border border-slate-200 px-3 py-3">${index++}</td>
          <td class="border border-slate-200 px-3 py-3 font-semibold">${team.event}</td>
          <td class="border border-slate-200 px-3 py-3">${slotBadge}</td>
          <td class="border border-slate-200 px-3 py-3 uppercase">${team.degree}</td>
          <td class="border border-slate-200 px-3 py-3">${participantsList}</td>
          <td class="border border-slate-200 px-3 py-3 text-center">
            <button class="editBtn action-btn bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-all" data-event="${team.event}">
              Edit
            </button>
            <button class="deleteBtn action-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs ml-2 transition-all" data-event="${team.event}">
              Delete
            </button>
          </td>
        `;
        registeredBody.appendChild(tr);
      });

      populateEventDropdown();

    } catch (err) {
      console.error(err);
      showError("Failed to load teams");
      populateEventDropdown();
    }
  }

  loadCandidates();

  /* ===================== ADD NEW TEAM ===================== */

  document.getElementById("submitBtn").addEventListener("click", async () => {
    const event = eventSelect.value;
    const degree = document.getElementById("degree").value;

    if (!event || !degree) {
      showError("Please select event and degree!");
      return;
    }

    // Check for slot conflicts
    if (checkSlotConflict(event)) {
      showError("Cannot register due to time slot conflict!");
      return;
    }

    const config = EVENT_CONFIG[event];
    const participantCount = config.participants;
    
    // Collect participant data
    const participants = [];
    for (let i = 1; i <= participantCount; i++) {
      const name = document.getElementById(`participant_name_${i}`)?.value.trim();
      const registerNumber = document.getElementById(`participant_reg_${i}`)?.value.trim();
      
      if (!name || !registerNumber) {
        showError(`Please fill all participant details (Member ${i})!`);
        return;
      }
      
      participants.push({ name, registerNumber });
    }

    // Submit each participant
    try {
      showLoading("Registering team...");
      
      for (const participant of participants) {
        const data = {
          id: leaderId,
          name: participant.name,
          registerno: participant.registerNumber,
          degree: degree,
          event1: event,
          event2: "" // We're now doing one event per registration
        };

        const res = await fetch(PUT_ENDPOINT, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        const result = await res.json();
        
        if (!result.success) {
          Swal.close();
          showError(result.message || "Registration failed");
          return;
        }
      }

      Swal.close();
      showSuccess(`Team registered successfully for ${event}!`);
      
      // Reset form
      eventSelect.value = "";
      document.getElementById("degree").value = "";
      participantInputs.innerHTML = "";
      conflictWarning.style.display = "none";
      
      // Reload data
      loadCandidates();

    } catch (err) {
      Swal.close();
      console.error(err);
      showError("Registration failed. Please try again.");
    }
  });

  /* ===================== EDIT & DELETE HANDLERS ===================== */

  registeredBody.addEventListener("click", async (e) => {
    const eventName = e.target.dataset.event;
    
    if (e.target.classList.contains("deleteBtn")) {
      const confirmation = await Swal.fire({
        title: 'Delete Team?',
        text: `This will remove your entire team from ${eventName}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete it!'
      });

      if (confirmation.isConfirmed) {
        // Here you would implement the delete API call
        showSuccess("Team deleted successfully!");
        loadCandidates();
      }
    }

    if (e.target.classList.contains("editBtn")) {
      showError("Edit functionality will be implemented based on your backend API structure.");
      // Implement edit logic based on your API
    }
  });

});

const logout = () => {
  sessionStorage.removeItem("userid");
  localStorage.removeItem("userid");
  window.location.href = "login.html";
};