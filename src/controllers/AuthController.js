import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuid } from "uuid";
import User from "../models/users.js";
import Post from "../models/posts.js";
import { requiresAuth } from "./utils/authUtils.js";
import sign from "jwt-encode";
import { createMediaDocument, deleteMediaDocumentByID } from './utils/CloudinaryFunctions.js'

dotenv.config({path: path.join(path.resolve(), '../../.env')});
/**
 * All the routes related to Auth are present here.
 * These are Publicly accessible routes.
 * */

/**
 * This handler handles checks uniqueness of username and password.
 * send POST Request at /api/auth/check
 * body contains {username, password}
 * */
export const checkUsernameHandler = async function (req, res) {
  try {
    const { username, password, email, phNo } = req.body;
    const foundUser = email.trim().length > 0 ? await User.findOne({$or: [
      { username: username },
      { email: email }
    ]})
    : 
    await User.findOne({$or: [
      { username: username },
      { phNo: phNo }
    ]});
    if (foundUser) {
      return res.status(422).send({unique: false});
    }else return res.status(200).send({unique: true}) 
    
  } catch (error) {
    return res.status(500).send({ error });
  }
};

/**
 * This handler handles user signups.
 * send POST Request at /api/auth/signup
 * body contains {firstName, lastName, username}
 * */



export const signupHandler = async function (req, res) {
  const { username, profileImg, bannerImg, backImgLink, ...rest } = req.body;

  try {
    // check if username already exists
    const foundUser = await User.findOne({ username: username });
    if (foundUser) {
      return res.status(422).send({ errors: ["Unprocessable Entity. Username Already Exists."] });
    };
    const _id = uuid();
    
    const encodedToken = sign(
      { _id },
      process.env.REACT_APP_JWT_SECRET
    );

    
    
    const [profileImgDoc, bannerImgDoc, backImgLinkDoc] = await Promise.all([
      createMediaDocument(profileImg), 
      createMediaDocument(bannerImg),
      createMediaDocument(backImgLink)
    ])

    const profileImgID = profileImgDoc ?? 'b7684540-1a95-4574-b3c2-e65bc2441b68';
    const bannerImgID = bannerImgDoc ?? "44d0636e-7f2e-449d-b216-2ddb33a13f7b";
    const backImgLinkID = backImgLinkDoc ?? "c79f3a10-e2b9-491b-9dc1-d15a9cfcb747";

    const newUser = {
      ...rest,
      _id,
      username,
      profileImg: profileImgID,
      bannerImg: bannerImgID,
      backImgLink: backImgLinkID, 
      token: encodedToken,
      createdAt: Date(Date.now()),
      loginAt: Date(Date.now())
    };
    const createdUser = new User(newUser);
    const userCreated = await createdUser.save()
    .then(t => t.populate({
      path: 'profileImg bannerImg backImgLink',
      type: 'type name'
    }))
        
    return res.status(201).send({ createdUser: userCreated, encodedToken}) 
    
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error });
  }
};

/**
 * This handler handles user login.
 * send POST Request at /api/auth/login/email
 * body contains {email, password}
 * */

export const emailLoginHandler = async function (req, res) {
  
  const { email, password } = req.body;
  try {
    const foundUser = await User.findOne({ email: email }).populate({
      path: 'profileImg bannerImg backImgLink',
      type: 'type name'
    });
    if (!foundUser) {
      return res.status(404).send({ errors: [ "The email you entered is not Registered. Not Found error" ] });
    }
    if (password === foundUser.userPassword) {
      const encodedToken = sign(
        { _id: foundUser._id },
        process.env.REACT_APP_JWT_SECRET
      );
      foundUser.token = encodedToken;
      foundUser.loginAt = Date(Date.now());
      await foundUser.save()
      return res.status(200).send({foundUser, encodedToken});
    }
    return res.status(401).send({
      errors: [
        "The credentials you entered are invalid. Unauthorized access error.",
      ],
    });
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error });
  }
};


/**
 * This handler handles user login.
 * send POST Request at /api/auth/login/phone
 * body contains {phNo, dateOfBirth}
 * */

export const phoneLoginHandler = async function (req, res) {
  const { phNo, dateOfBirth } = req.body;
  try {
    const foundUser = await User.findOne({ phNo: phNo }).populate({
      path: 'profileImg bannerImg backImgLink',
      type: 'type name'
    });
    if (!foundUser) {
      return res.status(404).send({ errors: [ "Phone login Invalid."] });
    }
    if (dateOfBirth === foundUser.dateOfBirth) {
      const encodedToken = sign(
        { _id: foundUser._id },
        process.env.REACT_APP_JWT_SECRET
      );
      foundUser.token = encodedToken;
      foundUser.loginAt = Date(Date.now());
      await foundUser.save()
      return res.status(200).send({foundUser, encodedToken});
    }
    return res.status(401).send({
      errors: [
        "The credentials you entered are invalid. Unauthorized access error.",
      ],
    });
  } catch (error) {
    return res.status(500).send({ error });
  }
};

/**
 * This handler handles user auto login.
 * send post Request at /api/auth/autologin
 * body contains {email, token}
 * */

export const autoLoginHandler = async function (req, res) {
  const { username, token } = req.body;
  try {
    const foundUser = await User.findOne({ username: username }).populate({
      path: 'profileImg bannerImg backImgLink',
      type: 'type name'
    });
    if (!foundUser) {
      return res.status(404).send({ errors: [ "Autologin Invalid."] });
    }
    
    const encodedToken = sign(
      { _id: foundUser._id },
      process.env.REACT_APP_JWT_SECRET
    );
    
    if (encodedToken === token) {
      foundUser.token = encodedToken;
      foundUser.loginAt = Date(Date.now());
      await foundUser.save()
      return res.status(200).send({ foundUser, encodedToken }) 
    }
    return res.status(401).send({
      errors: [
        "Autologin invalid. Unauthorized access error.",
      ],
    });
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error });
  }
};


/**
 * This handler handles user logout.
 * send post Request at /api/auth/logout
 * header contains token
 * */

export const logoutUserHandler = async function (req, res) {
  try {
    const user = await requiresAuth.call(this, req);

    if (!user) {
      return res.status(404).send({ errors: [ "User Invalid."] });
    }
    
    await User.findOneAndUpdate({ _id: user._id }, {token: "", loginAt: ""})
    return res.status(200).send({ logout: true });
  } catch (error) {
    return res.status(500).send({ error });
  }
};

/**
 * This handler handles delete user.
 * send delete Request at /api/auth/delete
 * header contains token
 * */

export const deleteUserHandler = async function (req, res) {
  
  try {
    const oldUser = await requiresAuth.call(this, req);
    
    if (!oldUser) {
      return res.status(404).send({ errors: [ "User Invalid."] });
    }
    
    const user = await User.findById(oldUser._id).populate({
      path: 'posts',
      select: 'bookmarkBy commentsArray likedBy parentPost postImgLink',
      populate: {
        path: 'postImgLink',
        select: 'name'
      }
    })
    const { bookmarks, posts, likes, followers, following } = user;

    

    //delete followers
    await Promise.all(followers.map(async(userID) => {
      let tempUser = await User.findById(userID).select('following');
      tempUser.following = tempUser.following.filter(user_id => user_id !== user._id);
      return User.findByIdAndUpdate(tempUser._id, {following: tempUser.following})
    }))


    //delete following
    await Promise.all(following.map(async (userID) => {
      let tempUser = await User.findById(userID).select('followers');
      tempUser.followers = tempUser.followers.filter(user_id => user_id !== user._id);
      return User.findByIdAndUpdate( tempUser._id, { followers: tempUser.followers});
    }))

    //delete likes from post
    await Promise.all(likes.map(async (postID) => {
      let tempPost = await Post.findById(postID);
      tempPost.likedBy = tempPost.likedBy.filter(user_id => user_id !== user._id);
      return Post.findByIdAndUpdate( tempPost._id , { likedBy: tempPost.likedBy });
    }));
    
    //delete bookmarks from post
    await Promise.all(bookmarks.map(async (postID) => {
      let tempPost = await Post.findById(postID).select('bookmarkBy');
      tempPost.bookmarkBy = tempPost.bookmarkBy.filter(user_id => user_id !== user._id);
      return Post.findByIdAndUpdate( tempPost._id , {bookmarkBy: tempPost.bookmarkBy});
    }))


    //delete posts
    await Promise.all(posts.map(async(userPost) => {
      let { bookmarkBy, commentsArray, likedBy, postImgLink, parentPost } = userPost;

      //delete likes      
      await Promise.all(likedBy.map(async (userID) => {
        let tempUser = await User.findById(userID).select('likes');
        tempUser.likes = tempUser.likes.filter(post => post !== userPost._id);
        return User.findByIdAndUpdate( tempUser._id, {likes: tempUser.likes});
      }));

      //deletebookmarks
      await Promise.all(bookmarkBy.map( async (userID) => {
        let tempUser = await User.findById(userID).select('bookmarks');
        tempUser.bookmarks = tempUser.bookmarks.filter(post => post !== userPost._id);
         return User.findByIdAndUpdate( tempUser._id, { bookmarks: tempUser.bookmarks});
      }));
      
      //set parent of posts.commentsArray to null
      await Promise.all(commentsArray.map((postID) => {
        return Post.findByIdAndUpdate( postID , { parentPost: null });
      }));

      //delete media
      await Promise.all(postImgLink.map(item => deleteMediaDocumentByID(item._id)))

      //remove from commentArray of parent
      
      if(parentPost !== null){
        let tempPostArray = await Post.findById(parentPost);
        
        tempPostArray.commentsArray = tempPostArray.commentsArray.filter(post => post !== userPost._id);
        await Post.findByIdAndUpdate(parentPost, {commentsArray: tempPostArray.commentsArray});
      }

      // return Post.findByIdAndDelete(userPost._id)
    }))

    await Promise.all(posts.map(post => Post.findByIdAndDelete(post)))

    // // END 
    await Promise.all([deleteMediaDocumentByID(user.profileImg), deleteMediaDocumentByID(user.backImgLink), deleteMediaDocumentByID(user.bannerImg)])
    
    await User.findByIdAndDelete( user._id );
    return res.status(200).send({ deleted: true });
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error });
  }
};