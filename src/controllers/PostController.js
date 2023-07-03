import dotenv from 'dotenv';
import path from 'path';
import { requiresAuth } from "./utils/authUtils.js";
import { v4 as uuid } from "uuid";
import User from "../models/users.js";
import Post from "../models/posts.js";
import { createMediaDocument, deleteMediaDocumentByID } from './utils/CloudinaryFunctions.js'

dotenv.config({path: path.join(path.resolve(), '../../.env')});
/**
 * All the routes related to post are present here.
 * */

/**
 * This handler handles gets all posts in the db.
 * send GET Request at /api/posts
 * */

export const getAllpostsHandler = async function (req, res) {
  try {
    const posts = await Post.find({}).populate({
      path: 'user_id',
      select: 'username displayName profileImg',
      populate: {
        path: 'profileImg',
        select: 'type name'
      }
    })
    .populate({
      path: 'postImgLink',
      select: 'type name'
    });
    return res.status(200).send({ posts });
  } catch (error) {
    return res.status(500).send({ error });
  }
  
};


/**
 * This handler gets current post, parent post and children post by postId in the db.
 * send GET Request at /api/posts/:postId
 * */

export const getPostHandler = async function (req, res) {
  const { postId } = req.params;
  
  try {
    //Get current post. include username, display name and profile pic for delivery.
    let post = await Post.findById( postId )
   .populate({
    path: 'user_id',
    select: 'username displayName profileImg',
    populate: {
      path: 'profileImg',
      select: 'type name'
    }
    })
    .populate({
      path: 'postImgLink',
      select: 'type name'
    })
    

    if (!post) {
      return res.status(404).send({ errors: [ "Post Not Found."] });
    }
    const currentPost = post;
    
    //Get parent posts using loop. include username, display name and profile pic for delivery.
    let parentPostArray = [];
    while(post.parentPost !== null){
      post = await Post.findById( post.parentPost ).populate({
        path: 'user_id',
        select: 'username displayName profileImg',
        populate: {
          path: 'profileImg',
          select: 'type name'
        }
      })
      .populate({
        path: 'postImgLink',
        select: 'type name'
      });
      parentPostArray.push(post);
    }
    parentPostArray = parentPostArray.reverse();

    //Get children posts using post array. include username, display name and profile pic for delivery.
    post = currentPost;
  
  const childPostArray = await Promise.all(post.commentsArray.map((id) =>  
    (Post.findById(id).populate({
        path: 'user_id',
        select: 'username displayName profileImg',
        populate: {
          path: 'profileImg',
          select: 'type name'
        }
      })
      .populate({
        path: 'postImgLink',
        select: 'type name'
      })
    )))
    
    let deliveredPosts = [currentPost];
    if(parentPostArray.length > 0){
      deliveredPosts = [...parentPostArray, ...deliveredPosts];
    }

    if(childPostArray.length > 0){
      deliveredPosts = [...deliveredPosts, ...childPostArray];
    }
    
    return res.status(200).send({ posts: deliveredPosts });
  } catch (error) { 
    console.log(error)
    return res.status(500).send({ error });
  }
};

/**
 * This handler gets posts of a user in the db by type.
 * send GET Request at /api/posts/user/:userID/:typeID
 * */
//Update logic in createPostHandler
export const getUserPostByTypeHandler = async function (req, res) {
  const { userID, typeID } = req.params;
  try {
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).send({ errors: [ "User Not Found."] });
    }
    let findArray = [];
    switch (typeID) {
      case "likes":
        findArray = user.likes;
        break;
      case "bookmarks":
        findArray = user.bookmarks;
        break;

      default:
        findArray = user.posts;
        break;
    }
    
    const posts = await Promise.all( findArray.map( async (postID) => {
      return Post.findById(postID).populate({
        path: 'user_id',
        select: 'username displayName profileImg',
        populate: {
          path: 'profileImg',
          select: 'type name'
          }})
        .populate({
          path: 'postImgLink',
          select: 'type name'
        });
      }));

    return res.status(200).send({ posts });
  } catch (error) { 
    return res.status(500).send({ error });
  }
};

/**
 * This handler handles creating a post in the db.
 * send POST Request at /api/posts/
 * body contains { postData }
 * */

export const createPostHandler = async function (req, res) {
  try {
    const user = await requiresAuth.call(this, req);
  
    if (!user) {
      return res.status(404).send({ errors: [
            "The username you entered is not Registered. Not Found error",
          ]}
      );
    }
    
    const { postData } = req.body;
    let { postImgLink } = postData;
    const postImgLinkURL = await Promise.all(postImgLink.map((item) => 
      createMediaDocument(item))
    );

    const _id = uuid();
    const post = new Post({
      ...postData,
      _id,
      postImgLink: postImgLinkURL,
      user_id: user._id
    });
    
    await post.save();
    user.posts = [...user.posts, post._id];
    await User.findByIdAndUpdate(user._id , { posts: user.posts });
    if(postData.parentPost !== null){
      const newPost = await Post.findById(postData.parentPost);
      newPost.commentsArray = [...newPost.commentsArray, _id];
      await Post.findByIdAndUpdate(postData.parentPost, { commentsArray: newPost.commentsArray });
    }

    return res.status(201).send({ posts: true });
  } catch (error) { 
    console.log(error);
    return res.status(500).send({ error });
  }
};

/**
 * This handler handles updating a post in the db.
 * send POST Request at /api/posts/edit/:postId
 * body contains { postData }
 * */
export const editPostHandler = async function (req, res) {
  try {
    const user = await requiresAuth.call(this, req);
  
    if (!user) {
      return res.status(404).send({
          errors: [
            "The username you entered is not Registered. Not Found error",
          ]
        });
    }
    const postId = req.params.postId;
    let post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({
          errors: [
            "The post you entered is not valid. Not Found error",
          ]
        });
    }

    if (post.user_id !== user._id) {
      return res.status(400).send({ errors: ["Cannot edit a Post doesn't belong to the logged in User."] });
    }


    let { postDec, commonPosts, addedPosts, deletedPosts, parentPost  } = req.body.postData;

    await Promise.all(deletedPosts.map(item => (
      deleteMediaDocumentByID(item._id)
    )))
    
    const newArray = await Promise.all(addedPosts.map(item => createMediaDocument(item)))
    let newPostImgLink = [];
    commonPosts.forEach(item => newPostImgLink.push(item._id))
    newArray.forEach(item => newPostImgLink.push(item))
    

    post = { ...post._doc, postDec, postImgLink: newPostImgLink, parentPost, editedAt: Date(Date.now()) };
    await Post.findByIdAndUpdate({ _id: postId }, post);
    return res.status(201).send({ post });
  } catch (error) { 
    console.log(error)
    return res.status(500).send({ error });
  }
};


/**
 * This handler handles deleting a post in the db.
 * send DELETE Request at /api/posts/:postId
 * */
export const deletePostHandler = async function (req, res) {
  try {
    const user = await requiresAuth.call(this, req);
  
    if (!user) {
      return res.status(404).send({
        errors: [
          "The username you entered is not Registered. Not Found error",
        ]
      });
    };
    const postId = req.params.postId;
    let post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({
          errors: [
            "The post you entered is not valid. Not Found error",
          ]
        });
    }

    if (post.user_id !== user._id) {
      return res.status(404).send({
        errors: [
          "Cannot delete a Post doesn't belong to the logged in User."
        ]
      });
    };
    //remove post from users.posts
    let {posts: userPosts} = user;
    userPosts = userPosts.filter(id => id !== postId);
    
    await User.findByIdAndUpdate( user._id, {posts: userPosts});
  
    //remove post from users.likes and users.bookmarks
    let { bookmarkBy, commentsArray, likedBy, parentPost, postImgLink } = post;

    //delete likes 
    await Promise.all(likedBy.map(async (userID) => {
        let tempUser = await User.findById(userID).select('likes');
        tempUser.likes = tempUser.likes.filter(post => post !== postId);
        return User.findByIdAndUpdate( tempUser._id, {likes: tempUser.likes});
      }));
      

    //deletebookmarks
      await Promise.all(bookmarkBy.map( async (userID) => {
        let tempUser = await User.findById(userID).select('bookmarks');
        tempUser.bookmarks = tempUser.bookmarks.filter(post => post !== postId);
         return User.findByIdAndUpdate( tempUser._id, { bookmarks: tempUser.bookmarks});
      }));

    //set parent of posts.commentsArray (children) to null
    await Promise.all(commentsArray.map((postID) => {
        return Post.findByIdAndUpdate( postID , { parentPost: null });
      }));

    //remove from commentArray of parent
    if(parentPost !== null){
      let tempPostArray = await Post.findById(parentPost);
      tempPostArray.commentsArray = tempPostArray.commentsArray.filter(post => post !== postId);
      await Post.findByIdAndUpdate(parentPost, {commentsArray: tempPostArray.commentsArray});
    }

    //delete media
        
    await Promise.all(postImgLink.map(item => deleteMediaDocumentByID(item)))
    

    //delete post from database
    await Post.findByIdAndDelete(postId);
    return res.status(201).send({ deleted: true });
  } catch (error) { 
    console.log(error)
    return res.status(500).send({ error });
  }
};


/**
 * This handler handles liking a post in the db.
 * send POST Request at /api/posts/like/:postId
 * */

export const likePostHandler = async function (req, res) {
  try {
    const user = await requiresAuth.call(this, req);
  
    if (!user) {
      return res.status(404).send({
        errors: [
          "The username you entered is not Registered. Not Found error",
        ]
      });
    }
    const postId = req.params.postId;
    let liked = false;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({
        errors: [
          "The post you entered is not valid. Not Found error",
        ]
      });
    }

    if(post.likedBy.indexOf(user._id) === -1){
      //add user._id to posts.findby(postID).likedBy database
      post.likedBy.push(user._id);
      // add postID to users.findBy(userID).likes
      user.likes.push(postId);
      liked = true
    }else{
      //remove user._id to posts.findby(postID).likedBy database
      post.likedBy = post.likedBy.filter(id => id !== user._id);
      // remove postID to users.findBy(userID).likes
      user.likes = user.likes.filter(id => id !== postId)
      
    }
    let returnPost = await Post.findByIdAndUpdate(postId, post, {returnDocument:'after'}).populate({
      path: 'user_id',
      select: 'username displayName profileImg',
      populate: {
        path: 'profileImg',
        select: 'type name'
      }
    })
    .populate({
      path: 'postImgLink',
      select: 'type name'
    });
    await User.findByIdAndUpdate(user._id , user, {returnDocument:'after'});
    
    return res.status(201).send({ post: returnPost, likes: user.likes, liked: liked });
  } catch (error) { 
    console.log(error)
    return res.status(500).send({ error });
  }
};

/**
 * This handler handles adding a post to user's bookmarks in the db.
 * send POST Request at /api/users/bookmark/:postId/
 * */

export const bookmarkPostHandler = async function (req, res) {
  
  try {
    const user = await requiresAuth.call(this, req);
  
    if (!user) {
      return res.status(404).send({
        errors: [
          "The username you entered is not Registered. Not Found error",
        ]
      });
    }
    const postId = req.params.postId;
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({
        errors: [
          "The post you entered is not valid. Not Found error",
        ]
      });
    }
    let bookmarked = false;
    if(post.bookmarkBy.indexOf(user._id) === -1){
      //add user._id to posts.findby(postID).bookmarkBy database
      post.bookmarkBy.push(user._id);
      // add postID to users.findBy(userID).bookmarks
      user.bookmarks.push(postId);
      bookmarked = true;
    }else{
      //remove user._id to posts.findby(postID).bookmarkBy database
      post.bookmarkBy = post.bookmarkBy.filter(id => id !== user._id);

      // remove postID to users.findBy(userID).bookmarks
      user.bookmarks = user.bookmarks.filter(id => id !== postId)
    }
    
    let returnPost = await Post.findByIdAndUpdate(postId, post, {returnDocument:'after'}).populate({
      path: 'user_id',
      select: 'username displayName profileImg',
      populate: {
        path: 'profileImg',
        select: 'type name'
      }
    })
    .populate({
      path: 'postImgLink',
      select: 'type name'
    });
    await User.findByIdAndUpdate(user._id , user, {returnDocument:'after'});

    
    return res.status(201).send({ post: returnPost, bookmarks: user.bookmarks, bookmarked: bookmarked });
  } catch (error) { 
    return res.status(500).send({ error });
  }
};

/**
 * This handler gets users of a post in the db by type.
 * send GET Request at /api/posts/:postID/type
 * */
export const getPostUserByTypeHandler = async function (req, res) {
  const { postId } = req.params;
  try {
    const post = await Post.findById(postId).populate({
      path: 'likedBy bookmarkBy',
      select: 'displayName username profileImg bio',
      populate: {
        path: 'profileImg',
        select: 'name type'
      }
    });
    if (!post) {
      return res.status(404).send({ errors: [ "Post Not Found."] });
    }
    
    return res.status(200).send({ likedList: post.likedBy, bookmarkedList: post.bookmarkBy });
  } catch (error) { 
    return res.status(500).send({ error });
  }
};