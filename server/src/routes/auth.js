import {Router} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const router=Router();
function tokenFor(user){return jwt.sign({sub:user._id.toString(),email:user.email,role:user.role},process.env.JWT_SECRET,{expiresIn:'2h'});}
const publicUser=user=>({
  id:user._id.toString(),
  name:user.name,
  email:user.email,
  role:user.role,
  registrations:user.registrations.map(id=>id.toString()),
  joinedClubs:user.joinedClubs.map(id=>id.toString())
});
router.post('/register',async(req,res,next)=>{try{const {name,email,password}=req.body;if(!name?.trim()||!email?.trim()||typeof password!=='string'||password.length<8)return res.status(400).json({message:'Name, email, and a password of at least 8 characters are required.'});const normalized=email.trim().toLowerCase();if(await User.findOne({email:normalized}))return res.status(409).json({message:'An account with this email already exists.'});const passwordHash=await bcrypt.hash(password,12);const user=await User.create({name:name.trim(),email:normalized,passwordHash});res.status(201).json({user:publicUser(user),token:tokenFor(user)});}catch(e){next(e);}});
router.post('/login',async(req,res,next)=>{try{const {email,password}=req.body;const user=await User.findOne({email:String(email||'').trim().toLowerCase()});if(!user||!await bcrypt.compare(String(password||''),user.passwordHash))return res.status(401).json({message:'Email or password is incorrect.'});res.json({user:publicUser(user),token:tokenFor(user)});}catch(e){next(e);}});
export default router;
