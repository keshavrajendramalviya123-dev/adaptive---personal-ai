document.addEventListener("DOMContentLoaded",async()=>{try{const d=await getJSON("/api/me"),u=d.user;
 document.getElementById("profile-name").textContent=u.name;document.getElementById("profile-email").textContent=u.email;
 document.getElementById("profile-avatar").textContent=u.name.charAt(0).toUpperCase();
 document.getElementById("profile-created").textContent=new Date(u.created_at).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
}catch(e){toast(e.message,true);}});
