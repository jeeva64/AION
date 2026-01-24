// loadColleges.js
// Dynamically loads registered colleges into the teamCollege dropdown
// Works for both superAdmin and moderateAdmin pages

(async function loadRegisteredColleges() {
  const collegeSelect = document.getElementById("teamCollege");
  
  // Exit if dropdown doesn't exist on the page
  if (!collegeSelect) return;

  try {
    // Fetch colleges from API
    const res = await fetch(`${API_BASE}/getcollege`);
    
    if (!res.ok) {
      throw new Error("Failed to load colleges");
    }

    const colleges = await res.json();
    
    // Clear loading message
    collegeSelect.innerHTML = '<option value="">Select College</option>';
    
    // Filter only registered colleges (if backend doesn't filter)
    const registeredColleges = colleges.filter(c => c.registeredStatus === true);
    
    // Check if any colleges found
    if (registeredColleges.length === 0) {
      collegeSelect.innerHTML = '<option value="">No registered colleges found</option>';
      console.warn("No registered colleges available");
      return;
    }
    
    // Populate dropdown with registered colleges
    registeredColleges.forEach(college => {
      const option = document.createElement("option");
      option.value = college.name;
      option.textContent = college.name;
      
      // Store additional data as attributes for future use
      option.setAttribute("data-college-id", college.collegeId);
      option.setAttribute("data-district", college.district || "");
      
      collegeSelect.appendChild(option);
    });
    
    console.log(`✅ Loaded ${registeredColleges.length} registered colleges`);
    
  } catch (error) {
    console.error("❌ Error loading colleges:", error);
    
    // Show error in dropdown
    collegeSelect.innerHTML = '<option value="">Failed to load colleges</option>';
    
    // Show user-friendly error message
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: "error",
        title: "Error Loading Colleges",
        text: "Could not load college list. Please refresh the page.",
        timer: 3000,
        showConfirmButton: false
      });
    } else {
      alert("Failed to load colleges. Please refresh the page.");
    }
  } finally {
    document.getElementById("teamCollege").selectedIndex = 0;
  }
})();

// Optional: Function to get selected college data
function getSelectedCollegeData() {
  const collegeSelect = document.getElementById("teamCollege");
  if (!collegeSelect) return null;
  
  const selectedOption = collegeSelect.options[collegeSelect.selectedIndex];
  
  return {
    name: selectedOption.value,
    collegeId: selectedOption.getAttribute("data-college-id") || null,
    district: selectedOption.getAttribute("data-district") || null
  };
}

// Make function globally accessible if needed
window.getSelectedCollegeData = getSelectedCollegeData;