import dotenv from 'dotenv';
import * as cloudinary from 'cloudinary'
import Media from '../../models/media.js';
import { v4 as uuid } from "uuid";
import path from 'path';


  dotenv.config({path: path.join(path.resolve(), '../../../.env')})
  const defaultMedia = ['b7684540-1a95-4574-b3c2-e65bc2441b68', "44d0636e-7f2e-449d-b216-2ddb33a13f7b", "c79f3a10-e2b9-491b-9dc1-d15a9cfcb747"]
    
  cloudinary.config({
    cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
    api_secret: process.env.REACT_APP_CLOUDINARY_API_SECRET
  })

  console.log(process.env.REACT_APP_CLOUDINARY_CLOUD_NAME)

export const createMediaDocument = async (media) => {
  
      if(media.name.length === 0) return null;
      try {
        const newID = uuid();
        const newMedia = new Media({
          _id: newID,
          ...media
        });
    
        await newMedia.save();
        return newID;
      } catch (error) {
        console.log("Error in creating media")
        return error;
      }
    }

export const deleteCloudinary = async (media) => {
  
  try {
      if(!media.public_id) return true;
      const response = await cloudinary.v2.uploader.destroy(media.public_id,{
        resource_type: media.type,
        type: 'authenticated'
      })
      const {result} = response;
      return result === 'ok'? true: false;
  } catch (error) {
      console.error("Error", error)
  }
}

export const deleteMediaDocumentByID = async (mediaID) => {
  
  if(defaultMedia.includes(mediaID)) return;
  console.log("50",mediaID)
  try {
    const media = await Media.findById(mediaID);
    const deleted = await deleteCloudinary(media);
    if(deleted){
      await Media.findByIdAndDelete(mediaID);
    }else{
      console.log("Error in deleting media")
    }
  } catch (error) {
    console.log(error)
    return error;
  }
}
