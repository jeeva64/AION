document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("regForm");
  if (!form) return;

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

    // 🔥 Build payload EXACTLY as backend expects
    const data = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),

      // rename: mobile -> mobilenumber
      mobilenumber: document.getElementById("mobile").value.trim(),

      // normalize: department -> lowercase (cs, ds, aiml, it, ca)
      department: document.getElementById("department").value.toLowerCase(),

      college: document.getElementById("college").value.trim(),

      // normalize: shift -> "1" or "2"
      shift: document.getElementById("shift").value === "AIDED" ? "1" : "2",

      password: password,
      confirmpassword: confirmPassword
    };

    console.log("Form data ready for API:", data);

    try {
      const res = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const ct = res.headers.get("content-type") || "";
      const result = ct.includes("application/json")
        ? await res.json()
        : { message: await res.text() };

      if (!res.ok) {
        throw new Error(result.message || "Registration failed");
      }

      alert(result.message || "Registration successful!");
      form.reset();

      // Optional redirect
      // window.location.href = "login.html";

    } catch (err) {
      console.error("Registration error:", err);
      alert(err.message || "Something went wrong. Please try again.");
    }
  });
});
