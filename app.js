document.addEventListener("DOMContentLoaded", async () => {
  const logout = async () => { try { await sendJSON("/api/auth/logout","POST",{}); location.href="/login"; } catch(e){toast(e.message,true);} };
  document.getElementById("logout")?.addEventListener("click",logout);
  document.getElementById("profile-logout")?.addEventListener("click",logout);
  try { const d=await getJSON("/api/me"); const name=d.user.name || "Your workspace";
    const side=document.getElementById("side-name"); if(side) side.textContent=name;
  } catch(e) { if(location.pathname !== "/login") location.href="/login"; }
  const loginBtn=document.getElementById("login-btn");
  loginBtn?.addEventListener("click",async()=>{
    const name=document.getElementById("demo-name").value.trim();
    const email=document.getElementById("demo-email").value.trim();
    if(!name || !email.includes("@")) return toast("Enter a name and valid email.",true);
    loginBtn.disabled=true; loginBtn.textContent="Preparing your workspace…";
    try { await sendJSON("/api/auth/demo","POST",{name,email}); location.href="/dashboard"; }
    catch(e){toast(e.message,true);loginBtn.disabled=false;loginBtn.textContent="Enter demo workspace →";}
  });
});
