function logout() {
  // Clear session & local storage
  sessionStorage.clear();
  localStorage.clear();

  // // Optional: clear cookies (if any later)
  // document.cookie.split(";").forEach(c => {
  //   document.cookie = c
  //     .replace(/^ +/, "")
  //     .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  // });

  // Redirect to login
  window.location.replace("login.html");
}
