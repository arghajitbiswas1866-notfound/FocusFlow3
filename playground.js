document.addEventListener('DOMContentLoaded', () => {
  const nameEl = document.getElementById('pgName');
  const dataEl = document.getElementById('pgData');
  const createBtn = document.getElementById('pgCreate');
  const refreshBtn = document.getElementById('pgRefresh');
  const listEl = document.getElementById('pgList');
  const msgEl = document.getElementById('pgMsg');

  function getToken(){ return localStorage.getItem('token') || localStorage.getItem('authToken') || null; }

  async function fetchList(){
    listEl.textContent = 'Loading...';
    const token = getToken();
    if(!token){ listEl.innerHTML = '<div class="empty-text">Sign in to use playground</div>'; return; }
    try{
      const res = await fetch(`${API_BASE}/api/playground`, { headers: { Authorization: 'Bearer ' + token }});
      if(!res.ok) { listEl.innerHTML = '<div class="empty-text">Failed to load</div>'; return; }
      const data = await res.json();
      renderList(data.items || []);
    }catch(e){ console.error(e); listEl.innerHTML = '<div class="empty-text">Network error</div>'; }
  }

  function renderList(items){
    if(items.length === 0) { listEl.innerHTML = '<div class="empty-text">No items yet</div>'; return; }
    listEl.innerHTML = '';
    items.forEach(it => {
      const div = document.createElement('div'); div.className = 'server-item';
      const pre = document.createElement('pre'); pre.textContent = (it.name || '') + '\n' + JSON.stringify(it.data, null, 2);
      const actions = document.createElement('div'); actions.className = 'actions';
      const downloadBtn = document.createElement('button'); downloadBtn.textContent = 'Download JSON'; downloadBtn.onclick = ()=> downloadJSON(it.data, `play-${it._id}.json`);
      const deleteBtn = document.createElement('button'); deleteBtn.textContent = 'Delete'; deleteBtn.onclick = ()=> deleteItem(it._id);
      const applyBtn = document.createElement('button'); applyBtn.textContent = 'Apply to subjects'; applyBtn.onclick = ()=> { if(it.data && it.data.subjectTimes){ localStorage.setItem('subjectTimeData', JSON.stringify(it.data.subjectTimes)); location.href='analytics.html'; } else alert('No subjectTimes in this item'); };
      actions.append(downloadBtn, applyBtn, deleteBtn);
      div.append(pre, actions);
      listEl.appendChild(div);
    });
  }

  function downloadJSON(obj, filename='data.json'){
    const blob = new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  async function createItem(){
    const token = getToken(); if(!token){ msgEl.textContent = 'Sign in first'; return; }
    let data = {};
    try{ data = JSON.parse(dataEl.value || '{}'); }catch(e){ msgEl.textContent = 'Invalid JSON'; return; }
    const name = nameEl.value || '';
    try{
      const res = await fetch(`${API_BASE}/api/playground`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ name, data }) });
      if(!res.ok){ msgEl.textContent = 'Create failed'; return; }
      msgEl.textContent = 'Created'; dataEl.value = ''; nameEl.value=''; fetchList();
    }catch(e){ console.error(e); msgEl.textContent = 'Network error'; }
  }

  async function deleteItem(id){
    const token = getToken(); if(!token){ msgEl.textContent = 'Sign in first'; return; }
    if(!confirm('Delete this item?')) return;
    try{
      const res = await fetch(`${API_BASE}/api/playground/` + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token }});
      if(!res.ok){ msgEl.textContent = 'Delete failed'; return; }
      msgEl.textContent = 'Deleted'; fetchList();
    }catch(e){ console.error(e); msgEl.textContent = 'Network error'; }
  }

  createBtn.addEventListener('click', createItem);
  refreshBtn.addEventListener('click', fetchList);

  // auto-refresh when page loads if signed in
  if(getToken()) fetchList();
});