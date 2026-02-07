document.addEventListener("DOMContentLoaded", () => {

  // Chart instances
  let weeklyChart = null;
  let subjectChart = null;
  let monthlyChart = null;
  let yearlyChart = null;

  function updateSummaryUI(sd){
    if (!sd || !sd.summary) return;
    document.getElementById("totalHours").textContent = sd.summary.totalHours;
    document.getElementById("totalSessions").textContent = sd.summary.totalSessions;
    document.getElementById("avgSession").textContent = sd.summary.avgSession;
    document.getElementById("bestStreak").textContent = sd.summary.bestStreak;
  }

  function initCharts(sd){
    // Weekly
    weeklyChart = new Chart(document.getElementById("weeklyData"), {
      type: "line",
      data: {
        labels: sd.weekly.days,
        datasets: [{ label: "Minutes Studied", data: sd.weekly.minutesPerDay, borderWidth: 2, tension: 0.4 }]
      },
      options: { responsive: true }
    });

    // Subjects
    const subjectCtx = document.getElementById("weeklySubjectData");
    const labels = Object.keys(sd.subjects);
    const values = Object.values(sd.subjects);
    if (labels.length === 0) {
      subjectCtx.parentElement.classList.add("center");
      subjectCtx.replaceWith(Object.assign(document.createElement("div"), { className: "empty-text", innerText: "No subject data yet" }));
      subjectChart = null;
    } else {
      subjectChart = new Chart(subjectCtx, { type: "doughnut", data: { labels, datasets: [{ data: values }] }, options: { responsive: true } });
    }

    // Monthly
    monthlyChart = new Chart(document.getElementById("monthlyData"), { type: "bar", data: { labels: sd.monthly.map((_, i) => i + 1), datasets: [{ label: "Minutes", data: sd.monthly }] } });

    // Yearly
    yearlyChart = new Chart(document.getElementById("yearlyData"), { type: "bar", data: { labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], datasets: [{ label: "Minutes", data: sd.yearly }] } });
  }

  function updateCharts(sd){
    // weekly
    if(weeklyChart){ weeklyChart.data.labels = sd.weekly.days; weeklyChart.data.datasets[0].data = sd.weekly.minutesPerDay; weeklyChart.update(); }
    // subject
    if(subjectChart){ subjectChart.data.labels = Object.keys(sd.subjects); subjectChart.data.datasets[0].data = Object.values(sd.subjects); subjectChart.update(); }
    else {
      // if there was no chart before but now there is data, reload the page to render properly
      if(Object.keys(sd.subjects).length) location.reload();
    }
    // monthly
    if(monthlyChart){ monthlyChart.data.labels = sd.monthly.map((_, i) => i + 1); monthlyChart.data.datasets[0].data = sd.monthly; monthlyChart.update(); }
    // yearly
    if(yearlyChart){ yearlyChart.data.datasets[0].data = sd.yearly; yearlyChart.update(); }
  }

  // initial render
  const initialStudyData = window.studyData || window.computeStudyData();
  updateSummaryUI(initialStudyData);
  initCharts(initialStudyData);

  // ---------- Server-saved analytics support ----------
  const serverMsgEl = document.getElementById('serverMsg');
  const serverListEl = document.getElementById('serverAnalyticsList');
  const refreshButton = document.getElementById('refreshServerAnalytics');
  const downloadAllBtn = document.getElementById('downloadAllServerAnalytics');

  function getToken(){
    return localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('jwt') || null;
  }

  function showReSignin(email){
    if(!serverMsgEl) return;
    serverMsgEl.innerHTML = '';
    const info = document.createElement('span');
    info.textContent = 'Signed in locally but no active session. ';
    const btn = document.createElement('button');
    btn.textContent = 'Sign In Again';
    btn.onclick = ()=>{
      const url = new URL(window.location.href);
      url.pathname = '/signin-signup.html';
      if(email) url.searchParams.set('email', email);
      window.location.href = url.toString();
    };
    serverMsgEl.append(info, btn);
  }

  async function fetchServerAnalytics(){
    if(!serverListEl) return;
    const token = getToken();
    if(!token){
      try{
        const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if(cur && cur.email){
          showReSignin(cur.email);
          serverListEl.innerHTML = '<div class="empty-text">Looks like you are signed in locally as ' + (cur.name || cur.email) + ' but the session token is missing.</div>';
          return;
        }
      }catch(e){ /* ignore parse errors */ }
      if(serverMsgEl) serverMsgEl.textContent = 'Sign in to view saved analytics';
      serverListEl.innerHTML = '<div class="empty-text">Not signed in</div>';
      return;
    }
    if(serverMsgEl) serverMsgEl.textContent = 'Loading...';
    try{
      const res = await fetch(`${API_BASE}/api/analytics`, { headers: { Authorization: 'Bearer ' + token }});
      if(!res.ok){
        if(res.status === 401){
          // token invalid/expired
          try{ localStorage.removeItem('token'); }catch(e){}
          const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
          if(cur && cur.email){ showReSignin(cur.email); serverListEl.innerHTML = '<div class="empty-text">Session expired or unauthorized. Please sign in again.</div>'; }
          else { if(serverMsgEl) serverMsgEl.textContent = 'Unauthorized. Please sign in.'; serverListEl.innerHTML = ''; }
        } else {
          if(serverMsgEl) serverMsgEl.textContent = 'Failed to load (unauthorized?)'; serverListEl.innerHTML = ''; }
        return;
      }
      const data = await res.json();
      if(serverMsgEl) serverMsgEl.textContent = '';
      renderServerAnalytics(data.items || []);

      // Auto-apply the most recent server analytics (safe: only once per session) — use applySubjectTimes without reload
      const items = data.items || [];
      if(items.length > 0){
        items.sort((a,b)=> new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        const latest = items[0];
        const latestId = latest._id || latest.id || String(latest.createdAt || Date.now());
        const alreadyApplied = sessionStorage.getItem('appliedAnalyticsId');
        if(latest && latest.subjectTimes && alreadyApplied !== latestId){
          applySubjectTimes(latest.subjectTimes, latestId, {commit:false});
          sessionStorage.setItem('appliedAnalyticsId', latestId);
          if(serverMsgEl) serverMsgEl.textContent = 'Previewed latest server analytics';
        }
      }

    }catch(e){ console.error('Fetch server analytics error', e); if(serverMsgEl) serverMsgEl.textContent = 'Network error'; }
  }

  function renderServerAnalytics(items){
    if(!serverListEl) return;
    if(items.length===0){ serverListEl.innerHTML = '<div class="empty-text">No saved analytics</div>'; return; }
    serverListEl.innerHTML = '';
    items.forEach(it=>{
      const id = it._id || it.id || (it.createdAt || Date.now()).toString();
      const itemEl = document.createElement('div'); itemEl.className = 'server-item';
      itemEl.dataset.analyticsId = id;
      const info = document.createElement('pre');
      const dateStr = it.createdAt ? (new Date(it.createdAt)).toLocaleString() : 'unknown';
      const subjects = it.subjectTimes || {};
      info.textContent = dateStr + '\n' + JSON.stringify(subjects, null, 2);
      const actions = document.createElement('div'); actions.className = 'actions';

      const previewBtn = document.createElement('button'); previewBtn.textContent = 'Preview'; previewBtn.onclick = ()=> { previewSubjectTimes(subjects); highlightItem(id); if(serverMsgEl) serverMsgEl.textContent='Preview applied to charts'; };
      const applyBtn = document.createElement('button'); applyBtn.textContent = 'Apply'; applyBtn.onclick = ()=> { applySubjectTimes(subjects, id, {commit:true}); highlightItem(id); if(serverMsgEl) serverMsgEl.textContent='Applied to local data'; };

      const dlBtn = document.createElement('button'); dlBtn.textContent = 'Download CSV'; dlBtn.onclick = ()=> downloadCSV(subjects, `analytics-${dateStr.replace(/[: ,/]/g,'_')}.csv`);
      const jsonBtn = document.createElement('button'); jsonBtn.textContent = 'Download JSON'; jsonBtn.onclick = ()=> downloadJSON(subjects, `analytics-${dateStr.replace(/[: ,/]/g,'_')}.json`);

      actions.append(previewBtn, applyBtn, dlBtn, jsonBtn);
      itemEl.append(info, actions);
      serverListEl.appendChild(itemEl);
    });

    // helper to highlight selected item
    function highlightItem(id){
      serverListEl.querySelectorAll('.server-item').forEach(el=>{
        if(el.dataset.analyticsId === id) el.classList.add('active'); else el.classList.remove('active');
      });
    }
  }

  function previewSubjectTimes(subjects){
    // compute studyData with override and update charts/UI without changing localStorage
    try{
      const sd = window.computeStudyData({ subjectSecondsOverride: subjects });
      updateSummaryUI(sd);
      updateCharts(sd);
      if(serverMsgEl) serverMsgEl.textContent = 'Preview ready';
    }catch(e){ console.error('Preview error', e); if(serverMsgEl) serverMsgEl.textContent = 'Preview failed'; }
  }

  function applySubjectTimes(subjects, id, options={commit:true}){
    // apply to charts immediately; optionally commit to localStorage
    try{
      if(options.commit !== false){
        localStorage.setItem('subjectTimeData', JSON.stringify(subjects));
      }
      // recompute from (committed) localStorage so other parts are in sync, but if we didn't commit use the override
      const sd = window.computeStudyData({ subjectSecondsOverride: options.commit===false ? subjects : undefined });
      updateSummaryUI(sd);
      updateCharts(sd);
      if(id) sessionStorage.setItem('appliedAnalyticsId', id);
      if(serverMsgEl) serverMsgEl.textContent = options.commit ? 'Applied to local data' : 'Previewed latest analytics';
    }catch(e){ console.error('Apply error', e); if(serverMsgEl) serverMsgEl.textContent = 'Apply failed'; }
  }

  function downloadCSV(subjectTimes, filename='analytics.csv'){
    const rows = [['subject','minutes']];
    for(const s in subjectTimes){ const mins = Math.round((subjectTimes[s]||0)/60); rows.push([s, mins]); }
    const csv = rows.map(r=>r.map(v=>`"${String(v).replace(/\"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv],{type:'text/csv'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  function downloadJSON(subjectTimes, filename='analytics.json'){
    const blob = new Blob([JSON.stringify(subjectTimes,null,2)],{type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  async function downloadAllCSV(){
    const token = getToken(); if(!token){ if(serverMsgEl) serverMsgEl.textContent='Sign in to download'; return; }
    if(serverMsgEl) serverMsgEl.textContent='Preparing...';
    try{
      const res = await fetch(`${API_BASE}/api/analytics`, { headers: { Authorization: 'Bearer ' + token }});
      if(!res.ok){ if(serverMsgEl) serverMsgEl.textContent='Failed to load'; return; }
      const data = await res.json();
      const merged = {};
      (data.items || []).forEach(it=>{ const st = it.subjectTimes || {}; for(const k in st) merged[k] = (merged[k] || 0) + st[k]; });
      downloadCSV(merged, 'all-analytics.csv');
      if(serverMsgEl) serverMsgEl.textContent='Downloaded';
    }catch(e){ console.error(e); if(serverMsgEl) serverMsgEl.textContent='Error'; }
  }

  if(refreshButton) refreshButton.addEventListener('click', fetchServerAnalytics);
  if(downloadAllBtn) downloadAllBtn.addEventListener('click', downloadAllCSV);

  // try to fetch on load when token exists
  if(getToken()) fetchServerAnalytics();

});