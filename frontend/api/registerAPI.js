
  const form = document.getElementById("regForm");

  // 🔧 CHANGE THIS to your real Render backend URL
  const API_BASE = "https://sjcaisymposium.onrender.com";
  const REGISTER_ENDPOINT = `${API_BASE}/regleader`;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    if (!document.getElementById("terms").checked) {
      alert("You must accept the terms and conditions.");
      return;
    }

    // Build payload (API-ready)
    const data = {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      mobile: document.getElementById("mobile").value,
      department: document.getElementById("department").value,
      college: document.getElementById("college").value,
      shift: document.getElementById("shift").value,
      password: password
    };

    console.log("Form data ready for API:", data);

    try {
      // 🔥 POST request to Render backend
      const res = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) {
        // Backend returned error status
        throw new Error(result.message || "Registration failed");
      }

      // ✅ Success
      alert(result.message || "Registration successful!");
      form.reset();

      // Optional: redirect to login page
      // window.location.href = "login.html";

    } catch (err) {
      console.error("Registration error:", err);
      alert(err.message || "Something went wrong. Please try again.");
    }
  });

