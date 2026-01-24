// addCollege.js - College Management Module
// REMOVED: const API_BASE (using the one from superAdmin.js)

let collegeListArray = [];

// ============ ADD COLLEGE TO LIST ============
document.getElementById("addToListBtn")?.addEventListener("click", () => {
    const collegeIdEl = document.getElementById("collegeId");
    const collegeNameEl = document.getElementById("collegeName");
    const stateEl = document.getElementById("state");
    const districtEl = document.getElementById("district");

    const collegeId = collegeIdEl.value.trim();
    const collegeName = collegeNameEl.value.trim();
    const state = stateEl.value.trim();
    const district = districtEl.value.trim();

    if (!collegeId || !collegeName || !state || !district) {
        Swal.fire("Required", "All fields are required", "warning");
        return;
    }

    // Check for duplicate collegeId
    if (collegeListArray.some(c => c.collegeId === collegeId)) {
        Swal.fire("Duplicate", "College ID already exists in the list", "error");
        return;
    }

    // Add to array
    collegeListArray.push({
        collegeId,
        name: collegeName,
        state,
        district
    });

    // Update UI
    updateCollegeListUI();

    // Clear inputs
    collegeIdEl.value = "";
    collegeNameEl.value = "";
    stateEl.value = "";
    districtEl.value = "";
    collegeIdEl.focus();

    Swal.fire({
        icon: "success",
        title: "Added!",
        text: `${collegeName} added to list`,
        timer: 1500,
        showConfirmButton: false
    });
});

// ============ CLEAR LIST ============
document.getElementById("clearListBtn")?.addEventListener("click", () => {
    if (collegeListArray.length === 0) {
        Swal.fire("Empty", "No colleges to clear", "info");
        return;
    }

    Swal.fire({
        title: "Clear All?",
        text: `Remove all ${collegeListArray.length} colleges from the list?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, clear all"
    }).then((result) => {
        if (result.isConfirmed) {
            collegeListArray = [];
            updateCollegeListUI();
            Swal.fire("Cleared!", "All colleges removed from list", "success");
        }
    });
});

// ============ UPDATE UI LIST ============
function updateCollegeListUI() {
    const listEl = document.getElementById("collegeList");
    const previewEl = document.getElementById("collegeListPreview");
    const submitBtn = document.getElementById("submitCollegesBtn");
    const countEl = document.getElementById("collegeCount");

    countEl.textContent = collegeListArray.length;

    if (collegeListArray.length === 0) {
        previewEl.classList.add("hidden");
        submitBtn.classList.add("hidden");
        return;
    }

    previewEl.classList.remove("hidden");
    submitBtn.classList.remove("hidden");

    listEl.innerHTML = collegeListArray.map((college, index) => `
    <li class="flex justify-between items-start bg-white p-3 rounded border">
      <div class="flex-1">
        <div class="font-semibold text-blue-600">${college.collegeId}</div>
        <div class="text-gray-900">${college.name}</div>
        <div class="text-xs text-gray-500 mt-1">${college.district}</div>
      </div>
      <button onclick="removeCollege(${index})" class="text-red-600 hover:text-red-800 font-medium text-sm ml-3">
        ✕ Remove
      </button>
    </li>
  `).join('');
}

// ============ REMOVE SINGLE COLLEGE ============
function removeCollege(index) {
    const college = collegeListArray[index];

    Swal.fire({
        title: "Remove College?",
        text: `Remove ${college.name}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, remove"
    }).then((result) => {
        if (result.isConfirmed) {
            collegeListArray.splice(index, 1);
            updateCollegeListUI();
            Swal.fire("Removed!", "College removed from list", "success");
        }
    });
}

// ============ SUBMIT COLLEGES TO DATABASE ============
document.getElementById("submitCollegesBtn")?.addEventListener("click", async () => {
    if (collegeListArray.length === 0) {
        Swal.fire("Empty", "No colleges to submit", "warning");
        return;
    }

    const result = await Swal.fire({
        title: "Submit Colleges?",
        text: `Add ${collegeListArray.length} colleges to the database?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, submit"
    });

    if (!result.isConfirmed) return;

    Swal.fire({
        title: "Submitting...",
        text: "Adding colleges to database",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        const res = await fetch(`${API_BASE}/addcollege`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(collegeListArray)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || "Failed to add colleges");
        }

        Swal.fire({
            icon: "success",
            title: "Success!",
            text: `${data.count} colleges added successfully`,
            confirmButtonText: "OK"
        });

        // Clear the list after successful submission
        collegeListArray = [];
        updateCollegeListUI();

        // Refresh the existing colleges list
        loadExistingColleges();

    } catch (err) {
        console.error("Error adding colleges:", err);
        Swal.fire("Error", err.message || "Failed to add colleges", "error");
    }
});

// ============ LOAD EXISTING COLLEGES ============
document.getElementById("refreshCollegesBtn")?.addEventListener("click", () => {
    loadExistingColleges();
});

async function loadExistingColleges() {
    const container = document.getElementById("existingCollegesContainer");

    container.innerHTML = '<p class="text-gray-500 text-center py-4">Loading...</p>';

    try {
        const res = await fetch(`${API_BASE}/getcollege`);

        if (!res.ok) {
            throw new Error("Failed to load colleges");
        }

        const colleges = await res.json();

        if (colleges.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-4">No colleges found</p>';
            return;
        }

        // Display in table format
        container.innerHTML = `
      <table class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Serial No</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">College ID</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">College Name</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          ${colleges.map((college, index) => `
            <tr class="hover:bg-gray-50">
              <td class="px-4 py-3 text-sm text-gray-600">${index + 1}</td>
              <td class="px-4 py-3 text-sm text-blue-600 font-semibold">${college.collegeId}</td>
              <td class="px-4 py-3 text-sm text-gray-900">${college.name}</td>
              <td class="px-4 py-3 text-sm text-gray-600">${college.district}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="mt-4 text-sm text-gray-500 text-center">
        Total: ${colleges.length} colleges
      </div>
    `;

        Swal.fire({
            icon: "success",
            title: "Loaded!",
            text: `${colleges.length} colleges loaded`,
            timer: 1500,
            showConfirmButton: false
        });

    } catch (err) {
        console.error("Error loading colleges:", err);
        container.innerHTML = '<p class="text-red-500 text-center py-4">Failed to load colleges</p>';
        Swal.fire("Error", err.message || "Failed to load colleges", "error");
    }
}

// Make removeCollege function globally accessible
window.removeCollege = removeCollege;