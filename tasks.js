document.addEventListener("DOMContentLoaded",()=>{loadTasks();
 document.getElementById("add-task").addEventListener("click",async()=>{const title=document.getElementById("task-title").value.trim();
 if(!title)return toast("Task title is required.",true);
 try{await sendJSON("/api/tasks","POST",{title,category:document.getElementById("task-category").value,deadline:document.getElementById("task-deadline").value});document.getElementById("task-title").value="";toast("Task added.");loadTasks();}catch(e){toast(e.message,true);}});
});
async function loadTasks(){try{const d=await getJSON("/api/tasks"),list=document.getElementById("task-list");document.getElementById("task-count").textContent=d.tasks.length+" TASKS";
 list.innerHTML=d.tasks.map(t=>`<div class="task-row full-task"><button class="task-check ${t.status==='Done'?'checked':''}" data-toggle="${t.id}" data-status="${t.status}">${t.status==='Done'?'✓':''}</button><div class="task-details"><b>${esc(t.title)}</b><small>${esc(t.category)} · ${t.deadline||"No deadline"}</small></div><span class="status ${t.status==='Done'?'done':''}">${t.status}</span><button class="delete-btn" data-delete="${t.id}" aria-label="Delete task">×</button></div>`).join("")||'<div class="empty-state">Your list is clear. Add your first task above.</div>';
 list.querySelectorAll("[data-toggle]").forEach(b=>b.addEventListener("click",async()=>{try{await api("/api/tasks/"+b.dataset.toggle,{method:"PUT",body:JSON.stringify({status:b.dataset.status==="Done"?"Pending":"Done"}),headers:{"Content-Type":"application/json"}});loadTasks();}catch(e){toast(e.message,true);}}));
 list.querySelectorAll("[data-delete]").forEach(b=>b.addEventListener("click",async()=>{try{await api("/api/tasks/"+b.dataset.delete,{method:"DELETE"});toast("Task deleted.");loadTasks();}catch(e){toast(e.message,true);}}));
 }catch(e){toast(e.message,true);}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
