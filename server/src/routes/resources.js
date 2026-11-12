import {Router} from 'express';
import Resource from '../models/Resource.js';
import {requireAuth,requireRole} from '../middleware/auth.js';
const router=Router();
router.get('/',async(req,res,next)=>{try{const {q,subject}=req.query;const filter={};if(subject)filter.subject=subject;if(q)filter.$or=[{title:new RegExp(String(q),'i')},{subject:new RegExp(String(q),'i')},{author:new RegExp(String(q),'i')}];res.json(await Resource.find(filter).sort({createdAt:-1}).lean());}catch(e){next(e);}});
router.get('/:id',async(req,res,next)=>{try{const item=await Resource.findByIdAndUpdate(req.params.id,{$inc:{downloads:1}},{new:true}).lean();if(!item)return res.status(404).json({message:'Resource not found.'});res.json(item);}catch(e){next(e);}});
router.post('/',requireAuth,requireRole('student','admin'),async(req,res,next)=>{try{const {title,subject,type,author,url}=req.body;if(!title||!subject||!author){return res.status(400).json({message:'Title, subject, and author are required.'});}const resource=await Resource.create({title:title.trim(),subject:subject.trim(),type:type==='Link'?'Link':'PDF',author:author.trim(),url:url?url.trim():''});res.status(201).json(resource);}catch(e){next(e);}});
export default router;
