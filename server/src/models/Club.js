import mongoose from 'mongoose';
const clubSchema=new mongoose.Schema({name:{type:String,required:true,trim:true,unique:true},category:{type:String,required:true},members:{type:Number,default:0,min:0},icon:{type:String,default:'users'},description:{type:String,default:''}},{timestamps:true});
export default mongoose.model('Club',clubSchema);