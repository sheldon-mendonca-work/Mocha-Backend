import express from 'express';

import {
    followUserHandler,
    getAllUsersHandler,
    getUserHandler,
    getBookmarkPostsHandler,
    unfollowUserHandler,
    editUserHandler,
    getUserFollowerListHandler,
    searchUserHandler,
    notFollowedHandler,
  } from "../controllers/UserController.js";


export const router = express.Router();

// user routes (public)
router.get("/", getAllUsersHandler.bind(this));
router.get("/user/:userId", getUserHandler.bind(this));
router.get('/follower/:userID', getUserFollowerListHandler.bind(this));
router.post("/search", searchUserHandler.bind(this));

// user routes (private)
router.post("/edit", editUserHandler.bind(this));
router.get("/bookmark", getBookmarkPostsHandler.bind(this));
router.post("/follow/:followUserId/", followUserHandler.bind(this));
router.post("/unfollow/:followUserId/", unfollowUserHandler.bind(this));
router.get("/notfollow", notFollowedHandler.bind(this));