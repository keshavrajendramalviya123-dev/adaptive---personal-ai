let lastQuestion="";
document.addEventListener("DOMContentLoaded",()=>{
 const q=document.getElementById("question"),count=document.getElementById("char-count");
 q.addEventListener("input",()=>count.textContent=q.value.length);
 document.querySelectorAll(".prompt").forEach(b=>b.addEventListener("click",()=>{q.value=b.dataset.prompt;count.textContent=q.value.length;q.focus();}));
 document.getElementById("ask-submit").addEventListener("click",async()=>{
  lastQuestion=q.value.trim();if(!lastQuestion)return toast("Type a question first.",true);
  const btn=document.getElementById("ask-submit");btn.disabled=true;btn.textContent="Thinking…";
  try{const d=await sendJSON("/api/questions/ask","POST",{question:lastQuestion});document.getElementById("answer-text").textContent=d.answer;document.getElementById("answer-wrap").classList.remove("hidden");}
  catch(e){toast(e.message,true);}finally{btn.disabled=false;btn.innerHTML='Generate answer <span>✦</span>';}
 });
 document.querySelectorAll("[data-feedback]").forEach(b=>b.addEventListener("click",async()=>{try{await sendJSON("/api/feedback","POST",{question:lastQuestion,feedback:b.dataset.feedback});toast("Feedback saved. Thank you.");}catch(e){toast(e.message,true);}}));
});
