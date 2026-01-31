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
  const POST_ENDPOINT = `${API_BASE}/studreg`;
  const DELETE_ENDPOINT = `${API_BASE}/deleteteam`;

  const registeredBody = document.getElementById("registeredBody");
  const eventSelect = document.getElementById("eventSelect");
  const participantInputs = document.getElementById("participantInputs");
  const conflictWarning = document.getElementById("conflictWarning");
  const conflictMessage = document.getElementById("conflictMessage");

  // EVENT CONFIGURATION
  const EVENT_CONFIG = {
    "Fixathon": { slot: "1", participants: 2, time: "11:00 AM - 1:00 PM" },
    "Bid Mayhem": { slot: "BOTH", participants: 2, time: "11:00 AM - 4:00 PM (Prelims & Mains)" },
    "Mute Masters": { slot: "1", participants: 2, time: "11:00 AM - 1:00 PM" },
    "Treasure Titans": { slot: "1", participants: 2, time: "11:00 AM - 1:00 PM" },
    "QRush": { slot: "2", participants: 2, time: "2:00 PM - 4:00 PM" },
    "VisionX": { slot: "2", participants: 1, time: "2:00 PM - 4:00 PM" },
    "ThinkSync": { slot: "2", participants: 2, time: "2:00 PM - 4:00 PM" },
    "Crazy Sell": { slot: "2", participants: 4, time: "2:00 PM - 4:00 PM" }
  };

  const SLOT_1_EVENTS = ["Fixathon", "Bid Mayhem", "Mute Masters", "Treasure Titans"];
  const SLOT_2_EVENTS = ["QRush", "VisionX", "ThinkSync", "Crazy Sell"];

  // Track registered data
  let participantRegistrations = {}; // registerNumber -> events[]
  let registeredEvents = []; // List of events already registered
  let uniqueStudentCount = 0; // Total unique students
  let allRegistrations = []; // Store all data for delete functionality

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
      const isRegistered = registeredEvents.includes(event);
      html += `<option value="${event}" ${isRegistered ? 'disabled' : ''}>
        ${event} (${config.participants} ${config.participants === 1 ? 'participant' : 'participants'})
        ${isRegistered ? '✓ Registered' : ''}
      </option>`;
    });
    html += `</optgroup>`;

    html += `<optgroup label="Slot 2 (2:00 PM - 4:00 PM)">`;
    SLOT_2_EVENTS.forEach(event => {
      const config = EVENT_CONFIG[event];
      const isRegistered = registeredEvents.includes(event);
      html += `<option value="${event}" ${isRegistered ? 'disabled' : ''}>
        ${event} (${config.participants} ${config.participants === 1 ? 'participant' : 'participants'})
        ${isRegistered ? '✓ Registered' : ''}
      </option>`;
    });
    html += `</optgroup>`;

    eventSelect.innerHTML = html;
  }

  /* ===================== UPDATE STUDENT COUNT DISPLAY ===================== */

  function updateStudentCountDisplay() {
    // Add a stats banner at the top of the form
    const existingBanner = document.getElementById("stats-banner");
    if (existingBanner) {
      existingBanner.remove();
    }

    const remaining = 15 - uniqueStudentCount;
    const bannerColor = remaining <= 3 ? 'bg-red-50 border-red-300' : remaining <= 7 ? 'bg-yellow-50 border-yellow-300' : 'bg-green-50 border-green-300';
    const textColor = remaining <= 3 ? 'text-red-700' : remaining <= 7 ? 'text-yellow-700' : 'text-green-700';

    const banner = document.createElement('div');
    banner.id = 'stats-banner';
    banner.className = `${bannerColor} border-2 rounded-lg p-4 mb-6`;
    banner.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="${textColor} font-bold text-lg">
            📊 Department Statistics
          </p>
          <p class="text-sm ${textColor} mt-1">
            ${uniqueStudentCount} / 15 unique students registered
            <span class="font-semibold ml-2">${remaining} students remaining</span>
          </p>
        </div>
        <div class="${textColor} text-3xl font-bold">
          ${uniqueStudentCount}/15
        </div>
      </div>
    `;

    const formSection = document.querySelector('.form-section');
    formSection.insertBefore(banner, formSection.firstChild);
  }

  /* ===================== CHECK PARTICIPANT CONFLICTS ===================== */

  function checkParticipantConflicts(registerNumber, selectedEvent) {
    if (!registerNumber || !participantRegistrations[registerNumber]) {
      return { hasConflict: false, message: "" };
    }

    const existingEvents = participantRegistrations[registerNumber];
    const selectedSlot = EVENT_CONFIG[selectedEvent].slot;

    // Check if participant is in Bid Mayhem
    if (existingEvents.some(e => e.event === "Bid Mayhem")) {
      return {
        hasConflict: true,
        message: `Already in Bid Mayhem (blocks all other events)`
      };
    }

    // Check if trying to register Bid Mayhem after other events
    if (selectedEvent === "Bid Mayhem" && existingEvents.length > 0) {
      return {
        hasConflict: true,
        message: `Already in ${existingEvents.map(e => e.event).join(", ")}. Bid Mayhem cannot be combined.`
      };
    }

    // Check max 2 events rule per student
    if (existingEvents.length >= 2) {
      return {
        hasConflict: true,
        message: `Already in 2 events: ${existingEvents.map(e => e.event).join(", ")}`
      };
    }

    // Check slot conflict
    const slotConflict = existingEvents.find(e => {
      const existingSlot = EVENT_CONFIG[e.event].slot;
      return existingSlot === selectedSlot || existingSlot === "BOTH" || selectedSlot === "BOTH";
    });

    if (slotConflict) {
      return {
        hasConflict: true,
        message: `Time conflict with ${slotConflict.event}`
      };
    }

    return { hasConflict: false, message: "" };
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
            data-participant-index="${i}"
          />
          <div id="conflict_warning_${i}" class="text-xs text-red-600 font-semibold mt-1 hidden"></div>
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;

    participantInputs.innerHTML = html;

    // Add real-time conflict checking
    const selectedEvent = eventSelect.value;
    for (let i = 1; i <= count; i++) {
      const regInput = document.getElementById(`participant_reg_${i}`);
      const warningDiv = document.getElementById(`conflict_warning_${i}`);
      
      regInput?.addEventListener('blur', () => {
        const regNumber = regInput.value.trim().toUpperCase();
        if (regNumber && selectedEvent) {
          const conflict = checkParticipantConflicts(regNumber, selectedEvent);
          if (conflict.hasConflict) {
            warningDiv.textContent = `⚠️ ${conflict.message}`;
            warningDiv.classList.remove('hidden');
            regInput.classList.add('border-red-500');
          } else {
            warningDiv.classList.add('hidden');
            regInput.classList.remove('border-red-500');
          }
        }
      });
    }
  }

  /* ===================== EVENT SELECTION HANDLER ===================== */

  eventSelect.addEventListener("change", () => {
    const selectedEvent = eventSelect.value;
    
    if (!selectedEvent) {
      participantInputs.innerHTML = "";
      conflictWarning.style.display = "none";
      return;
    }

    generateParticipantInputs(selectedEvent);
    conflictWarning.style.display = "none";
  });

  /* ===================== LOAD REGISTERED TEAMS ===================== */

  async function loadCandidates() {
    registeredBody.innerHTML = "";
    participantRegistrations = {};
    registeredEvents = [];
    allRegistrations = [];

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
        uniqueStudentCount = 0;
        populateEventDropdown();
        updateStudentCountDisplay();
        return;
      }

      allRegistrations = result.data;
      
      // Track unique students and events
      const uniqueStudents = new Set();
      
      result.data.forEach(candidate => {
        const regNumber = candidate.registerNumber?.toUpperCase();
        if (regNumber) {
          uniqueStudents.add(regNumber);
          
          if (!participantRegistrations[regNumber]) {
            participantRegistrations[regNumber] = [];
          }

          if (candidate.event) {
            participantRegistrations[regNumber].push({
              event: candidate.event,
              degree: candidate.degree,
              slot: candidate.slot
            });
          }
        }
      });

      uniqueStudentCount = uniqueStudents.size;

      // Group by event for display
      const teamsByEvent = {};
      
      result.data.forEach(candidate => {
        const event = candidate.event;
        
        if (event) {
          if (!teamsByEvent[event]) {
            teamsByEvent[event] = {
              event: event,
              degree: candidate.degree,
              slot: candidate.slot,
              participants: []
            };
            registeredEvents.push(event);
          }
          
          const exists = teamsByEvent[event].participants.some(
            p => p.registerNumber === candidate.registerNumber
          );
          
          if (!exists) {
            teamsByEvent[event].participants.push({
              name: candidate.name,
              registerNumber: candidate.registerNumber
            });
          }
        }
      });

      // Render teams
      let index = 1;
      Object.values(teamsByEvent).forEach(team => {
        const config = EVENT_CONFIG[team.event];
        if (!config) return;

        const slotBadge = team.slot === "1" 
          ? '<span class="slot-badge slot-1">Slot 1</span>'
          : team.slot === "2"
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
            <button class="deleteBtn action-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-all" data-event="${team.event}">
              Delete Team
            </button>
          </td>
        `;
        registeredBody.appendChild(tr);
      });

      populateEventDropdown();
      updateStudentCountDisplay();

    } catch (err) {
      console.error("Load candidates error:", err);
      showError("Failed to load teams");
      populateEventDropdown();
      updateStudentCountDisplay();
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

    // Check if event already registered
    if (registeredEvents.includes(event)) {
      showError(`Your team is already registered for ${event}. Only one team per event is allowed.`);
      return;
    }

    const config = EVENT_CONFIG[event];
    const participantCount = config.participants;
    
    // Collect and validate participant data
    const participants = [];
    let hasConflict = false;
    let conflictMessages = [];
    const newStudents = new Set();

    for (let i = 1; i <= participantCount; i++) {
      const name = document.getElementById(`participant_name_${i}`)?.value.trim();
      const registerNumber = document.getElementById(`participant_reg_${i}`)?.value.trim().toUpperCase();
      
      if (!name || !registerNumber) {
        showError(`Please fill all participant details (Member ${i})!`);
        return;
      }

      // Track new students for 15-limit check
      if (!participantRegistrations[registerNumber]) {
        newStudents.add(registerNumber);
      }

      // Check for conflicts
      const conflict = checkParticipantConflicts(registerNumber, event);
      if (conflict.hasConflict) {
        hasConflict = true;
        conflictMessages.push(`${name} (${registerNumber}): ${conflict.message}`);
      }
      
      participants.push({ name, registerNumber });
    }

    // Check 15 student limit
    if (uniqueStudentCount + newStudents.size > 15) {
      showError(`This would exceed the 15-student limit. You have ${uniqueStudentCount} students registered. Adding ${newStudents.size} new students would total ${uniqueStudentCount + newStudents.size}.`);
      return;
    }

    // Show conflicts
    if (hasConflict) {
      const conflictList = conflictMessages.map(msg => `• ${msg}`).join('\n');
      showError(`Cannot register due to conflicts:\n\n${conflictList}`);
      return;
    }

    // Check for duplicate register numbers in current form
    const regNumbers = participants.map(p => p.registerNumber);
    const duplicates = regNumbers.filter((num, idx) => regNumbers.indexOf(num) !== idx);
    if (duplicates.length > 0) {
      showError(`Duplicate register numbers in the form: ${duplicates.join(", ")}`);
      return;
    }

    // Submit each participant
    try {
      showLoading("Registering team...");
      
      let successCount = 0;
      let failedParticipants = [];

      for (const participant of participants) {
        const data = {
          id: leaderId,
          name: participant.name,
          registerno: participant.registerNumber,
          degree: degree,
          event1: event
        };

        try {
          const res = await fetch(POST_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });

          const result = await res.json();
          
          if (result.success) {
            successCount++;
          } else {
            failedParticipants.push({
              name: participant.name,
              error: result.message || "Unknown error"
            });
          }
        } catch (fetchErr) {
          failedParticipants.push({
            name: participant.name,
            error: "Network error: " + fetchErr.message
          });
        }
      }

      Swal.close();

      if (successCount === participants.length) {
        showSuccess(`Team registered successfully for ${event}!`);
        
        // Reset form
        eventSelect.value = "";
        document.getElementById("degree").value = "";
        participantInputs.innerHTML = "";
        conflictWarning.style.display = "none";
        
        // Reload data
        loadCandidates();
      } else if (successCount > 0) {
        const failedList = failedParticipants.map(f => `${f.name}: ${f.error}`).join('<br>');
        Swal.fire({
          icon: 'warning',
          title: 'Partial Success',
          html: `<p>${successCount} out of ${participants.length} registered successfully.</p>
                 <p class="text-sm mt-2">Failed registrations:</p>
                 <div class="text-xs text-left mt-1 bg-red-50 p-2 rounded">${failedList}</div>`,
          confirmButtonText: 'OK'
        });
        loadCandidates();
      } else {
        const failedList = failedParticipants.map(f => `${f.name}: ${f.error}`).join('<br>');
        Swal.fire({
          icon: 'error',
          title: 'Registration Failed',
          html: `<div class="text-left">
                   <p class="mb-2">All registrations failed:</p>
                   <div class="text-sm bg-red-50 p-3 rounded">${failedList}</div>
                 </div>`,
          confirmButtonText: 'OK'
        });
      }

    } catch (err) {
      Swal.close();
      console.error("Submit error:", err);
      showError("Registration failed. Please try again.");
    }
  });

  /* ===================== DELETE TEAM HANDLER ===================== */

  registeredBody.addEventListener("click", async (e) => {
    if (e.target.classList.contains("deleteBtn")) {
      const eventName = e.target.dataset.event;
      
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
        try {
          showLoading("Deleting team...");
          
          const res = await fetch(`${DELETE_ENDPOINT}/${leaderId}/${eventName}`, {
            method: "DELETE"
          });
          
          const result = await res.json();
          
          Swal.close();
          
          if (result.success) {
            showSuccess(`Team deleted! Removed ${result.deletedCount} participant(s).`);
            loadCandidates();
          } else {
            showError(result.message || "Failed to delete team");
          }
          
        } catch (err) {
          Swal.close();
          console.error("Delete error:", err);
          showError("Failed to delete team");
        }
      }
    }
  });

});

const logout = () => {
  sessionStorage.removeItem("userid");
  localStorage.removeItem("userid");
  window.location.href = "login.html";
};