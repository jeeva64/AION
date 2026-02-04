document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("regForm");
  if (!form) return;

  const API_BASE = "https://sjcaisymposium.onrender.com";
  const REGISTER_ENDPOINT = `${API_BASE}/regleader`;

  // ============ LOAD COLLEGES DYNAMICALLY ============
  await loadColleges();

  async function loadColleges() {
    const collegeSelect = document.getElementById("college");
    
    if (!collegeSelect) return;

    try {
      const res = await fetch(`${API_BASE}/getcollege`);
      
      if (!res.ok) {
        throw new Error("Failed to load colleges");
      }

      const colleges = await res.json();
      
      // Clear loading option
      collegeSelect.innerHTML = '<option value="">Select College</option>';
      
      // Add colleges from API
      colleges.forEach(college => {
        const option = document.createElement("option");
        option.value = college.name;
        option.textContent = college.name;
        option.setAttribute("data-college-id", college.collegeId);
        collegeSelect.appendChild(option);
      });
      
      
    } catch (error) {
      console.error("Error loading colleges:", error);
      
      // Fallback to hardcoded list if API fails
      // collegeSelect.innerHTML = `
      //   <option value="">Select College</option>
      //   <option>Bishop Heber College, Trichy</option>
      //   <option>National College, Trichy</option>
      //   <option>Jamal Mohamed College, Trichy</option>
      //   <option>CARE College of Engineering, Trichy</option>
      //   <option>K. Ramakrishnan College of Technology, Trichy</option>
      //   <option>M.A.M. College of Engineering, Trichy</option>
      //   <option>Oxford Engineering College, Trichy</option>
      //   <option>Government College of Engineering, Trichy</option>
      // `;
      
      // Optional: Show warning (only if SweetAlert2 is loaded)
      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: "warning",
          title: "Could not load colleges",
          text: "Refresh Your Page",
          timer: 3000,
          showConfirmButton: false
        });
      }
    }
  }

  // ============ FORM SUBMISSION ============
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameEl = document.getElementById("name");
    const emailEl = document.getElementById("email");
    const mobileEl = document.getElementById("mobile");
    const departmentEl = document.getElementById("department");
    const collegeEl = document.getElementById("college");
    const shiftEl = document.getElementById("shift");
    const passwordEl = document.getElementById("password");
    const confirmPasswordEl = document.getElementById("confirmPassword");
    const termsEl = document.getElementById("terms");

    const password = passwordEl.value.trim();
    const confirmPassword = confirmPasswordEl.value.trim();

    // Validation: Password match
    if (password !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match!", "error");
      return;
    }

    // Validation: Terms checkbox
    if (!termsEl.checked) {
      Swal.fire("Required", "You must accept the terms and conditions.", "warning");
      return;
    }

    // Department normalization
    let dept = departmentEl.value.toLowerCase();
    if (dept === "aiml") dept = "ai";

    // Get college ID (optional - if you need it for backend)
    const selectedCollegeOption = collegeEl.options[collegeEl.selectedIndex];
    const collegeId = selectedCollegeOption.getAttribute("data-college-id") || null;

    const formData = {
      name: nameEl.value.trim(),
      email: emailEl.value.trim(),
      mobilenumber: mobileEl.value.trim(),
      department: dept,
      college: collegeEl.value.trim(),
      shift: shiftEl.value,
      password: password,
      confirmpassword: confirmPassword
    };

    // Show loading alert
    Swal.fire({
      title: "Registering...",
      text: "Please wait while we process your registration",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s max

    try {
      const res = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      if (res.success) {
        Swal.fire('Success!', res.message, 'success');
      } else {
        Swal.fire('Error!', res.message, 'error');
      }

      clearTimeout(timeoutId);

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Registration failed");
      }

      // Success alert
      await Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "You can now login using your credentials",
        confirmButtonText: "Go to Login"
      });

      form.reset();
      window.location.href = "login.html";

    } catch (err) {
      console.error("Registration error:", err);
      
      if (err.name === "AbortError") {
        Swal.fire("Timeout", "Server is taking too long. Please try again.", "error");
      } else {
        Swal.fire("Failed", err.message || "Something went wrong!", "error");
      }
    } finally {
      clearTimeout(timeoutId);
    }
  });
});