import dotenv from 'dotenv';
import path from 'path';
import jwt_decode from "jwt-decode";
import User from '../../models/users.js';

dotenv.config({path: path.join(path.resolve(), '../../../.env')})

export const requiresAuth = async function (request) {
  const encodedToken = request.headers.authorization;
  const decodedToken = jwt_decode(
    encodedToken,
    process.env.REACT_APP_JWT_SECRET
  );
  if (decodedToken) {
    const user = await User.findOne({ _id: decodedToken._id }).populate({
      path: 'username displayName profileImg bannerImg backImgLink',
      select: 'name type'
    });
    return user;
  }
  return res.status(401).send({ errors: ["The token is invalid. Unauthorized access error."] })
  
};