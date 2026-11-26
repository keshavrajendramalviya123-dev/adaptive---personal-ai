document.addEventListener("DOMContentLoaded",async()=>{try{const d=await getJSON("/api/analysis/weekly"),r=d.report;
 ["report-rate","ring-number"].forEach(id=>document.getElementById(id).textContent=r.completion+"%");
 document.getElementById("report-ring").style.setProperty("--progress",r.completion*3.6+"deg");
 document.getElementById("report-total").textContent=r.total;document.getElementById("report-done").textContent=r.done;document.getElementById("report-pending").textContent=r.pending;
 document.getElementById("weak-areas").innerHTML=r.weak_areas.map(a=>`<span class="area-tag">${a}</span>`).join("")||'<span class="muted">No weak areas detected yet.</span>';
 document.getElementById("tips-list").innerHTML=r.tips.map(t=>`<div class="tip-row"><span>✦</span>${t}</div>`).join("");
 }catch(e){toast(e.message,true);}});
