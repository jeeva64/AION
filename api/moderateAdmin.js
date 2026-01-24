const API_BASE = "https://sjcaisymposium.onrender.com";
let currentTeamData = [];
let currentEventData = [];
let currentCollege = "";
let currentDepartment = "";
let currentEventName = "";

// Auth check
if (!sessionStorage.getItem("adminRole") || sessionStorage.getItem("adminRole") !== "2") {
    window.location.href = "login.html";
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "loginAdmin.html";
});

// Tab switching
const tabs = document.querySelectorAll(".tab-btn");
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => {
            t.classList.remove("active", "border-indigo-600", "text-indigo-600");
            t.classList.add("border-transparent", "text-gray-500");
        });
        tab.classList.add("active", "border-indigo-600", "text-indigo-600");
        tab.classList.remove("border-transparent", "text-gray-500");

        document.querySelectorAll(".tab-content").forEach(content => content.classList.add("hidden"));

        if (tab.id === "tabViewTeam") {
            document.getElementById("viewTeamSection").classList.remove("hidden");
        } else {
            document.getElementById("viewEventSection").classList.remove("hidden");
        }
    });
});

// View Team
document.getElementById("searchTeamBtn").addEventListener("click", async () => {
    const college = document.getElementById("teamCollege").value.trim();
    const department = document.getElementById("teamDepartment").value.trim();

    if (!college || !department) {
        Swal.fire("Required", "All fields are required", "warning");
        return;
    }

    const btn = document.getElementById("searchTeamBtn");
    btn.disabled = true;
    btn.textContent = "Searching...";

    try {
        const res = await fetch(`${API_BASE}/admin/viewteam`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ college, department })
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
            throw new Error(result.message || "Failed to fetch team");
        }

        displayTeamResults(result.team);
        currentTeamData = result.team;
        currentCollege = college;
        currentDepartment = department;
        document.getElementById("exportTeamBtn").classList.remove("hidden");

    } catch (err) {
        Swal.fire("Error", err.message, "error");
        document.getElementById("teamResults").classList.add("hidden");
        document.getElementById("exportTeamBtn").classList.add("hidden");
    } finally {
        btn.disabled = false;
        btn.textContent = "Search Team";
    }
});

function displayTeamResults(team) {
    const tbody = document.getElementById("teamTableBody");
    tbody.innerHTML = "";

    if (team.length === 0) {
        Swal.fire("No Results", "No team found for the specified criteria", "info");
        document.getElementById("teamResults").classList.add("hidden");
        return;
    }

    team.forEach(member => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50";
        row.innerHTML = `
          <td class="px-4 py-3 text-sm text-gray-900">${member.name || 'N/A'}</td>
          <td class="px-4 py-3 text-sm text-gray-600">${member.registerNumber || 'N/A'}</td>
          <td class="px-4 py-3 text-sm text-gray-600">${member.degree || 'N/A'}</td>
          <td class="px-4 py-3 text-sm text-gray-600">${member.event1 || 'N/A'}</td>
          <td class="px-4 py-3 text-sm text-gray-600">${member.event2 || 'N/A'}</td>
          <td class="px-4 py-3 text-sm text-gray-600">${member.leaderId || 'N/A'}</td>
        `;
        tbody.appendChild(row);
    });

    document.getElementById("teamResults").classList.remove("hidden");
}

// View Event Registrations
document.getElementById("searchEventBtn").addEventListener("click", async () => {
    const eventName = document.getElementById("eventName").value.trim();

    if (!eventName) {
        Swal.fire("Required", "Event name is required", "warning");
        return;
    }

    const btn = document.getElementById("searchEventBtn");
    btn.disabled = true;
    btn.textContent = "Searching...";

    try {
        const res = await fetch(`${API_BASE}/admin/vieweventregs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ eventName })
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
            throw new Error(result.message || "Failed to fetch event registrations");
        }

        displayEventResults(result.data);
        currentEventData = result.data;
        currentEventName = eventName;
        document.getElementById("exportEventBtn").classList.remove("hidden");

    } catch (err) {
        Swal.fire("Error", err.message, "error");
        document.getElementById("eventResults").classList.add("hidden");
        document.getElementById("exportEventBtn").classList.add("hidden");
    } finally {
        btn.disabled = false;
        btn.textContent = "Search Event";
    }
});

function displayEventResults(data) {
    const container = document.getElementById("eventResults");
    container.innerHTML = "";

    if (data.length === 0) {
        Swal.fire("No Results", "No registrations found for this event", "info");
        container.classList.add("hidden");
        return;
    }

    data.forEach(team => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-xl shadow-sm p-6";

        let membersHtml = team.members.map(m => `
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm text-gray-900">${m.name}</td>
            <td class="px-4 py-3 text-sm text-gray-600">${m.registerNumber}</td>
            <td class="px-4 py-3 text-sm text-gray-600">${m.degree}</td>
            <td class="px-4 py-3 text-sm text-gray-600">${m.event1 || 'N/A'}</td>
            <td class="px-4 py-3 text-sm text-gray-600">${m.event2 || 'N/A'}</td>
          </tr>
        `).join('');

        card.innerHTML = `
          <div class="mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Team Leader: ${team.leaderId}</h3>
            <p class="text-sm text-gray-600">${team.college} - ${team.department}</p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Register No</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Degree</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event 1</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event 2</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                ${membersHtml}
              </tbody>
            </table>
          </div>
        `;

        container.appendChild(card);
    });

    container.classList.remove("hidden");
}

// ============ EXCEL EXPORT FUNCTIONS ============

// Export Team Attendance Sheet
document.getElementById("exportTeamBtn").addEventListener("click", () => {
    if (currentTeamData.length === 0) {
        Swal.fire("No Data", "No team data to export", "warning");
        return;
    }

    // Prepare data for Excel
    const excelData = currentTeamData.map((member, index) => ({
        "Register ID": index + 1,
        "Name": member.name || "",
        "Register Number": member.registerNumber || "",
        "Degree": member.degree || "",
        "Event 1": member.event1 || "",
        "Event 2": member.event2 || "",
        "Signature": ""
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add header rows for College and Department
    XLSX.utils.sheet_add_aoa(ws, [
        [`College: ${currentCollege}`],
        [`Department: ${currentDepartment}`],
        []
    ], { origin: "A1" });

    // Move data down to accommodate header
    const range = XLSX.utils.decode_range(ws['!ref']);
    range.e.r += 3;
    ws['!ref'] = XLSX.utils.encode_range(range);

    // Adjust column widths
    ws['!cols'] = [
        { wch: 12 },  // Register ID
        { wch: 25 },  // Name
        { wch: 18 },  // Register Number
        { wch: 15 },  // Degree
        { wch: 20 },  // Event 1
        { wch: 20 },  // Event 2
        { wch: 20 }   // Signature
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    // Generate filename
    const fileName = `${currentCollege}_${currentDepartment}_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Download
    XLSX.writeFile(wb, fileName);

    Swal.fire("Success", "Attendance sheet exported!", "success");
});

// Export Event Participants Sheet
document.getElementById("exportEventBtn").addEventListener("click", () => {
    if (currentEventData.length === 0) {
        Swal.fire("No Data", "No event data to export", "warning");
        return;
    }

    // Flatten event data - extract all members from all teams
    const excelData = [];

    currentEventData.forEach(team => {
        team.members.forEach(member => {
            // Only add if this member is registered for the current event
            if (member.event1 === currentEventName || member.event2 === currentEventName) {
                excelData.push({
                    "Name": member.name || "",
                    "Register Number": member.registerNumber || "",
                    "College Name": team.college || "",
                    "Department": team.department || "",
                    "Event Name": currentEventName
                });
            }
        });
    });

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Adjust column widths
    ws['!cols'] = [
        { wch: 25 },  // Name
        { wch: 18 },  // Register Number
        { wch: 30 },  // College Name
        { wch: 25 },  // Department
        { wch: 20 }   // Event Name
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Event Participants");

    // Generate filename
    const fileName = `${currentEventName}_Participants_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Download
    XLSX.writeFile(wb, fileName);

    Swal.fire("Success", "Event participants list exported!", "success");
});