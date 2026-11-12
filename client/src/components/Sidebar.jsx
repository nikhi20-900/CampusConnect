import React from 'react';
import { Home, CalendarDays, Users, BookOpen, Bookmark, Settings, GraduationCap, PanelLeftClose } from 'lucide-react';
const nav = [
 {id:'overview',label:'Overview',icon:Home},
 {id:'events',label:'Campus events',icon:CalendarDays,badge:'5'},
 {id:'clubs',label:'Clubs & communities',icon:Users},
 {id:'resources',label:'Study resources',icon:BookOpen},
 {id:'saved',label:'My registrations',icon:Bookmark}
];
export default function Sidebar({active,onNavigate,collapsed,setCollapsed}) {
 return <aside className={`sidebar ${collapsed?'collapsed':''}`}>
  <div className="brand"><div className="brand-mark"><GraduationCap size={22}/></div>{!collapsed&&<div><strong>campus<span>connect</span></strong><small>STUDENT COMMUNITY</small></div>}</div>
  <div className="nav-label">{!collapsed&&'WORKSPACE'}</div>
  <nav>{nav.map(item=>{const Icon=item.icon;return <button key={item.id} className={`nav-item ${active===item.id?'active':''}`} onClick={()=>onNavigate(item.id)} title={item.label}><Icon size={18}/>{!collapsed&&<><span>{item.label}</span>{item.badge&&<em>{item.badge}</em>}</>}</button>})}</nav>
  <div className="sidebar-bottom"><div className="help-card"><div className="help-icon">✳</div>{!collapsed&&<><strong>Have an idea?</strong><p>Make campus life better together.</p><button onClick={()=>onNavigate('clubs')}>Explore communities <span>↗</span></button></>}</div><button className="nav-item settings" onClick={()=>onNavigate('settings')}><Settings size={18}/>{!collapsed&&<span>Settings</span>}</button><button className="collapse-btn" onClick={()=>setCollapsed(!collapsed)}><PanelLeftClose size={17}/>{!collapsed&&'Collapse sidebar'}</button></div>
 </aside>;
}