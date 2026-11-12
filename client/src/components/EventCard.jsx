import React from 'react';
import { CalendarDays, MapPin, ArrowUpRight, Bookmark, Users } from 'lucide-react';
export default function EventCard({event,registered,onRegister,onOpen}) {
 const date=new Date(`${event.date}T12:00:00`);
 return <article className={`event-card ${event.color||'green'}`}>
  <div className="event-art"><span className="event-category">{event.category}</span><button className={`save-btn ${registered?'saved':''}`} aria-label="Toggle registration" onClick={()=>onRegister(event._id)}><Bookmark size={17} fill={registered?'currentColor':'none'}/></button><div className="art-shape shape-one"/><div className="art-shape shape-two"/><div className="art-letter">{event.category==='Technology'?'</>':event.category==='Sports'?'↗':event.category==='Workshop'?'✳':'✦'}</div><span className="art-caption">{event.tag||'Campus event'}</span></div>
  <div className="event-content"><div className="event-date"><CalendarDays size={14}/>{date.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}<span>·</span>{event.time}</div><h3>{event.title}</h3><p>{event.description}</p><div className="event-meta"><span><MapPin size={14}/>{event.location}</span><span><Users size={14}/>{event.attendees} going</span></div><div className="event-footer"><div className="avatar-stack"><span>AS</span><span>MK</span><span>+{Math.max(0,event.attendees-2)}</span></div><button className={`text-link ${registered?'registered':''}`} onClick={()=>onOpen(event)}>{registered?'Registered':'View event'} <ArrowUpRight size={15}/></button></div></div>
 </article>;
}