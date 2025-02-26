import {v2 as cloudinary} from "cloudinary"
import fs from 'fs'


 cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET_KEY
 });
const UploadFileToCloudinary = async( localFilePath)=>{
       try{
        if(! localFilePath) {
            console.log('local file path not found');
            return null;
            
        };
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
        })
        console.log(response);
        
        console.log("file upload to cloudinry sucessfull with url:", response.url);
        fs.unlinkSync(localFilePath);
        return response
        
       }
       catch(error){
       console.log('error in uploadFileToCloudinary< ', error);
       fs.unlinkSync(localFilePath) // remove locally stored file path if uplaod fails

       return null;
       }
}
export { UploadFileToCloudinary}