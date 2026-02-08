const API_BASE = "https://sjcaisymposium.onrender.com";
let currentTeamData = [];
let currentEventData = [];
let currentCollege = "";
let currentDepartment = "";
let currentEventName = "";
let collegeStatsData = [];

// Auth check
if (!sessionStorage.getItem("adminRole") || sessionStorage.getItem("adminRole") !== "1") {
    window.location.href = "loginAdmin.html";
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "loginAdmin.html";
});

// ============ TAB SWITCHING ============
const tabs = document.querySelectorAll(".tab-btn");
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => {
            t.classList.remove("active", "border-blue-600", "text-blue-600");
            t.classList.add("border-transparent", "text-gray-500");
        });
        
        tab.classList.add("active", "border-blue-600", "text-blue-600");
        tab.classList.remove("border-transparent", "text-gray-500");

        document.querySelectorAll(".tab-content").forEach(content => content.classList.add("hidden"));

        if (tab.id === "tabDashboard") {
            document.getElementById("dashboardSection").classList.remove("hidden");
        } else if (tab.id === "tabViewTeam") {
            document.getElementById("viewTeamSection").classList.remove("hidden");
        } else if (tab.id === "tabViewEvent") {
            document.getElementById("viewEventSection").classList.remove("hidden");
        } else if (tab.id === "tabManageColleges") {
            document.getElementById("manageCollegesSection").classList.remove("hidden");
        }
    });
});

// ============ DASHBOARD STATS ============
async function loadDashboardStats() {
    const loading = document.getElementById("statsLoading");
    const container = document.getElementById("statsContainer");
    
    loading.classList.remove("hidden");
    container.classList.add("opacity-50");

    try {
        const res = await fetch(`${API_BASE}/admin/dashboardstats`);
        const result = await res.json();

        if (!res.ok || !result.success) {
            throw new Error(result.message || "Failed to fetch stats");
        }

        const stats = result.stats;
        collegeStatsData = stats.collegeStats;

        // Update main stats
        document.getElementById("statTotalMembers").textContent = stats.totalMembers;
        document.getElementById("statTotalTeams").textContent = stats.totalTeams;
        document.getElementById("statVegCount").textContent = stats.vegCount;
        document.getElementById("statNonVegCount").textContent = stats.nonVegCount;

        // Update percentages
        const vegPercent = stats.totalMembers > 0 ? ((stats.vegCount / stats.totalMembers) * 100).toFixed(1) : 0;
        const nonVegPercent = stats.totalMembers > 0 ? ((stats.nonVegCount / stats.totalMembers) * 100).toFixed(1) : 0;
        document.getElementById("statVegPercent").textContent = `${vegPercent}% of total`;
        document.getElementById("statNonVegPercent").textContent = `${nonVegPercent}% of total`;

        // Update degree stats
        document.getElementById("statUGCount").textContent = stats.ugCount;
        document.getElementById("statPGCount").textContent = stats.pgCount;

        // Render event stats
        renderEventStats(stats.eventCounts);

        // Render college stats
        renderCollegeStats(stats.collegeStats);

        // Render department stats
        renderDeptStats(stats.deptCounts, stats.totalMembers);

    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        Swal.fire("Error", err.message, "error");
    } finally {
        loading.classList.add("hidden");
        container.classList.remove("opacity-50");
    }
}

function renderEventStats(eventCounts) {
    const container = document.getElementById("eventStatsContainer");
    container.innerHTML = "";

    const eventColors = {
        "Fixathon": "bg-blue-100 text-blue-800 border-blue-200",
        "Mute Masters": "bg-purple-100 text-purple-800 border-purple-200",
        "Treasure Titans": "bg-yellow-100 text-yellow-800 border-yellow-200",
        "VisionX": "bg-pink-100 text-pink-800 border-pink-200",
        "QRush": "bg-green-100 text-green-800 border-green-200",
        "ThinkSync": "bg-indigo-100 text-indigo-800 border-indigo-200",
        "Bid Mayhem": "bg-red-100 text-red-800 border-red-200",
        "Crazy Sell": "bg-orange-100 text-orange-800 border-orange-200"
    };

    const eventSlots = {
        "Fixathon": "Slot 1",
        "Mute Masters": "Slot 1",
        "Treasure Titans": "Slot 1",
        "VisionX": "Slot 2",
        "QRush": "Slot 2",
        "ThinkSync": "Slot 2",
        "Bid Mayhem": "Both",
        "Crazy Sell": "Slot 2"
    };

    Object.entries(eventCounts).forEach(([event, count]) => {
        const colorClass = eventColors[event] || "bg-gray-100 text-gray-800 border-gray-200";
        const slot = eventSlots[event] || "";
        
        const card = document.createElement("div");
        card.className = `p-4 rounded-lg border-2 ${colorClass}`;
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <p class="font-semibold">${event}</p>
                    <p class="text-xs opacity-70">${slot}</p>
                </div>
                <span class="text-2xl font-bold">${count}</span>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderCollegeStats(collegeStats) {
    const tbody = document.getElementById("collegeStatsBody");
    tbody.innerHTML = "";

    if (collegeStats.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-gray-500">No registrations found</td></tr>`;
        return;
    }

    // Sort by member count descending
    collegeStats.sort((a, b) => b.members - a.members);

    collegeStats.forEach((stat, index) => {
        const row = document.createElement("tr");
        row.className = "hover:bg-gray-50";
        row.innerHTML = `
            <td class="px-4 py-3 text-sm text-gray-900">${index + 1}</td>
            <td class="px-4 py-3 text-sm text-gray-900">${stat.college}</td>
            <td class="px-4 py-3 text-sm text-gray-600">${stat.department.toUpperCase()}</td>
            <td class="px-4 py-3 text-sm font-semibold text-blue-600">${stat.members}</td>
            <td class="px-4 py-3 text-sm">
                <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">${stat.veg}</span>
            </td>
            <td class="px-4 py-3 text-sm">
                <span class="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">${stat.nonVeg}</span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function renderDeptStats(deptCounts, totalMembers) {
    const container = document.getElementById("deptStatsContainer");
    container.innerHTML = "";

    const deptNames = {
        "cs": "Computer Science",
        "ds": "Data Science",
        "ai": "AI & ML",
        "it": "Information Technology",
        "ca": "Computer Applications"
    };

    const deptColors = {
        "cs": "bg-blue-500",
        "ds": "bg-green-500",
        "ai": "bg-purple-500",
        "it": "bg-orange-500",
        "ca": "bg-pink-500"
    };

    Object.entries(deptCounts).forEach(([dept, count]) => {
        const percentage = totalMembers > 0 ? ((count / totalMembers) * 100).toFixed(1) : 0;
        const colorClass = deptColors[dept] || "bg-gray-500";
        const deptName = deptNames[dept] || dept.toUpperCase();

        const item = document.createElement("div");
        item.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <span class="text-sm font-medium text-gray-700">${deptName}</span>
                <span class="text-sm text-gray-500">${count} (${percentage}%)</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="${colorClass} h-2 rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
            </div>
        `;
        container.appendChild(item);
    });
}

// Refresh stats button
document.getElementById("refreshStatsBtn").addEventListener("click", loadDashboardStats);

// Export college stats
document.getElementById("exportCollegeStatsBtn").addEventListener("click", () => {
    if (collegeStatsData.length === 0) {
        Swal.fire("No Data", "No college stats to export", "warning");
        return;
    }

    const excelData = collegeStatsData.map((stat, index) => ({
        "S.No": index + 1,
        "College Name": stat.college,
        "Department": stat.department.toUpperCase(),
        "Total Members": stat.members,
        "Vegetarian": stat.veg,
        "Non-Vegetarian": stat.nonVeg
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    XLSX.utils.sheet_add_aoa(ws, [
        [`AION 2K26 - College-wise Registration Stats`],
        [`Generated: ${new Date().toLocaleString()}`],
        []
    ], { origin: "A1" });

    const range = XLSX.utils.decode_range(ws['!ref']);
    range.e.r += 3;
    ws['!ref'] = XLSX.utils.encode_range(range);

    ws['!cols'] = [
        { wch: 6 },
        { wch: 40 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 }
    ];

    XLSX.utils.book_append_sheet(wb, ws, "College Stats");
    XLSX.writeFile(wb, `AION_College_Stats_${new Date().toISOString().split('T')[0]}.xlsx`);
    Swal.fire("Success", "College stats exported!", "success");
});

// Load stats on page load
document.addEventListener("DOMContentLoaded", () => {
    loadDashboardStats();
});

// ============ VIEW TEAM ============
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
        document.getElementById("teamCollege").selectedIndex = 0;
        document.getElementById("teamDepartment").selectedIndex = 0;
    } finally {
        btn.disabled = false;
        btn.textContent = "🔍 Search Team";
    }
});

function displayTeamResults(team) {
    const tbody = document.getElementById("teamTableBody");
    const teamCount = document.getElementById("teamCount");
    tbody.innerHTML = "";

    if (team.length === 0) {
        Swal.fire("No Results", "No team found for the specified criteria", "info");
        document.getElementById("teamResults").classList.add("hidden");
        return;
    }

    teamCount.textContent = `Total: ${team.length} member(s)`;

    // Group members by leaderId
    const grouped = {};
    team.forEach(member => {
        const lid = member.leaderId || 'Unknown';
        if (!grouped[lid]) grouped[lid] = [];
        grouped[lid].push(member);
    });

    let sno = 1;

    Object.entries(grouped).forEach(([leaderId, members]) => {
        // Team header row with Delete Team button (once per leaderId)
        const headerRow = document.createElement("tr");
        headerRow.className = "bg-red-50 border-t-2 border-red-200";
        headerRow.innerHTML = `
          <td colspan="9" class="px-4 py-3">
            <div class="flex justify-between items-center">
              <div>
                <span class="text-sm font-semibold text-gray-900">Team Leader: </span>
                <span class="font-mono text-sm text-gray-700">${leaderId}</span>
                <span class="text-xs text-gray-500 ml-2">(${members.length} member${members.length > 1 ? 's' : ''})</span>
              </div>
              <button onclick="deleteEntireTeam('${leaderId}')" 
                class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition flex items-center gap-1">
                ⚠️ Delete Entire Team
              </button>
            </div>
          </td>
        `;
        tbody.appendChild(headerRow);

        // Member rows (no per-row action buttons)
        members.forEach(member => {
            const row = document.createElement("tr");
            row.className = "hover:bg-gray-50";

            const foodPref = member.foodPreference 
                ? (member.foodPreference === 'vegetarian' ? '🌱 Veg' : '🍖 Non-Veg')
                : 'N/A';

            row.innerHTML = `
              <td class="px-4 py-3 text-sm text-gray-900 font-medium">${sno++}</td>
              <td class="px-4 py-3 text-sm text-gray-900">${member.name || 'N/A'}</td>
              <td class="px-4 py-3 text-sm text-gray-600 font-mono">${member.registerNumber || 'N/A'}</td>
              <td class="px-4 py-3 text-sm text-gray-600">${member.degree ? member.degree.toUpperCase() : 'N/A'}</td>
              <td class="px-4 py-3 text-sm">
                ${member.event1 
                  ? `<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">${member.event1}</span>` 
                  : '<span class="text-gray-400">N/A</span>'}
              </td>
              <td class="px-4 py-3 text-sm">
                ${member.event2 
                  ? `<span class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">${member.event2}</span>` 
                  : '<span class="text-gray-400">N/A</span>'}
              </td>
              <td class="px-4 py-3 text-sm text-gray-600">${member.mobile || 'N/A'}</td>
              <td class="px-4 py-3 text-sm text-gray-600">${foodPref}</td>
              <td class="px-4 py-3 text-sm text-gray-600 font-mono text-xs">${member.leaderId || 'N/A'}</td>
            `;
            tbody.appendChild(row);
        });
    });

    document.getElementById("teamResults").classList.remove("hidden");
}

// ============ DELETE FUNCTIONS ============
async function deleteEntireTeam(leaderId) {
    const result = await Swal.fire({
        title: 'Delete Entire Team?',
        html: `<p class="text-red-600 font-semibold">⚠️ WARNING: This will delete ALL members registered under leader:</p>
               <p class="font-mono bg-gray-100 p-2 rounded mt-2">${leaderId}</p>
               <p class="mt-2 text-sm text-gray-600">This action cannot be undone!</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, delete entire team'
    });

    if (!result.isConfirmed) return;

    try {
        const res = await fetch(`${API_BASE}/admin/deleteteam/${leaderId}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to delete team");
        }

        Swal.fire("Deleted!", data.message, "success");
        document.getElementById("searchTeamBtn").click();
        loadDashboardStats();

    } catch (err) {
        Swal.fire("Error", err.message, "error");
    }
}

async function deleteTeamFromEvent(leaderId, eventName) {
    const result = await Swal.fire({
        title: 'Remove Team from Event?',
        html: `<p>This will remove the team from <strong>"${eventName}"</strong>.</p>
               <p class="text-sm text-gray-500 mt-2">Note: If members have another event, they will still remain registered for that event.</p>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Yes, remove'
    });

    if (!result.isConfirmed) return;

    try {
        const res = await fetch(`${API_BASE}/admin/deleteteambyevent/${leaderId}/${encodeURIComponent(eventName)}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
            throw new Error(data.message || "Failed to remove team from event");
        }

        Swal.fire("Removed!", data.message, "success");
        document.getElementById("searchEventBtn").click();
        loadDashboardStats();

    } catch (err) {
        Swal.fire("Error", err.message, "error");
    }
}

// ============ VIEW EVENT REGISTRATIONS ============
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
        btn.textContent = "🔍 Search Event";
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

    // Summary card
    const totalParticipants = data.reduce((sum, team) => sum + team.members.length, 0);
    const summaryCard = document.createElement("div");
    summaryCard.className = "bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white";
    summaryCard.innerHTML = `
        <h3 class="text-lg font-semibold mb-2">Event: ${currentEventName}</h3>
        <div class="flex gap-6">
            <div>
                <p class="text-3xl font-bold">${data.length}</p>
                <p class="text-sm opacity-80">Teams</p>
            </div>
            <div>
                <p class="text-3xl font-bold">${totalParticipants}</p>
                <p class="text-sm opacity-80">Participants</p>
            </div>
        </div>
    `;
    container.appendChild(summaryCard);

    data.forEach((team, teamIndex) => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-xl shadow-sm p-6";

        let membersHtml = team.members.map((m, idx) => `
          <tr class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm text-gray-900">${idx + 1}</td>
            <td class="px-4 py-3 text-sm text-gray-900">${m.name}</td>
            <td class="px-4 py-3 text-sm text-gray-600 font-mono">${m.registerNumber}</td>
            <td class="px-4 py-3 text-sm text-gray-600">${m.degree ? m.degree.toUpperCase() : 'N/A'}</td>
            <td class="px-4 py-3 text-sm text-gray-600">${m.mobile || 'N/A'}</td>
            <td class="px-4 py-3 text-sm">
              ${m.event1 || 'N/A'} ${m.slot1 ? `<span class="text-xs text-gray-400">(Slot ${m.slot1})</span>` : ''}
            </td>
            <td class="px-4 py-3 text-sm">
              ${m.event2 || 'N/A'} ${m.slot2 ? `<span class="text-xs text-gray-400">(Slot ${m.slot2})</span>` : ''}
            </td>
          </tr>
        `).join('');

        card.innerHTML = `
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Team ${teamIndex + 1}: ${team.leaderId}</h3>
              <p class="text-sm text-gray-600">${team.college}</p>
              <p class="text-xs text-gray-400">Department: ${team.department.toUpperCase()}</p>
            </div>
            <button onclick="deleteTeamFromEvent('${team.leaderId}', '${currentEventName}')" 
              class="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition flex items-center gap-1">
              🗑️ Remove from Event
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 border-b">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Register No</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Degree</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mobile</th>
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

// ============ EXCEL EXPORT: TEAM ATTENDANCE ============
document.getElementById("exportTeamBtn").addEventListener("click", () => {
    if (currentTeamData.length === 0) {
        Swal.fire("No Data", "No team data to export", "warning");
        return;
    }

    const excelData = currentTeamData.map((member, index) => ({
        "S.No": index + 1,
        "Name": member.name || "",
        "Register Number": member.registerNumber || "",
        "Degree": member.degree ? member.degree.toUpperCase() : "",
        "Mobile": member.mobile || "",
        "Event 1": member.event1 || "",
        "Event 2": member.event2 || "",
        "Food Preference": member.foodPreference || "",
        "Leader ID": member.leaderId || "",
        "Signature": ""
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    XLSX.utils.sheet_add_aoa(ws, [
        [`College: ${currentCollege}`],
        [`Department: ${currentDepartment.toUpperCase()}`],
        [`Generated: ${new Date().toLocaleString()}`],
        []
    ], { origin: "A1" });

    const range = XLSX.utils.decode_range(ws['!ref']);
    range.e.r += 4;
    ws['!ref'] = XLSX.utils.encode_range(range);

    ws['!cols'] = [
        { wch: 6 },   // S.No
        { wch: 25 },  // Name
        { wch: 18 },  // Register Number
        { wch: 8 },   // Degree
        { wch: 12 },  // Mobile
        { wch: 18 },  // Event 1
        { wch: 18 },  // Event 2
        { wch: 15 },  // Food Preference
        { wch: 18 },  // Leader ID
        { wch: 15 }   // Signature
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    const fileName = `${currentCollege.replace(/[^a-zA-Z0-9]/g, '_')}_${currentDepartment}_Attendance_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(wb, fileName);

    Swal.fire("Success", "Attendance sheet exported!", "success");
});

// ============ EXCEL EXPORT: EVENT PARTICIPANTS ============
document.getElementById("exportEventBtn").addEventListener("click", () => {
    if (currentEventData.length === 0) {
        Swal.fire("No Data", "No event data to export", "warning");
        return;
    }

    const excelData = [];
    let sno = 1;

    currentEventData.forEach(team => {
        team.members.forEach(member => {
            if (member.event1 === currentEventName || member.event2 === currentEventName) {
                excelData.push({
                    "S.No": sno++,
                    "Name": member.name || "",
                    "Register Number": member.registerNumber || "",
                    "Degree": member.degree ? member.degree.toUpperCase() : "",
                    "Mobile": member.mobile || "",
                    "College Name": team.college || "",
                    "Department": team.department ? team.department.toUpperCase() : "",
                    "Leader ID": team.leaderId || "",
                    "Signature": ""
                });
            }
        });
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    XLSX.utils.sheet_add_aoa(ws, [
        [`Event: ${currentEventName}`],
        [`Total Participants: ${excelData.length}`],
        [`Generated: ${new Date().toLocaleString()}`],
        []
    ], { origin: "A1" });

    const range = XLSX.utils.decode_range(ws['!ref']);
    range.e.r += 4;
    ws['!ref'] = XLSX.utils.encode_range(range);

    ws['!cols'] = [
        { wch: 6 },   // S.No
        { wch: 25 },  // Name
        { wch: 18 },  // Register Number
        { wch: 8 },   // Degree
        { wch: 12 },  // Mobile
        { wch: 35 },  // College Name
        { wch: 12 },  // Department
        { wch: 18 },  // Leader ID
        { wch: 15 }   // Signature
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Event Participants");

    const fileName = `${currentEventName.replace(/[^a-zA-Z0-9]/g, '_')}_Participants_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(wb, fileName);

    Swal.fire("Success", "Event participants list exported!", "success");
});

// Make functions globally accessible
window.deleteMember = deleteMember;
window.deleteEntireTeam = deleteEntireTeam;
window.deleteTeamFromEvent = deleteTeamFromEvent;