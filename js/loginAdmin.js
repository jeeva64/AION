const API_BASE = "https://sjcaisymposium.onrender.com";

document.getElementById("loginBtn").addEventListener("click", async () => {
    const adminId = document.getElementById("adminId").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!adminId || !password) {
        Swal.fire("Required", "All fields are required", "warning");
        return;
    }

    const loginBtn = document.getElementById("loginBtn");
    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";

    try {
        const res = await fetch(`${API_BASE}/admin/adminlogin`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ adminId, password })
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
            throw new Error(result.message || "Login failed");
        }

        Swal.fire({
            icon: "success",
            title: result.message,
            timer: 1500,
            showConfirmButton: false
        });

        // FIX: Store role as string to fix type comparison issue
        sessionStorage.setItem("adminRole", String(result.role));
        sessionStorage.setItem("adminId", adminId);

        // ✅ STORE THE ADMIN TOKEN
        //sessionStorage.setItem("token", result.token);    // ← ADD THIS

        setTimeout(() => {
            if (result.role === 1) {
                window.location.href = "superAdmin.html";
            } else {
                window.location.href = "moderateAdmin.html";
            }
        }, 1600);

    } catch (err) {
        Swal.fire("Login Failed", err.message, "error");
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }
});

// Enter key support
document.getElementById("password").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("loginBtn").click();
    }
});
