import mongoose from 'mongoose';
const resourceSchema=new mongoose.Schema({title:{type:String,required:true,trim:true},subject:{type:String,required:true},type:{type:String,enum:['PDF','Link'],default:'PDF'},author:{type:String,required:true},downloads:{type:Number,default:0,min:0},url:{type:String,default:''}},{timestamps:true});
export default mongoose.model('Resource',resourceSchema);