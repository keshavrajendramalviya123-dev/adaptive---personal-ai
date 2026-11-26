document.addEventListener("DOMContentLoaded",async()=>{
 try {
  const [u,p,r,t]=await Promise.all([getJSON("/api/me"),getJSON("/api/preferences"),getJSON("/api/analysis/weekly"),getJSON("/api/tasks")]);
  document.getElementById("welcome-name").textContent=u.user.name.split(" ")[0];
  document.getElementById("today-date").textContent=new Date().toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"short"}).toUpperCase();
  const x=r.report; document.getElementById("hero-completion").textContent=x.completion+"%";
  document.getElementById("hero-progress").style.width=x.completion+"%";
  document.getElementById("stat-done").textContent=x.done;document.getElementById("stat-pending").textContent=x.pending;
  document.getElementById("stat-rate").textContent=x.completion+"%";
  const pref=p.preferences;document.getElementById("preference-summary").innerHTML=
   `<div><span>Language</span><b>${pref.language}</b></div><div><span>Difficulty</span><b>${pref.difficulty}</b></div><div><span>Length</span><b>${pref.response_length}</b></div><div><span>Style</span><b>${pref.explanation_style}</b></div>`;
  const list=document.getElementById("recent-tasks");
  list.innerHTML=t.tasks.slice(0,4).map(a=>`<div class="task-row"><span class="task-check ${a.status==='Done'?'checked':''}">${a.status==='Done'?'✓':''}</span><div><b>${escapeHTML(a.title)}</b><small>${escapeHTML(a.category)} · ${a.deadline||"No deadline"}</small></div><span class="status ${a.status==='Done'?'done':''}">${a.status}</span></div>`).join("") || '<div class="empty-state">No tasks yet. Add one small goal to get started.</div>';
 }catch(e){toast(e.message,true);}
});
function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
