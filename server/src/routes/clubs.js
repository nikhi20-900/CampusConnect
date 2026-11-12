import {Router} from 'express';
import Club from '../models/Club.js';
import User from '../models/User.js';
import {requireAuth,requireRole} from '../middleware/auth.js';
const router=Router();
router.get('/',async(req,res,next)=>{try{res.json(await Club.find().sort({name:1}).lean());}catch(e){next(e);}});
router.post('/',requireAuth,requireRole('admin'),async(req,res,next)=>{try{const {name,category,description,icon}=req.body;if(!name||!category){return res.status(400).json({message:'Club name and category are required.'});}const existing=await Club.findOne({name:name.trim()});if(existing)return res.status(409).json({message:'A club with this name already exists.'});const club=await Club.create({name:name.trim(),category:category.trim(),description:description?description.trim():'',icon:icon||'users',members:1});res.status(201).json(club);}catch(e){next(e);}});
router.post('/:id/join',requireAuth,async(req,res,next)=>{try{const [user,club]=await Promise.all([User.findById(req.user.sub),Club.findById(req.params.id)]);if(!user)return res.status(401).json({message:'Please sign in again.'});if(!club)return res.status(404).json({message:'Club not found.'});const idx=user.joinedClubs.findIndex(id=>id.equals(club._id));if(idx>=0){user.joinedClubs.splice(idx,1);club.members=Math.max(0,club.members-1);}else{user.joinedClubs.push(club._id);club.members+=1;}await Promise.all([user.save(),club.save()]);res.json({club,joined:idx<0});}catch(e){next(e);}});
export default router;
