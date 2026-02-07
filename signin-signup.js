const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

const signupForm = document.getElementById('signupForm');
const signinForm = document.getElementById('signinForm');
const signupMsg = document.getElementById('signupMsg');
const signinMsg = document.getElementById('signinMsg');

// Get API base URL from environment or use relative path for local development
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : (window.NETLIFY_API_URL || ''); // Set NETLIFY_API_URL in Netlify env vars

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Auth with backend (signup / signin) using our API
function setAuth(token, user){
  localStorage.setItem('token', token);
  localStorage.setItem('currentUser', JSON.stringify(user));
}

async function apiSignup(name,email,password){
  return fetch(`${API_BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });
}

async function apiSignin(email,password){
  return fetch(`${API_BASE}/api/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
}

// Prefill email if provided in query string (useful when redirecting to signin)
(function prefillFromQuery(){
  try{
    const params = new URLSearchParams(window.location.search);
    const email = params.get('email');
    if(email){
      const signinEmailEl = document.getElementById('signinEmail');
      if(signinEmailEl) signinEmailEl.value = email;
      // show sign-in panel
      container.classList.remove('active');
    }
  }catch(e){ /* ignore */ }
})();

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signupMsg.textContent = '';
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const password = document.getElementById('signupPassword').value;
  if(!name || !email || !password){
    signupMsg.textContent = 'Please fill all fields';
    signupMsg.className = 'form-msg error';
    return;
  }
  try {
    const res = await apiSignup(name,email,password);
    const data = await res.json();
    if(!res.ok){
      signupMsg.textContent = data.message || 'Signup failed';
      signupMsg.className = 'form-msg error';
      return;
    }
    setAuth(data.token, data.user);
    signupMsg.textContent = 'Registered and signed in';
    signupMsg.className = 'form-msg success';
    signupForm.reset();
    // redirect to dashboard
    setTimeout(() => window.location.href = 'dashboard.html', 600);
  } catch (err) {
    console.error(err);
    signupMsg.textContent = 'Network error';
    signupMsg.className = 'form-msg error';
  }
});

signinForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  signinMsg.textContent = '';
  const email = document.getElementById('signinEmail').value.trim().toLowerCase();
  const password = document.getElementById('signinPassword').value;
  try {
    const res = await apiSignin(email,password);
    const data = await res.json();
    if(!res.ok){
      signinMsg.textContent = data.message || 'Signin failed';
      signinMsg.className = 'form-msg error';
      return;
    }
    setAuth(data.token, data.user);
    // redirect to dashboard
    window.location.href = "dashboard.html";
  } catch (err) {
    console.error(err);
    signinMsg.textContent = 'Network error';
    signinMsg.className = 'form-msg error';
  }
});