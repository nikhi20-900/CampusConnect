import Event from '../models/Event.js';
import Club from '../models/Club.js';
import Resource from '../models/Resource.js';
export async function seedIfEmpty(){if(await Event.countDocuments()===0)await Event.insertMany([
{title:'Buildathon 2026',category:'Technology',date:'2026-11-28',time:'09:30 AM',location:'Innovation Lab · Block C',organizer:'DSU Developer Club',description:'A 24-hour build sprint to turn bold ideas into working prototypes.',attendees:86,capacity:120,color:'orange',tag:'Registration open'},
{title:'Design Systems Workshop',category:'Workshop',date:'2026-11-13',time:'02:00 PM',location:'Design Studio · Room 204',organizer:'Design Society',description:'Learn reusable components, accessible interfaces, and design tokens.',attendees:42,capacity:60,color:'purple',tag:'Few seats left'},
{title:'Open Source Friday',category:'Community',date:'2026-11-20',time:'11:00 AM',location:'Central Library',organizer:'Open Source Circle',description:'Pick a beginner-friendly issue and make your first meaningful contribution.',attendees:31,capacity:80,color:'green',tag:'Beginner friendly'},
{title:'Inter-college Football',category:'Sports',date:'2026-12-12',time:'04:30 PM',location:'University Sports Ground',organizer:'Sports Council',description:'Support the campus team in this friendly inter-college fixture.',attendees:115,capacity:200,color:'blue',tag:'Campus favourite'},
{title:'Research Poster Day',category:'Academic',date:'2026-12-04',time:'10:00 AM',location:'Seminar Hall 1',organizer:'Research Forum',description:'Explore student projects across computing, science, and design.',attendees:54,capacity:100,color:'pink',tag:'New'}
]);
if(await Club.countDocuments()===0)await Club.insertMany([
{name:'DSU Developer Club',category:'Technology',members:248,icon:'code',description:'Build projects, learn modern development, and collaborate on hackathons.'},
{name:'Design Society',category:'Design',members:164,icon:'palette',description:'A community for product thinking, UI/UX, visual design, and critique.'},
{name:'Open Source Circle',category:'Technology',members:132,icon:'git',description:'Contribute to open source and learn Git workflows with peers.'},
{name:'Campus Creators',category:'Media',members:96,icon:'camera',description:'Photography, film, storytelling, and documenting campus life.'}
]);
if(await Resource.countDocuments()===0)await Resource.insertMany([
{title:'React Patterns — Quick Notes',subject:'Web Development',type:'PDF',author:'Aarav M.',downloads:124},
{title:'DBMS Normalization Cheat Sheet',subject:'Database Systems',type:'PDF',author:'Meera S.',downloads:98},
{title:'JavaScript Interview Prep',subject:'Programming',type:'Link',author:'Dev Club',downloads:86},
{title:'Operating Systems — Unit 2',subject:'Computer Science',type:'PDF',author:'Rohan K.',downloads:73}
]);}
