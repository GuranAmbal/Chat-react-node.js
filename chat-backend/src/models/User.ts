import mongoose,{Schema, Document} from 'mongoose';
import generatePasswordHash from "../utils/generatePasswordHash";
import differenceInMinutes from 'date-fns/differenceInMinutes';
//import  {isEmail}  from "validator";

export interface IUser extends Document{
    email?:string,
    fullname?:string,
    password?:string,
    confirmed?: boolean,
    avatar?: string,
    confirm_hash?:string,
    last_seen?:Date,
}

const UserSchema= new Schema({
    email:{
        type:String,
        required:"Email is requiered",
        //validate:[isEmail,"Invalid email"],
        unique:true

    },
    avatar:String,
    fullname:{
        type:String,
        required:"Fullname is requiered"
    },
    password:{
        type:String,
        required:"Password is requiered"
    },
    confirmed:{
        type:Boolean,
        default:false
    },
    confirm_hash:String,
    last_seen:{
        type:Date,
        default:new Date()
    }

},{
    timestamps: true
});
UserSchema.virtual("isOnline").get(function(this:any){
    
    return differenceInMinutes(new Date()/*.toISOString()*/, this.last_seen) < 5;
})
UserSchema.set("toJSON",{
    virtuals:true
})
UserSchema.pre('save', function(next) {
    const user:any = this;

    if(!user.isModified("password")) return next();

    generatePasswordHash(user.password)
    .then(hash=>{
        user.password=String(hash);
        generatePasswordHash(user.password).then(confirmHash=>{
            user.confirm_hash=String(confirmHash);
            next();
        })
      
    }).catch(err=>{
        next(err);
    })
});
const UserModel = mongoose.model<IUser>("User",UserSchema);
export default UserModel