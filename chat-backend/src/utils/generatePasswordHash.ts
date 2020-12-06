import bcrypt from "bcrypt"; 


export default(password:string | number = "")=>{
    return new Promise((resolve, reject)=>{
        bcrypt.genSalt(function(err, salt:any) {
            if (err) return reject(err);
            bcrypt.hash(password, 10, function(err, hash:string) {
                if (err) return reject(err);
            
                resolve(hash);
            });
        });
    })
    
}