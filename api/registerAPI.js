document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("regForm");
  if (!form) return;

  const API_BASE = "https://sjcaisymposium.onrender.com";
  const REGISTER_ENDPOINT = `${API_BASE}/regleader`;

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

    if (password !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match!", "error");
      return;
    }

    if (!termsEl.checked) {
      Swal.fire("Required", "You must accept the terms and conditions.", "warning");
      return;
    }

    let dept = departmentEl.value.toLowerCase();
    if (dept === "aiml") dept = "ai";

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

    // ⏳ SweetAlert Loading
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

      clearTimeout(timeoutId);

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || "Registration failed");
      }

      // ✅ Success Alert
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