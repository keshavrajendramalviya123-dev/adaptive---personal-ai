
document.addEventListener("DOMContentLoaded", async () => {

  // LOGOUT
  const logout = async () => {
    try {
      await sendJSON("/api/auth/logout", "POST", {});
      location.href = "/login";
    } catch (e) {
      toast(e.message, true);
    }
  };

  document.getElementById("logout")?.addEventListener("click", logout);
  document.getElementById("profile-logout")?.addEventListener("click", logout);

  // USER DETAILS
  try {
    const d = await getJSON("/api/me");
    const name = d.user.name || "Your workspace";
    const side = document.getElementById("side-name");
    if (side) side.textContent = name;
  } catch (e) {
    if (location.pathname !== "/login") location.href = "/login";
  }

  // LOGIN ELEMENTS
  const loginBtn = document.getElementById("login-btn");
  const signinTab = document.getElementById("signin-tab");
  const signupTab = document.getElementById("signup-tab");
  const emailOption = document.getElementById("email-option");
  const phoneOption = document.getElementById("phone-option");

  const emailFields = document.getElementById("email-fields");
  const phoneFields = document.getElementById("phone-fields");
  const passwordFields = document.getElementById("password-fields");

  const heading = document.getElementById("auth-heading");
  const description = document.getElementById("auth-description");

  let authMode = "signin";
  let loginMethod = "email";

  function updateForm() {
    if (!loginBtn) return;

    signinTab?.classList.toggle("active", authMode === "signin");
    signupTab?.classList.toggle("active", authMode === "signup");

    emailOption?.classList.toggle("active", loginMethod === "email");
    phoneOption?.classList.toggle("active", loginMethod === "phone");

    if (emailFields) emailFields.hidden = loginMethod !== "email";
    if (phoneFields) phoneFields.hidden = loginMethod !== "phone";

    if (passwordFields) {
      passwordFields.hidden = authMode !== "signup" || loginMethod !== "email";
    }

    if (heading) {
      heading.textContent = authMode === "signin" ? "Welcome back." : "Create your account.";
    }

    if (description) {
      description.textContent = authMode === "signin"
        ? "Sign in to enter your personal workspace."
        : "Create your personal AI workspace.";
    }

    loginBtn.textContent =
      authMode === "signup" ? "Create Account →" :
      loginMethod === "phone" ? "Phone login unavailable" :
      "Enter demo workspace →";
  }

  signinTab?.addEventListener("click", () => {
    authMode = "signin";
    updateForm();
  });

  signupTab?.addEventListener("click", () => {
    authMode = "signup";
    updateForm();
  });

  emailOption?.addEventListener("click", () => {
    loginMethod = "email";
    updateForm();
  });

  phoneOption?.addEventListener("click", () => {
    loginMethod = "phone";
    updateForm();
  });

  // LOGIN BUTTON
  loginBtn?.addEventListener("click", async () => {

    if (loginMethod === "phone") {
      return toast("Phone OTP login is not connected yet.", true);
    }

    if (authMode === "signup") {
      return toast("Account creation is not connected yet.", true);
    }

    const name = document.getElementById("demo-name")?.value.trim();
    const email = document.getElementById("demo-email")?.value.trim();

    if (!name || !email || !email.includes("@")) {
      return toast("Enter a name and valid email.", true);
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Preparing your workspace…";

    try {
      await sendJSON("/api/auth/demo", "POST", { name, email });
      location.href = "/dashboard";
    } catch (e) {
      toast(e.message, true);
      loginBtn.disabled = false;
      updateForm();
    }
  });

  updateForm();
});
