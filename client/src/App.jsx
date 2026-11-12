import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search, Bell, ArrowUpRight, CalendarDays, Users, BookOpen, Sparkles,
  Plus, Filter, Clock3, MapPin, X, CheckCircle2, ExternalLink, Menu,
  Sun, Moon, SearchX, LogOut, Download, FileText, Globe
} from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import EventCard from './components/EventCard.jsx';
import Toast from './components/Toast.jsx';
import {
  getDashboardData, registerForEvent, toggleClub, isRegistered,
  getSavedUser, signOut, signIn, signUp, createResource, openResource, createEvent, createClub
} from './lib/api.js';

const categories = ['All events', 'Technology', 'Workshop', 'Community', 'Sports', 'Academic'];
const clubCategories = ['Technology', 'Design', 'Media', 'Sports', 'Academic', 'Culture'];
const eventColors = ['orange', 'purple', 'green', 'blue', 'pink'];

function initials(name = 'Student') {
  return name.split(' ').map(x => x[0]).slice(0, 2).join('').toUpperCase();
}

export default function App() {
  const [active, setActive] = useState('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [data, setData] = useState({ events: [], clubs: [], resources: [], mode: 'loading' });
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All events');
  const [toast, setToast] = useState('');
  const [selected, setSelected] = useState(null);
  const [user, setUser] = useState(getSavedUser());
  const [dark, setDark] = useState(false);
  const [resourceQuery, setResourceQuery] = useState('');
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const openEvent = useCallback((event) => setSelected(event), []);

  // Modals state
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [showUploadResource, setShowUploadResource] = useState(false);
  const [previewResourceItem, setPreviewResourceItem] = useState(null);

  // Forms state
  const [eventForm, setEventForm] = useState({
    title: '', category: 'Technology', date: '', time: '10:00 AM',
    location: '', organizer: '', description: '', capacity: 100, color: 'orange'
  });
  const [clubForm, setClubForm] = useState({
    name: '', category: 'Technology', description: '', icon: 'code'
  });
  const [resourceForm, setResourceForm] = useState({
    title: '', subject: '', type: 'PDF', author: '', url: '', description: ''
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    const d = await getDashboardData();
    setData(d);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }, [dark]);

  const registeredIds = useMemo(
    () => new Set(user ? (user.registrations || []) : data.events.filter(event => isRegistered(event._id)).map(event => event._id)),
    [data.events, user]
  );

  const clubs = useMemo(() => data.clubs.map(club => ({
    ...club,
    joined: user ? (user.joinedClubs || []).includes(club._id) : Boolean(club.joined)
  })), [data.clubs, user]);

  const events = data.events.filter(e =>
    (category === 'All events' || e.category === category) &&
    `${e.title} ${e.category} ${e.location} ${e.organizer}`.toLowerCase().includes(query.toLowerCase())
  );

  const resources = data.resources.filter(r =>
    `${r.title} ${r.subject} ${r.author}`.toLowerCase().includes(resourceQuery.toLowerCase())
  );

  const navigate = (page) => {
    setActive(page);
    setMobileMenu(false);
    setQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuth = (mode = 'signin', message = '') => {
    setAuthMode(mode);
    setAuthError(message);
    setAuthForm(current => ({ ...current, password: '' }));
    setShowAuth(true);
  };

  const promptForSignIn = (message = 'Your session expired. Sign in again to continue.') => {
    signOut();
    setUser(null);
    openAuth('signin', message);
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    try {
      const account = authMode === 'signin'
        ? await signIn(authForm.email, authForm.password)
        : await signUp(authForm.name, authForm.email, authForm.password);
      setUser(account);
      setShowAuth(false);
      setAuthForm({ name: '', email: '', password: '' });
      setToast(authMode === 'signin' ? `Welcome back, ${account.name}.` : 'Your account is ready. Welcome to CampusConnect!');
    } catch (error) {
      setAuthError(error.message || 'Could not authenticate. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (id) => {
    if (!user) {
      openAuth('signin', 'Sign in or create an account to register for events.');
      return;
    }
    try {
      const r = await registerForEvent(id);
      setUser(current => current ? {
        ...current,
        registrations: r.registered
          ? [...new Set([...(current.registrations || []), id])]
          : (current.registrations || []).filter(registeredId => registeredId !== id)
      } : current);
      setToast(r.message || (r.registered ? 'Registration successful' : 'Registration updated'));
      await refresh();
    } catch (e) {
      if (e.status === 401) {
        promptForSignIn(e.message);
        return;
      }
      setToast(e.message || 'Could not update registration.');
    }
  };

  const join = async (id) => {
    if (!user) {
      openAuth('signin', 'Sign in or create an account to join clubs.');
      return;
    }
    try {
      const r = await toggleClub(id);
      setUser(current => current ? {
        ...current,
        joinedClubs: r.joined
          ? [...new Set([...(current.joinedClubs || []), id])]
          : (current.joinedClubs || []).filter(joinedId => joinedId !== id)
      } : current);
      setToast(r.joined ? 'You joined the club!' : 'You left the club.');
      await refresh();
    } catch (e) {
      if (e.status === 401) {
        promptForSignIn(e.message);
        return;
      }
      setToast(e.message || 'Could not update club.');
    }
  };

  const handleOpenResource = async (res) => {
    setPreviewResourceItem(res);
    try {
      const updated = await openResource(res._id);
      if (updated && updated.downloads !== undefined) {
        setPreviewResourceItem(prev => prev && prev._id === res._id ? { ...prev, downloads: updated.downloads } : prev);
        setData(prev => ({
          ...prev,
          resources: prev.resources.map(item => item._id === res._id ? { ...item, downloads: updated.downloads } : item)
        }));
      }
    } catch {
      // preview stays open regardless
    }
  };

  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.date || !eventForm.location) {
      setToast('Please provide a title, date, and location.');
      return;
    }
    try {
      await createEvent({
        ...eventForm,
        organizer: eventForm.organizer || user?.name || 'Campus Student'
      });
      setToast('Event created successfully!');
      setShowCreateEvent(false);
      setEventForm({
        title: '', category: 'Technology', date: '', time: '10:00 AM',
        location: '', organizer: '', description: '', capacity: 100, color: 'orange'
      });
      await refresh();
    } catch (err) {
      setToast(err.message || 'Could not create event.');
    }
  };

  const handleCreateClubSubmit = async (e) => {
    e.preventDefault();
    if (!clubForm.name || !clubForm.category) {
      setToast('Please enter a club name and category.');
      return;
    }
    try {
      await createClub(clubForm);
      setToast('Club registered successfully!');
      setShowCreateClub(false);
      setClubForm({ name: '', category: 'Technology', description: '', icon: 'code' });
      await refresh();
    } catch (err) {
      setToast(err.message || 'Could not create club.');
    }
  };

  const handleUploadResourceSubmit = async (e) => {
    e.preventDefault();
    if (!resourceForm.title || !resourceForm.subject) {
      setToast('Please enter a resource title and subject.');
      return;
    }
    try {
      await createResource({
        ...resourceForm,
        author: resourceForm.author || user?.name || 'Student Contributor'
      });
      setToast('Study resource shared successfully!');
      setShowUploadResource(false);
      setResourceForm({ title: '', subject: '', type: 'PDF', author: '', url: '', description: '' });
      await refresh();
    } catch (err) {
      setToast(err.message || 'Could not upload resource.');
    }
  };

  const dateLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="app-shell">
      {mobileMenu && <button className="mobile-scrim" onClick={() => setMobileMenu(false)} aria-label="Close navigation" />}
      <div className={mobileMenu ? 'mobile-sidebar open' : 'mobile-sidebar'}>
        <Sidebar active={active} onNavigate={navigate} collapsed={false} setCollapsed={setCollapsed} />
      </div>
      <div className="desktop-sidebar">
        <Sidebar active={active} onNavigate={navigate} collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu-btn" onClick={() => setMobileMenu(true)} aria-label="Open menu">
              <Menu size={19} />
            </button>
            <div className="breadcrumb">
              Workspace <span>/</span> <strong>{({
                overview: 'Overview',
                events: 'Campus events',
                clubs: 'Clubs & communities',
                resources: 'Study resources',
                saved: 'My registrations',
                settings: 'Settings'
              })[active]}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="date-chip">
              <CalendarDays size={15} />
              {dateLabel}
            </div>
            <button className="icon-button" onClick={() => setDark(!dark)} title="Toggle theme">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="notification-button" onClick={() => setToast('You’re all caught up!')} aria-label="Notifications">
              <Bell size={18} />
              <i />
            </button>
            <div className="user-menu">
              {user ? (
                <>
                  <div className="user-avatar">{initials(user.name)}</div>
                  <div className="user-copy">
                    <strong>{user.name}</strong>
                    <small>{user.email}</small>
                  </div>
                  <button className="plain-icon" title="Sign out" aria-label="Sign out" onClick={() => { signOut(); setUser(null); setToast('Signed out.'); }}>
                    <LogOut size={15} />
                  </button>
                </>
              ) : (
                <button className="secondary-btn auth-header-btn" onClick={() => openAuth('signin')}>
                  Sign in
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="page-wrap">
          {active === 'overview' && (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow"><span className="live-dot" /> YOUR CAMPUS, CONNECTED</div>
                  <h1>Good morning, {user?.name?.split(' ')[0] || 'there'} <span className="wave">✳</span></h1>
                  <p className="subtitle">Here’s what’s happening around your campus today.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="secondary-btn" onClick={() => setShowCreateEvent(true)}>
                    <Plus size={16} /> Host event
                  </button>
                  <button className="primary-btn" onClick={() => navigate('events')}>
                    <CalendarDays size={16} /> Explore events
                  </button>
                </div>
              </section>

              <section className="hero-banner">
                <div className="hero-copy">
                  <span className="hero-kicker"><Sparkles size={14} /> THIS WEEK ON CAMPUS</span>
                  <h2>Make something<br /><em>worth showing.</em></h2>
                  <p>Meet your people, build your next idea, and find your place on campus.</p>
                  <button className="hero-button" onClick={() => navigate('events')}>
                    Discover campus events <ArrowUpRight size={16} />
                  </button>
                  <div className="hero-footnote"><span className="hero-dot" /> New opportunities added every week</div>
                </div>
                <div className="hero-graphic">
                  <div className="orbit orbit-one" />
                  <div className="orbit orbit-two" />
                  <div className="hero-sun">✳</div>
                  <div className="hero-sticker sticker-a">BUILD<br />TOGETHER</div>
                  <div className="hero-sticker sticker-b">IDEAS → IMPACT</div>
                  <div className="hero-code">&lt; campus /&gt;</div>
                </div>
                <div className="hero-number">01 — 04</div>
              </section>

              <section className="stats-grid">
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Upcoming events</span>
                    <span className="stat-icon orange"><CalendarDays size={18} /></span>
                  </div>
                  <strong>{data.events.length.toString().padStart(2, '0')}</strong>
                  <div className="stat-bottom"><span className="trend">↗ Live listings</span><span>across campus</span></div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Student communities</span>
                    <span className="stat-icon sage"><Users size={18} /></span>
                  </div>
                  <strong>{data.clubs.length.toString().padStart(2, '0')}</strong>
                  <div className="stat-bottom"><span className="trend">Find your people</span></div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Study resources</span>
                    <span className="stat-icon lilac"><BookOpen size={18} /></span>
                  </div>
                  <strong>{data.resources.length.toString().padStart(2, '0')}</strong>
                  <div className="stat-bottom"><span className="trend">Shared by students</span></div>
                </div>
                <div className="stat-card">
                  <div className="stat-top">
                    <span>My registrations</span>
                    <span className="stat-icon blue"><CheckCircle2 size={18} /></span>
                  </div>
                  <strong>{[...registeredIds].length.toString().padStart(2, '0')}</strong>
                  <div className="stat-bottom"><span>Events you’re attending</span></div>
                </div>
              </section>

              <section className="section-block">
                <div className="section-heading">
                  <div>
                    <div className="eyebrow">DON’T MISS OUT</div>
                    <h2>Coming up <span className="heading-count">({events.length})</span></h2>
                  </div>
                  <button className="text-link" onClick={() => navigate('events')}>View all events <ArrowUpRight size={16} /></button>
                </div>
                <EventGrid events={data.events.slice(0, 3)} registeredIds={registeredIds} onRegister={register} onOpen={openEvent} />
              </section>

              <section className="lower-grid">
                <div className="panel community-panel">
                  <div className="section-heading compact">
                    <div>
                      <div className="eyebrow">FIND YOUR PEOPLE</div>
                      <h2>Communities to explore</h2>
                    </div>
                    <button className="plain-icon" onClick={() => navigate('clubs')} title="Explore clubs"><ArrowUpRight size={18} /></button>
                  </div>
                  {clubs.slice(0, 3).map((c) => (
                    <ClubRow key={c._id} club={c} onJoin={join} />
                  ))}
                </div>

                <div className="panel resource-panel">
                  <div className="section-heading compact">
                    <div>
                      <div className="eyebrow">STUDY SMARTER</div>
                      <h2>Fresh resources</h2>
                    </div>
                    <button className="plain-icon" onClick={() => navigate('resources')} title="Explore resources"><ArrowUpRight size={18} /></button>
                  </div>
                  {data.resources.slice(0, 3).map(r => (
                    <div className="resource-row clickable-row" key={r._id} onClick={() => handleOpenResource(r)}>
                      <div className="file-icon">{r.type === 'PDF' ? 'PDF' : '↗'}</div>
                      <div className="resource-info">
                        <strong>{r.title}</strong>
                        <small>{r.subject} · {r.author}</small>
                      </div>
                      <button className="plain-icon" title="Preview resource" onClick={(e) => { e.stopPropagation(); handleOpenResource(r); }}>
                        <ArrowUpRight size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {active === 'events' && (
            <>
              <div className="page-header-row">
                <PageHeading
                  eyebrow="CAMPUS CALENDAR"
                  title="Events worth showing up for"
                  description="Find your next workshop, buildathon, match, or campus meetup."
                />
                <button className="primary-btn" onClick={() => setShowCreateEvent(true)}>
                  <Plus size={16} /> Host an event
                </button>
              </div>

              <div className="filter-bar">
                <div className="search-field">
                  <Search size={17} />
                  <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search events, places, organisers…" />
                  {query && <button onClick={() => setQuery('')}><X size={14} /></button>}
                </div>
                <div className="filter-label"><Filter size={15} /><span>Category</span></div>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              {events.length ? (
                <EventGrid events={events} registeredIds={registeredIds} onRegister={register} onOpen={openEvent} />
              ) : (
                <EmptyState title="No events found" text="Try a different keyword or category." />
              )}
            </>
          )}

          {active === 'clubs' && (
            <>
              <div className="page-header-row">
                <PageHeading
                  eyebrow="COMMUNITY DIRECTORY"
                  title="Find your people."
                  description="Join a community that makes you curious, creative, or just a little more you."
                />
                <button className="primary-btn" onClick={() => setShowCreateClub(true)}>
                  <Plus size={16} /> Start a club
                </button>
              </div>

              <div className="search-field wide-search">
                <Search size={17} />
                <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search clubs and interests…" />
              </div>

              <div className="club-grid">
                {clubs
                  .filter(c => `${c.name} ${c.category} ${c.description}`.toLowerCase().includes(query.toLowerCase()))
                  .map(c => <ClubCard key={c._id} club={c} onJoin={join} />)}
              </div>
            </>
          )}

          {active === 'resources' && (
            <>
              <div className="page-header-row">
                <PageHeading
                  eyebrow="STUDENT KNOWLEDGE BASE"
                  title="Study smarter, together."
                  description="Notes, quick references, and useful links shared by your campus community."
                />
                <button className="primary-btn" onClick={() => setShowUploadResource(true)}>
                  <Plus size={16} /> Share resource
                </button>
              </div>

              <div className="search-field wide-search">
                <Search size={17} />
                <input value={resourceQuery} onChange={e => setResourceQuery(e.target.value)} placeholder="Search notes, subjects, or contributors…" />
              </div>

              <div className="resource-list">
                {resources.map(r => (
                  <div className="resource-large clickable-row" key={r._id} onClick={() => handleOpenResource(r)}>
                    <div className="file-icon big">{r.type === 'PDF' ? 'PDF' : '↗'}</div>
                    <div className="resource-info">
                      <strong>{r.title}</strong>
                      <small>{r.subject} · Shared by {r.author}</small>
                    </div>
                    <span className="resource-type">{r.type}</span>
                    <span className="download-count">{r.downloads || 0} saves</span>
                    <button className="secondary-btn" onClick={(e) => { e.stopPropagation(); handleOpenResource(r); }}>
                      Preview resource <ArrowUpRight size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="info-note">
                <Sparkles size={18} />
                <div>
                  <strong>Have notes that helped you?</strong>
                  <p>Share your study summaries, cheat sheets, or recommended lecture references with campus peers.</p>
                </div>
                <button className="primary-btn" onClick={() => setShowUploadResource(true)}>
                  Share a resource <Plus size={15} />
                </button>
              </div>
            </>
          )}

          {active === 'saved' && (
            <>
              <PageHeading
                eyebrow="YOUR CAMPUS ACTIVITY"
                title="My registrations"
                description="Your saved place in the events you’re planning to attend."
              />
              <div className="event-grid">
                {data.events.filter(e => registeredIds.has(e._id)).map(e => (
                  <EventCard key={e._id} event={e} registered onRegister={register} onOpen={openEvent} />
                ))}
              </div>
              {!data.events.some(e => registeredIds.has(e._id)) && (
                <EmptyState title="Your calendar is open" text="Register for an event and it will appear here." action={() => navigate('events')} actionLabel="Explore events" />
              )}
            </>
          )}

          {active === 'settings' && (
            <>
              <PageHeading eyebrow="PREFERENCES" title="Settings" description="Personalise your CampusConnect experience." />
              <div className="settings-panel">
                <div className="settings-line">
                  <div>
                    <strong>Appearance</strong>
                    <p>Switch between light and dark themes.</p>
                  </div>
                  <button className="secondary-btn" onClick={() => setDark(!dark)}>
                    {dark ? 'Use light theme' : 'Use dark theme'}
                  </button>
                </div>
                <div className="settings-line">
                  <div>
                    <strong>Account</strong>
                    <p>{user ? `Signed in as ${user.email}` : 'You are exploring the demo as a guest.'}</p>
                  </div>
                  {user && (
                    <button className="secondary-btn" onClick={() => { signOut(); setUser(null); setToast('Signed out.'); }}>
                      Sign out
                    </button>
                  )}
                </div>
                <div className="settings-line">
                  <div>
                    <strong>Connection mode</strong>
                    <p>{data.mode === 'api' ? 'Connected to the Express API' : 'Demo mode · sample data stored in this browser'}</p>
                  </div>
                  <span className={`status-pill ${data.mode === 'api' ? 'online' : ''}`}>
                    {data.mode === 'api' ? 'API connected' : 'Demo mode'}
                  </span>
                </div>
              </div>
            </>
          )}

          {loading && <div className="loading-note">Refreshing campus data…</div>}

          <footer className="footer">
            <span>© 2026 CampusConnect · Student community project</span>
            <span>
              <span className={`connection-dot ${data.mode === 'api' ? 'online' : ''}`} />
              {data.mode === 'api' ? 'Connected to API' : 'Running in demo mode'} <span className="footer-sep">·</span> Built for Full Stack Development
            </span>
          </footer>
        </div>
      </main>

      {/* Event Details Modal */}
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section className="event-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}><X size={18} /></button>
            <span className={`modal-tag ${selected.color}`}>{selected.category}</span>
            <h2>{selected.title}</h2>
            <p className="modal-description">{selected.description}</p>
            <div className="modal-detail">
              <CalendarDays size={17} />
              <div>
                <strong>{new Date(`${selected.date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong>
                <small>{selected.time}</small>
              </div>
            </div>
            <div className="modal-detail">
              <MapPin size={17} />
              <div>
                <strong>{selected.location}</strong>
                <small>Organised by {selected.organizer}</small>
              </div>
            </div>
            <div className="modal-detail">
              <Users size={17} />
              <div>
                <strong>{selected.attendees} students attending</strong>
                <small>{selected.capacity - selected.attendees} places remaining</small>
              </div>
            </div>
            <button className="primary-btn modal-cta" onClick={async () => { await register(selected._id); setSelected(null); }}>
              {registeredIds.has(selected._id) ? 'Cancel registration' : 'Register for event'} <ArrowUpRight size={16} />
            </button>
            <p className="modal-disclaimer">Demo data for coursework. Confirm event details with the organiser.</p>
          </section>
        </div>
      )}

      {/* Resource Preview Modal */}
      {previewResourceItem && (
        <div className="modal-backdrop" onClick={() => setPreviewResourceItem(null)}>
          <section className="form-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setPreviewResourceItem(null)}><X size={18} /></button>
            <span className="modal-tag orange">{previewResourceItem.subject}</span>
            <h2>{previewResourceItem.title}</h2>
            <p className="form-modal-subtitle">Shared by {previewResourceItem.author || 'Student Contributor'}</p>

            <div className="preview-meta-chips">
              <span className="preview-chip"><FileText size={13} /> Format: {previewResourceItem.type}</span>
              <span className="preview-chip"><Download size={13} /> {previewResourceItem.downloads || 0} saves</span>
              {previewResourceItem.url && (
                <span className="preview-chip"><Globe size={13} /> Web Link Available</span>
              )}
            </div>

            <div className="resource-preview-box">
              <strong>Study Notes & Excerpt Preview</strong>
              <pre style={{ marginTop: '8px' }}>
                {previewResourceItem.description ||
                  `Summary notes for ${previewResourceItem.title}.\nIncludes key definitions, formulas, and reference diagrams for revision.`}
              </pre>
            </div>

            <div className="modal-form-actions">
              {previewResourceItem.url ? (
                <a
                  href={previewResourceItem.url}
                  target="_blank"
                  rel="noreferrer"
                  className="primary-btn"
                  style={{ textDecoration: 'none' }}
                  onClick={() => setToast('Opening external resource…')}
                >
                  Open external resource <ExternalLink size={15} />
                </a>
              ) : (
                <button
                  className="primary-btn"
                  onClick={() => setToast('Document downloaded to your browser preview.')}
                >
                  <Download size={15} /> Save study document
                </button>
              )}
              <button className="secondary-btn" onClick={() => setPreviewResourceItem(null)}>
                Close
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Resource Upload Modal */}
      {showUploadResource && (
        <div className="modal-backdrop" onClick={() => setShowUploadResource(false)}>
          <section className="form-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowUploadResource(false)}><X size={18} /></button>
            <span className="modal-tag green">Knowledge Base</span>
            <h2>Share a Study Resource</h2>
            <p className="form-modal-subtitle">Upload revision summaries, formulas, or curated links for your classmates.</p>

            <form className="modal-form" onSubmit={handleUploadResourceSubmit}>
              <div className="form-field">
                <label>Resource Title *</label>
                <input
                  required
                  placeholder="e.g. Distributed Systems Exam Cheat Sheet"
                  value={resourceForm.title}
                  onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Subject / Course *</label>
                  <input
                    required
                    placeholder="e.g. Cloud Computing"
                    value={resourceForm.subject}
                    onChange={e => setResourceForm({ ...resourceForm, subject: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Format</label>
                  <select
                    value={resourceForm.type}
                    onChange={e => setResourceForm({ ...resourceForm, type: e.target.value })}
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="Link">Web Reference / Link</option>
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Contributor Name</label>
                  <input
                    placeholder={user?.name || 'Your name or handle'}
                    value={resourceForm.author}
                    onChange={e => setResourceForm({ ...resourceForm, author: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Resource URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... or docs"
                    value={resourceForm.url}
                    onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Notes Summary / Excerpt</label>
                <textarea
                  placeholder="Write a brief overview of key topics covered or paste high-yield notes here…"
                  value={resourceForm.description}
                  onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })}
                />
              </div>

              <div className="modal-form-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowUploadResource(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Publish resource <ArrowUpRight size={15} />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Host Event Modal */}
      {showCreateEvent && (
        <div className="modal-backdrop" onClick={() => setShowCreateEvent(false)}>
          <section className="form-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateEvent(false)}><X size={18} /></button>
            <span className="modal-tag orange">Campus Events</span>
            <h2>Host a Campus Event</h2>
            <p className="form-modal-subtitle">Publish an event to the campus schedule for clubs, workshops, or fixtures.</p>

            <form className="modal-form" onSubmit={handleCreateEventSubmit}>
              <div className="form-field">
                <label>Event Title *</label>
                <input
                  required
                  placeholder="e.g. AI Agents Hands-On Hacknight"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                />
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Category *</label>
                  <select
                    value={eventForm.category}
                    onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
                  >
                    {categories.filter(c => c !== 'All events').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <label>Card Color Accent</label>
                  <select
                    value={eventForm.color}
                    onChange={e => setEventForm({ ...eventForm, color: e.target.value })}
                  >
                    {eventColors.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Date *</label>
                  <input
                    type="date"
                    required
                    value={eventForm.date}
                    onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Time *</label>
                  <input
                    required
                    placeholder="e.g. 10:30 AM"
                    value={eventForm.time}
                    onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-2">
                <div className="form-field">
                  <label>Location / Venue *</label>
                  <input
                    required
                    placeholder="e.g. Lab 3, Tech Block"
                    value={eventForm.location}
                    onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label>Capacity</label>
                  <input
                    type="number"
                    min="5"
                    max="1000"
                    placeholder="100"
                    value={eventForm.capacity}
                    onChange={e => setEventForm({ ...eventForm, capacity: Number(e.target.value) || 100 })}
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Organizing Club / Body</label>
                <input
                  placeholder={user?.name ? `${user.name} & Developer Club` : 'e.g. Coding Society'}
                  value={eventForm.organizer}
                  onChange={e => setEventForm({ ...eventForm, organizer: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Event Description</label>
                <textarea
                  placeholder="Outline the agenda, prerequisites, and what students will experience…"
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                />
              </div>

              <div className="modal-form-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowCreateEvent(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Publish event <ArrowUpRight size={15} />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Start Club Modal */}
      {showCreateClub && (
        <div className="modal-backdrop" onClick={() => setShowCreateClub(false)}>
          <section className="form-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateClub(false)}><X size={18} /></button>
            <span className="modal-tag purple">Student Communities</span>
            <h2>Start a Student Community</h2>
            <p className="form-modal-subtitle">Register a new club or interest group to bring campus peers together.</p>

            <form className="modal-form" onSubmit={handleCreateClubSubmit}>
              <div className="form-field">
                <label>Club Name *</label>
                <input
                  required
                  placeholder="e.g. Robotics & Automation Group"
                  value={clubForm.name}
                  onChange={e => setClubForm({ ...clubForm, name: e.target.value })}
                />
              </div>

              <div className="form-field">
                <label>Category *</label>
                <select
                  value={clubForm.category}
                  onChange={e => setClubForm({ ...clubForm, category: e.target.value })}
                >
                  {clubCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-field">
                <label>Mission & Description</label>
                <textarea
                  placeholder="Describe your club's mission, regular activities, and who should join…"
                  value={clubForm.description}
                  onChange={e => setClubForm({ ...clubForm, description: e.target.value })}
                />
              </div>

              <div className="modal-form-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowCreateClub(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-btn">
                  Register club <ArrowUpRight size={15} />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {showAuth && (
        <div className="modal-backdrop auth-backdrop" onClick={() => !authLoading && setShowAuth(false)}>
          <section className="form-modal auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" onClick={event => event.stopPropagation()}>
            <button className="modal-close" aria-label="Close sign-in" disabled={authLoading} onClick={() => setShowAuth(false)}><X size={18} /></button>
            <span className="modal-tag green">CampusConnect account</span>
            <h2 id="auth-title">{authMode === 'signin' ? 'Welcome back' : 'Join your campus community'}</h2>
            <p className="form-modal-subtitle">
              {authMode === 'signin'
                ? 'Sign in to register for events and join student clubs.'
                : 'Create an account to save your campus activity to your profile.'}
            </p>

            <div className="auth-tabs" role="tablist" aria-label="Account access">
              <button type="button" role="tab" aria-selected={authMode === 'signin'} className={authMode === 'signin' ? 'active' : ''}
                onClick={() => { setAuthMode('signin'); setAuthError(''); setAuthForm(current => ({ ...current, password: '' })); }}>
                Sign in
              </button>
              <button type="button" role="tab" aria-selected={authMode === 'signup'} className={authMode === 'signup' ? 'active' : ''}
                onClick={() => { setAuthMode('signup'); setAuthError(''); setAuthForm(current => ({ ...current, password: '' })); }}>
                Create account
              </button>
            </div>

            <form className="modal-form" onSubmit={handleAuthSubmit}>
              {authMode === 'signup' && (
                <div className="form-field">
                  <label htmlFor="auth-name">Full name</label>
                  <input id="auth-name" name="name" autoComplete="name" required maxLength={80} value={authForm.name}
                    onChange={event => setAuthForm(current => ({ ...current, name: event.target.value }))} />
                </div>
              )}
              <div className="form-field">
                <label htmlFor="auth-email">Email address</label>
                <input id="auth-email" name="email" type="email" autoComplete="email" required value={authForm.email}
                  onChange={event => setAuthForm(current => ({ ...current, email: event.target.value }))} />
              </div>
              <div className="form-field">
                <label htmlFor="auth-password">Password</label>
                <input id="auth-password" name="password" type="password" autoComplete={authMode === 'signin' ? 'current-password' : 'new-password'}
                  required minLength={8} value={authForm.password}
                  onChange={event => setAuthForm(current => ({ ...current, password: event.target.value }))} />
                {authMode === 'signup' && <small>Use at least 8 characters.</small>}
              </div>
              {authError && <p className="auth-error" role="alert">{authError}</p>}
              <button className="primary-btn auth-submit" type="submit" disabled={authLoading}>
                {authLoading ? 'Please wait…' : authMode === 'signin' ? 'Sign in' : 'Create account'}
                {!authLoading && <ArrowUpRight size={15} />}
              </button>
            </form>
            <p className="auth-privacy-note">Your account is stored with this CampusConnect demo.</p>
          </section>
        </div>
      )}

      <Toast message={toast} onClose={() => setToast('')} />
    </div>
  );
}

function EventGrid({ events, registeredIds, onRegister, onOpen }) {
  return (
    <div className="event-grid">
      {events.map(e => (
        <EventCard key={e._id} event={e} registered={registeredIds.has(e._id)} onRegister={onRegister} onOpen={onOpen} />
      ))}
    </div>
  );
}

function PageHeading({ eyebrow, title, description }) {
  return (
    <section className="page-heading">
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

function EmptyState({ title, text, action, actionLabel }) {
  return (
    <div className="empty-state">
      <SearchX size={30} />
      <h3>{title}</h3>
      <p>{text}</p>
      {action && <button className="primary-btn" onClick={action}>{actionLabel}</button>}
    </div>
  );
}

function ClubRow({ club, onJoin }) {
  return (
    <div className="club-row">
      <div className={`club-icon ${club.category === 'Technology' ? 'orange' : club.category === 'Design' ? 'purple' : 'blue'}`}>
        {club.name.split(' ').map(x => x[0]).slice(0, 2).join('')}
      </div>
      <div className="club-info">
        <strong>{club.name}</strong>
        <small>{club.members} members · {club.category}</small>
      </div>
      <button className="join-mini" onClick={() => onJoin(club._id)}>
        {club.joined ? 'Joined' : 'Join'}
      </button>
    </div>
  );
}

function ClubCard({ club, onJoin }) {
  return (
    <article className="club-card">
      <div className="club-card-top">
        <div className={`club-icon large ${club.category === 'Technology' ? 'orange' : club.category === 'Design' ? 'purple' : club.category === 'Media' ? 'pink' : 'blue'}`}>
          {club.name.split(' ').map(x => x[0]).slice(0, 2).join('')}
        </div>
        <span className="club-category">{club.category}</span>
      </div>
      <h3>{club.name}</h3>
      <p>{club.description}</p>
      <div className="club-card-footer">
        <span><Users size={15} />{club.members} members</span>
        <button className={club.joined ? 'secondary-btn' : 'primary-btn'} onClick={() => onJoin(club._id)}>
          {club.joined ? 'Joined ✓' : 'Join community'}
        </button>
      </div>
    </article>
  );
}
