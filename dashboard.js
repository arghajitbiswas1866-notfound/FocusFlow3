//nav clock//
const clock = document.getElementById('clock');

setInterval(function () {
  let date = new Date();
  clock.innerHTML = date.toLocaleTimeString();
}, 1000);

// Theme handling moved to `theme.js` (shared across pages)

const homeBtn = document.getElementById('home');
const calendarEl = document.getElementById('calendar');
const examPlannerBtn = document.getElementById('examPlanner');
const analyticsBtn = document.getElementById('analytics');

homeBtn.addEventListener("click", () => {
  window.location.href = "landing.html";
});

examPlannerBtn.addEventListener("click", () => {
  window.location.href = "exam_planner.html";
});

analyticsBtn.addEventListener("click", () => {
  window.location.href = "analytics.html";
});



// ===== Profile UI =====
const profileBtn = document.getElementById('profile');
const profileLabel = document.getElementById('profileLabel');
const profileDropdown = document.getElementById('profileDropdown');
const profileNameEl = document.getElementById('profileName');
const profileEmailEl = document.getElementById('profileEmail');
const signOutBtn = document.getElementById('signOut');
const goSignInBtn = document.getElementById('goSignIn');

function getToken(){ return localStorage.getItem('token'); }

async function loadProfileInfo(){
  const token = getToken();
  if(!token){
    updateProfileUIFromLocal();
    return;
  }
  try{
    const res = await fetch(`${API_BASE}/api/user/me`, { headers: { Authorization: 'Bearer ' + token }});
    if(!res.ok){
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      updateProfileUIFromLocal();
      return;
    }
    const data = await res.json();
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    updateProfileUIFromLocal();
  } catch(e){
    console.error('Failed to fetch profile', e);
    updateProfileUIFromLocal();
  }
}

function updateProfileUIFromLocal(){
  const cur = JSON.parse(localStorage.getItem('currentUser') || 'null');
  if(cur && cur.name){
    profileLabel.textContent = cur.name.split(' ')[0];
    profileNameEl.textContent = cur.name;
    profileEmailEl.textContent = cur.email || '';
    signOutBtn.classList.remove('hidden');
    goSignInBtn.classList.add('hidden');
  } else {
    profileLabel.textContent = 'Profile';
    profileNameEl.textContent = 'Guest';
    profileEmailEl.textContent = '';
    signOutBtn.classList.add('hidden');
    goSignInBtn.classList.remove('hidden');
  }
}

loadProfileInfo();

profileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle('hidden');
  profileDropdown.setAttribute('aria-hidden', profileDropdown.classList.contains('hidden'));
});

goSignInBtn.addEventListener('click', () => {
  window.location.href = "signin-signup.html";
});

signOutBtn.addEventListener('click', () => {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('token');
  updateProfileUIFromLocal();
  profileDropdown.classList.add('hidden');
});

// close dropdown when clicking outside
document.addEventListener('click', (e) => {
  if(!profileDropdown.classList.contains('hidden')){
    if(!profileDropdown.contains(e.target) && e.target !== profileBtn) {
      profileDropdown.classList.add('hidden');
      profileDropdown.setAttribute('aria-hidden', 'true');
    }
  }
});

// // ===== Calendar =====
const calendar = document.getElementById("calendar");

const today = new Date();
const year = today.getFullYear();
const month = today.getMonth();
const todayDate = today.getDate();

const daysInMonth = new Date(year, month + 1, 0).getDate();
const STORAGE_KEY = "studyTimeData";

// load stored data
let studyData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

// key for today
const todayKey = `${year}-${month + 1}-${todayDate}`;

// initialize today if not exists
if (!studyData[todayKey]) {
  studyData[todayKey] = 0;
}

// render calendar
function renderCalendar() {
  calendar.innerHTML = "";

  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${year}-${month + 1}-${day}`;
    const timeSpent = studyData[dateKey] || 0;

    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day");

    // GitHub-like intensity (in minutes)
    if (timeSpent >= 5) dayDiv.classList.add("level-1");
    if (timeSpent >= 10) dayDiv.classList.add("level-2");
    if (timeSpent >= 20) dayDiv.classList.add("level-3");
    if (timeSpent >= 40) dayDiv.classList.add("level-4");

    dayDiv.innerHTML = `<span>${day}</span>`;
    calendar.appendChild(dayDiv);
  }
}

// auto track time (1 minute = +1)
setInterval(() => {
  studyData[todayKey] += 1;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(studyData));
  renderCalendar();
}, 60000); // every 1 minute

renderCalendar();


// ========= timers ================//

/* ---------- INDIA DATE HELPERS ---------- */
function indiaNow(){
  return new Date(new Date().toLocaleString("en-US",{timeZone:"Asia/Kolkata"}));
}

function dateKeyIndia(d){
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}

date.textContent=indiaNow().toDateString();

/* ---------- FORMAT ---------- */
function fmt(s){
  return [s/3600,s%3600/60,s%60]
    .map(v=>String(Math.floor(v)).padStart(2,"0")).join(":");
}

/* ---------- GLOBAL ---------- */
let globalSec=0;
const studiedDays=JSON.parse(localStorage.getItem("studiedDays")||"{}");

/*
 * SINGLE ACTIVE TIMER CONTROLLER
 * Only one timer (subject or topic) runs at any time.
 * When a new timer starts it calls stopActive() first,
 * which clears the interval and calls the previous owner's
 * stopFn so it can reset its own running flag + button text.
 */
let activeTimer = null; // { intervalId, stopFn }

function stopActive(){
  if(!activeTimer) return;
  clearInterval(activeTimer.intervalId);
  activeTimer.stopFn();
  activeTimer = null;
}

/* ---------- GLOBAL UPDATE ---------- */
function updateGlobal(){
  globalTimer.textContent=fmt(globalSec);
}

/* ---------- SUBJECT ---------- */
function addSubject(_restore){
  const name = _restore ? _restore.name : prompt("Subject name");
  if(!name) return;

  let sec = _restore ? _restore.sec : 0;
  let running=false;

  const subject=document.createElement("div");
  subject.className="subject";

  const row=document.createElement("div");
  row.className="subject-row";

  const title=document.createElement("span");
  title.textContent=name;

  const actions=document.createElement("div");
  actions.className="actions";

  const time=document.createElement("span");
  time.className="time";
  time.textContent=fmt(sec);

  // Function to update subject timer display
  function updateSubjectTime(){
    time.textContent=fmt(sec);
  }

  function tick(){
    sec++; 
    globalSec++;
    updateSubjectTime();
    updateGlobal();
    saveAll();
  }

  // called by stopActive() when something else takes over
  function subjectStopUI(){
    running = false;
    play.textContent = "▶";
  }

  const play=document.createElement("button");
  play.className="play";
  play.textContent="▶";
  play.onclick=()=>{
    if(running){
      stopActive();
    } else {
      stopActive();
      const id = setInterval(tick, 1000);
      running = true;
      play.textContent = "⏸";
      activeTimer = { intervalId: id, stopFn: subjectStopUI };
    }
  };

  const del=document.createElement("button");
  del.className="delete";
  del.textContent="🗑";
  del.onclick=()=>{
    stopActive();
    globalSec-=sec;
    subject.remove();
    updateGlobal();
    saveAll();
  };

  actions.append(time,play,del);
  row.append(title,actions);

  const topics=document.createElement("div");
  topics.className="topics";

  const addTopic=document.createElement("button");
  addTopic.className="add-topic";
  addTopic.textContent="+ Topic";
  addTopic.onclick = () => addTopicFn(topics, (topicSec) => {
    sec += topicSec;             // Add topic seconds to subject
    updateSubjectTime();         // Update subject timer display
  });

  subject.append(row,addTopic,topics);
  subjects.appendChild(subject);

  // restore saved topics into this subject
  if(_restore && _restore.topics){
    _restore.topics.forEach(t => {
      addTopicFn(topics, (topicSec) => {
        sec += topicSec;
        updateSubjectTime();
      }, { name: t.name, sec: t.sec });
    });
  }
}

/* ---------- TOPIC ---------- */
function addTopicFn(container,addToSubject,_restore){
  const name = _restore ? _restore.name : prompt("Topic name");
  if(!name) return;

  let sec = _restore ? _restore.sec : 0;
  let running=false;

  const div=document.createElement("div");
  div.className="topic";

  const label=document.createElement("span");
  label.textContent=name;

  const actions=document.createElement("div");
  actions.className="actions";

  const time=document.createElement("span");
  time.className="time";
  time.textContent=fmt(sec);

  function tick(){
    sec++; 
    globalSec++; 
    addToSubject(1); // increment subject timer by 1 sec
    time.textContent=fmt(sec);
    updateGlobal();
    saveAll();
  }

  // called by stopActive() when something else takes over
  function topicStopUI(){
    running = false;
    play.textContent = "▶";
  }

  const play=document.createElement("button");
  play.className="play";
  play.textContent="▶";
  play.onclick=()=>{
    if(running){
      stopActive();
    } else {
      stopActive();
      const id = setInterval(tick, 1000);
      running = true;
      play.textContent = "⏸";
      activeTimer = { intervalId: id, stopFn: topicStopUI };
    }
  };

  const del=document.createElement("button");
  del.className="delete";
  del.textContent="🗑";
  del.onclick=()=>{
    if(running) stopActive();
    globalSec-=sec;
    addToSubject(-sec); // remove topic time from subject
    div.remove();
    updateGlobal();
    saveAll();
  };

  actions.append(time,play,del);
  div.append(label,actions);
  container.appendChild(div);
}

// ========= PERSISTENCE ================//

const SUBJECTS_KEY = "savedSubjects";

// "HH:MM:SS" → total seconds
function timeToSec(str){
  const [h, m, s] = str.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

// reads the live DOM and writes everything to localStorage
function saveAll(){
  const data = [];

  document.querySelectorAll("#subjects > .subject").forEach(subjectEl => {
    const name = subjectEl.querySelector(".subject-row > span").textContent;
    const sec = timeToSec(subjectEl.querySelector(".subject-row .time").textContent);

    const topics = [];
    subjectEl.querySelectorAll(".topics .topic").forEach(topicEl => {
      topics.push({
        name: topicEl.querySelector("span").textContent,
        sec: timeToSec(topicEl.querySelector(".time").textContent)
      });
    });

    data.push({ name, sec, topics });
  });

  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(data));
  localStorage.setItem("globalSec", String(globalSec));

  // export subjects as { name: seconds } for analytics
  const subjectSeconds = {};
  data.forEach(s => { subjectSeconds[s.name] = s.sec; });
  localStorage.setItem("subjectTimeData", JSON.stringify(subjectSeconds));

  // try to sync to server if signed in
  syncAnalytics(subjectSeconds);
}

// send subjectSeconds to server if user is signed-in
async function syncAnalytics(subjectSeconds){
  const token = localStorage.getItem('token');
  if(!token) return;
  try {
    await fetch(`${API_BASE}/api/analytics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ subjectTimes: subjectSeconds })
    });
  } catch (err) {
    console.error('Analytics sync failed', err);
  }
}

// runs once on page load — rebuilds every subject + topic from saved data
function restoreAll(){
  const saved = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || "[]");
  const savedGlobal = Number(localStorage.getItem("globalSec") || 0);

  globalSec = savedGlobal;
  updateGlobal();

  saved.forEach(s => addSubject(s));
}

restoreAll();