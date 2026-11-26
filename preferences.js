document.addEventListener("DOMContentLoaded",async()=>{try{const d=await getJSON("/api/preferences");Object.entries(d.preferences).forEach(([k,v])=>document.getElementById(k).value=v);}catch(e){toast(e.message,true);}
 document.getElementById("save-preferences").addEventListener("click",async()=>{const body={};["language","difficulty","response_length","explanation_style"].forEach(k=>body[k]=document.getElementById(k).value);
 try{await sendJSON("/api/preferences","PUT",body);toast("Preferences saved.");}catch(e){toast(e.message,true);}});
});
