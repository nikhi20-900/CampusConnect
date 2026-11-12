const API = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const DEMO_KEY = 'campusconnect-demo-v1';
const seed = {
  events: [
    { _id:'e1', title:'Buildathon 2026', category:'Technology', date:'2026-11-28', time:'09:30 AM', location:'Innovation Lab · Block C', organizer:'DSU Developer Club', description:'A 24-hour build sprint to turn bold ideas into working prototypes.', attendees:86, capacity:120, color:'orange', tag:'Registration open' },
    { _id:'e2', title:'Design Systems Workshop', category:'Workshop', date:'2026-11-13', time:'02:00 PM', location:'Design Studio · Room 204', organizer:'Design Society', description:'Learn reusable components, accessible interfaces, and design tokens.', attendees:42, capacity:60, color:'purple', tag:'Few seats left' },
    { _id:'e3', title:'Open Source Friday', category:'Community', date:'2026-11-20', time:'11:00 AM', location:'Central Library', organizer:'Open Source Circle', description:'Pick a beginner-friendly issue and make your first meaningful contribution.', attendees:31, capacity:80, color:'green', tag:'Beginner friendly' },
    { _id:'e4', title:'Inter-college Football', category:'Sports', date:'2026-12-12', time:'04:30 PM', location:'University Sports Ground', organizer:'Sports Council', description:'Support the campus team in this friendly inter-college fixture.', attendees:115, capacity:200, color:'blue', tag:'Campus favourite' },
    { _id:'e5', title:'Research Poster Day', category:'Academic', date:'2026-12-04', time:'10:00 AM', location:'Seminar Hall 1', organizer:'Research Forum', description:'Explore student projects across computing, science, and design.', attendees:54, capacity:100, color:'pink', tag:'New' }
  ],
  clubs: [
    {_id:'c1',name:'DSU Developer Club',category:'Technology',members:248,icon:'code',description:'Build projects, learn modern development, and collaborate on hackathons.',joined:false},
    {_id:'c2',name:'Design Society',category:'Design',members:164,icon:'palette',description:'A community for product thinking, UI/UX, visual design, and critique.',joined:false},
    {_id:'c3',name:'Open Source Circle',category:'Technology',members:132,icon:'git',description:'Contribute to open source and learn Git workflows with peers.',joined:true},
    {_id:'c4',name:'Campus Creators',category:'Media',members:96,icon:'camera',description:'Photography, film, storytelling, and documenting campus life.',joined:false}
  ],
  resources: [
    {_id:'r1',title:'React Patterns — Quick Notes',subject:'Web Development',type:'PDF',author:'Aarav M.',downloads:124,url:'https://react.dev',description:'Covers component composition, custom hooks, context API, and common performance pitfalls with memoization.'},
    {_id:'r2',title:'DBMS Normalization Cheat Sheet',subject:'Database Systems',type:'PDF',author:'Meera S.',downloads:98,url:'',description:'Summary of 1NF, 2NF, 3NF, BCNF with functional dependencies and decomposition examples.'},
    {_id:'r3',title:'JavaScript Interview Prep',subject:'Programming',type:'Link',author:'Dev Club',downloads:86,url:'https://developer.mozilla.org',description:'Event loop, closures, prototypes, async/await, and common coding questions.'},
    {_id:'r4',title:'Operating Systems — Unit 2',subject:'Computer Science',type:'PDF',author:'Rohan K.',downloads:73,url:'',description:'Process scheduling algorithms, CPU scheduling, inter-process communication, and semaphores.'}
  ]
};

function readDemo() {
  try {
    const data = JSON.parse(localStorage.getItem(DEMO_KEY)) || structuredClone(seed);
    const sampleDates = new Map(seed.events.map(event => [event.title, event.date]));
    data.events = (data.events || []).map(event => sampleDates.has(event.title) ? { ...event, date: sampleDates.get(event.title) } : event);
    return data;
  } catch {
    return structuredClone(seed);
  }
}
function writeDemo(data) { localStorage.setItem(DEMO_KEY, JSON.stringify(data)); }
function readRegistrations() {
  try {
    const registrations = JSON.parse(localStorage.getItem('campusconnect-registrations') || '[]');
    return Array.isArray(registrations) ? registrations : [];
  } catch {
    return [];
  }
}

async function request(path, options={}) {
  const token = localStorage.getItem('campusconnect-token');
  const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type':'application/json', ...(token?{Authorization:`Bearer ${token}`} : {}), ...(options.headers||{}) } });
  const payload = await response.json().catch(()=>({message:'Unexpected server response'}));
  if (!response.ok) {
    const error = new Error(payload.message || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function canUseDemoFallback(error) {
  return !error.status && !localStorage.getItem('campusconnect-token');
}

export async function getDashboardData() {
  try { const [events,clubs,resources] = await Promise.all([request('/events'),request('/clubs'),request('/resources')]); return {events,clubs,resources,mode:'api'}; }
  catch (error) {
    if (error.status) throw error;
    return {...readDemo(),mode:'demo'};
  }
}

export async function registerForEvent(eventId) {
  try { return await request(`/events/${eventId}/register`,{method:'POST'}); }
  catch (error) {
    if (!canUseDemoFallback(error)) throw error;
    const data=readDemo(); const event=data.events.find(e=>e._id===eventId);
    if(!event) throw error;
    const registered=new Set(readRegistrations());
    if(registered.has(eventId)){registered.delete(eventId);event.attendees=Math.max(0,event.attendees-1);} else {registered.add(eventId);event.attendees+=1;}
    localStorage.setItem('campusconnect-registrations',JSON.stringify([...registered]));writeDemo(data);
    return {message:registered.has(eventId)?'You are registered!':'Registration cancelled',registered:registered.has(eventId),demo:true};
  }
}

export async function toggleClub(clubId) {
  try { return await request(`/clubs/${clubId}/join`,{method:'POST'}); }
  catch (error) { if (!canUseDemoFallback(error)) throw error; const data=readDemo(); const club=data.clubs.find(c=>c._id===clubId); if(!club)throw error; club.joined=!club.joined; club.members+=club.joined?1:-1; writeDemo(data); return {club,joined:club.joined,demo:true}; }
}

export async function createResource(payload) {
  try { return await request('/resources', { method: 'POST', body: JSON.stringify(payload) }); }
  catch (error) {
    if (!canUseDemoFallback(error)) throw error;
    const data = readDemo();
    const newRes = {
      _id: 'r_' + Date.now(),
      title: payload.title,
      subject: payload.subject,
      type: payload.type || 'PDF',
      author: payload.author || 'Anonymous Student',
      downloads: 0,
      url: payload.url || '',
      description: payload.description || ''
    };
    data.resources.unshift(newRes);
    writeDemo(data);
    return newRes;
  }
}

export async function openResource(resourceId) {
  try { return await request(`/resources/${resourceId}`); }
  catch (error) {
    if (!canUseDemoFallback(error)) throw error;
    const data = readDemo();
    const res = data.resources.find(r => r._id === resourceId);
    if (res) {
      res.downloads = (res.downloads || 0) + 1;
      writeDemo(data);
    }
    return res;
  }
}

export async function createEvent(payload) {
  try { return await request('/events', { method: 'POST', body: JSON.stringify(payload) }); }
  catch (error) {
    if (!canUseDemoFallback(error)) throw error;
    const data = readDemo();
    const newEvent = {
      _id: 'e_' + Date.now(),
      title: payload.title,
      category: payload.category || 'Technology',
      date: payload.date,
      time: payload.time,
      location: payload.location,
      organizer: payload.organizer || 'Campus Student',
      description: payload.description || '',
      attendees: 1,
      capacity: Number(payload.capacity) || 100,
      color: payload.color || 'orange',
      tag: payload.tag || 'Registration open'
    };
    data.events.unshift(newEvent);
    writeDemo(data);
    return newEvent;
  }
}

export async function createClub(payload) {
  try { return await request('/clubs', { method: 'POST', body: JSON.stringify(payload) }); }
  catch (error) {
    if (!canUseDemoFallback(error)) throw error;
    const data = readDemo();
    const newClub = {
      _id: 'c_' + Date.now(),
      name: payload.name,
      category: payload.category || 'Technology',
      members: 1,
      icon: payload.icon || 'code',
      description: payload.description || '',
      joined: true
    };
    data.clubs.unshift(newClub);
    writeDemo(data);
    return newClub;
  }
}

export async function signIn(email,password) { const data=await request('/auth/login',{method:'POST',body:JSON.stringify({email,password})}); localStorage.setItem('campusconnect-token',data.token);localStorage.setItem('campusconnect-user',JSON.stringify(data.user));return data.user; }
export async function signUp(name,email,password) { const data=await request('/auth/register',{method:'POST',body:JSON.stringify({name,email,password})});localStorage.setItem('campusconnect-token',data.token);localStorage.setItem('campusconnect-user',JSON.stringify(data.user));return data.user; }
export function isRegistered(id){return new Set(readRegistrations()).has(id);}
export function getSavedUser(){try{return JSON.parse(localStorage.getItem('campusconnect-user'));}catch{return null;}}
export function signOut(){localStorage.removeItem('campusconnect-token');localStorage.removeItem('campusconnect-user');}
export { seed };
