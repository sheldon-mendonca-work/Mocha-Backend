import dotenv from 'dotenv';
import path from 'path';
import { requiresAuth } from "./utils/authUtils.js";
import User from "../models/users.js";
import { createMediaDocument, deleteMediaDocumentByID } from './utils/CloudinaryFunctions.js';

dotenv.config({path: path.join(path.resolve(), '../../.env')});
/**
 * All the routes related to user are present here.
 * */

/**
 * This handler handles gets all users in the db.
 * send GET Request at /api/users
 * */

export const getAllUsersHandler = async function (req, res) {
  try {
    const users = await User.find({}).populate({
      path: 'profileImg bannerImg backImgLink',
      select: 'type name'
    });
    return res.status(200).send({ users });
  } catch (error) {
    return res.status(500).send({ error });
  }
 
};

/**
 * This handler handles get a user from userId in the db.
 * send GET Request at /api/users/:userId
 * */

export const getUserHandler = async function (req, res) {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate({
      path: 'profileImg bannerImg backImgLink',
      select: 'type name'
    });
    if (!user) {
      return res.status(404).send({ error: "Cannot find user" } );
    }
    return res.status(200).send({ user });
  } catch (error) {
    return res.status(500).send({ error });
  }
};


/**
 * This handler handles geting {_id, displayName, username, profileImg, bio } from a list of users in the db.
 * send GET Request at /api/follower/:userID
 * bosy is of format { followerList, followingList }
 * */

export const getUserFollowerListHandler = async function (req, res) {
  try {
    const { userID } = req.params;
    const followUser = await User.findById(userID).populate({
      path: 'followers following',
      select: 'displayName username bio profileImg followers following',
      populate: {
        path: 'profileImg',
        select: 'name type'
      }
    })

    if (!followUser) {
      return res.status(404).send({ error:  "The username you entered is not Registered. Not Found error" } );
    }

    const { followers, following } = followUser;
   
    return res.status(201).send({ followerList: followers, followingList: following });
  } catch (error) {
    return res.status(500).send({ error });
  }
};

/**
 * This handler handles updating user details.
 * send POST Request at /api/users/edit
 * body contains { userData }
 * */

export const editUserHandler = async function (req, res) {
  
  try {
    let user = await requiresAuth.call(this, req);
    if (!user) {
      return res.status(404).send({ error:
        "The username you entered is not Registered. Not Found error",
      }
      );
    }
    const { userData } = req.body;
    
    if (userData && userData.username.length > 0 && userData._id !== user._id) {
      return res.status(404).send({ error: "Username cannot be changed"});
    }

    if(userData.profileImg._id === undefined){
      await deleteMediaDocumentByID(user.profileImg._id);
      const newID = await createMediaDocument(userData.profileImg);
      userData.profileImg = newID;
    }else{
      userData.profileImg = userData.profileImg._id;
    }

    if(userData.bannerImg._id === undefined){
      await deleteMediaDocumentByID(user.bannerImg._id);
      const newID = await createMediaDocument(userData.bannerImg);
      userData.bannerImg = newID;
    }else{
      userData.bannerImg = userData.bannerImg._id;
    }

    if(userData.backImgLink._id === undefined){
      await deleteMediaDocumentByID(user.backImgLink._id);
      const newID = await createMediaDocument(userData.backImgLink);
      userData.backImgLink = newID;
    }else{
      userData.backImgLink = userData.backImgLink._id;
    }
    user = { ...user._doc, ...userData };
    const updatedUser = await User.findByIdAndUpdate(user._id, user, {returnDocument:'after'}).populate({
      path: 'profileImg bannerImg backImgLink',
      type: 'type name'
    });
    return res.status(201).send({ user: updatedUser });
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error });
  }
};

/**
 * This handler gets all the user bookmarks from the db.
 * send GET Request at /api/users/bookmark/
 * */

export const getBookmarkPostsHandler = async function (req, res) {
  
  try {
    const user = await requiresAuth.call(this, req);
    if (!user) {
      return res.status(404).send({ error:  "The username you entered is not Registered. Not Found error" } );
    }
    return new Response(200, {}, { bookmarks: user.bookmarks });
  } catch (error) {
    return res.status(500).send({ error });
  }
};

/**
 * This handler handles follow action.
 * send POST Request at /api/users/follow/:followUserId/
 * */

export const followUserHandler = async function (req, res) {
  try {
    const user = await requiresAuth.call(this, req);
    const { followUserId } = req.params;
    const followUser = await User.findById(followUserId);
    if (!user) {
      return res.status(404).send({ error:  "The username you entered is not Registered. Not Found error" } );
    }

    if (user._id === followUser._id) {
      return res.status(404).send({
          error: [
            "You cannot follow yourself"
          ],
        }
      );
    }

    const isFollowing = user.following.some(
      (currUser) => currUser._id === followUser._id
    );

    if (isFollowing) {
      return res.status(400).send({ error: "User Already following" });
    }

    
    const updatedUser = await User.findByIdAndUpdate(user._id,
      { following: [...user.following, followUser._id] }, {returnDocument:'after'}).populate({
        path: 'profileImg bannerImg backImgLink',
        select: 'type name'
      });

    const updatedFollowUser = await User.findByIdAndUpdate(followUser._id,
      { followers: [...followUser.followers, user._id] }, {returnDocument:'after'}).populate({
      path: 'profileImg bannerImg backImgLink',
      select: 'type name'
    });

    return res.status(200).send({ user: updatedUser, followUser: updatedFollowUser }
    );
  } catch (error) {
    return res.status(500).send({ error });
  }
};

/**
 * This handler handles unfollow action.
 * send POST Request at /api/users/unfollow/:followUserId/
 * */

export const unfollowUserHandler = async function (req, res) {
  try {
    const user = await requiresAuth.call(this, req);
    const { followUserId } = req.params;
    const followUser = await User.findById(followUserId);

    if (!user) {
      return res.status(404).send({ error:  "The username you entered is not Registered. Not Found error" } );
    }
    
    const isFollowing = user.following.some(
      (currUser) => currUser === followUser._id
    );
    if (!isFollowing) {
      return res.status(400).send({ error: "User already not following" });
    }

    const updatedUser = await User.findByIdAndUpdate(user._id,
      { following: user.following.filter((currUser) => currUser !== followUser._id) }, {returnDocument:'after'}).populate({
        path: 'profileImg bannerImg backImgLink',
        select: 'type name'
      });

    const updatedFollowUser = await User.findByIdAndUpdate(followUser._id,
      { followers: followUser.followers.filter((currUser) => currUser !== user._id)}, {returnDocument:'after'}).populate({
      path: 'profileImg bannerImg backImgLink',
      select: 'type name'
    });
    
    return res.status(200).send({ user: updatedUser, followUser: updatedFollowUser }
    );
  } catch (error) {
    return res.status(500).send({ error });
  }
};

/**
 * This handler handles search user details.
 * send POST Request at /api/users/search
 * body contains { search }
 * */

export const searchUserHandler = async function (req, res) {
  try {
    let { search } = req.body;
    search = search.trim().toLowerCase();
    
    if (search.length === 0) {
      return res.status(200).send({ searchList: []});
    }
     let userSearchList = await User.find({$or: [
      {username:  { $regex: search, $options: "i" }},
      {displayName:  { $regex: search, $options: "i" }}
    ]}).populate({
      path: 'profileImg displayName username',
      select: 'type name'
    })
 
    return res.status(201).send({ userSearchList });
  } catch (error) {
    return res.status(500).send({ error });
  }
};

/**
 * This handler gets users not followed.
 * send GET Request at /api/users/notfollow
 * */

export const notFollowedHandler = async function (req, res) {
  
  try {
    const user = await requiresAuth.call(this, req);
  
    if (!user) {
      return res.status(404).send({ error: "The username you entered is not Registered. Not Found error" } );
    }
    
    let userNotFollowList = [];
    const { following } = user;
    
    userNotFollowList = await User.find().where({$and: [
        {_id: {$nin: following}},
        {_id: {$ne: user._id}}
      ]}
      ).populate({
        path: 'profileImg',
        select: 'name'
      }).select('username displayName profileImg followers following')
      
        
    
    return res.status(201).send({ userNotFollowList }
    );
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error });
  }
};