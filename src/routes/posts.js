import {
    createPostHandler,
    getAllpostsHandler,
    getPostHandler,
    deletePostHandler,
    editPostHandler,
    likePostHandler,
    bookmarkPostHandler,
    getUserPostByTypeHandler,
    getPostUserByTypeHandler,
  } from "../controllers/PostController.js";

import express from 'express';

export const router = express.Router();

// post routes (public)
router.get("/", getAllpostsHandler.bind(this));
router.get("/:postId", getPostHandler.bind(this));
router.get("/:postId/type", getPostUserByTypeHandler.bind(this));
router.get("/user/:userID/:typeID", getUserPostByTypeHandler.bind(this));

// post routes (private)
router.post("/", createPostHandler.bind(this));
router.delete("/:postId", deletePostHandler.bind(this));
router.post("/edit/:postId", editPostHandler.bind(this));
router.post("/like/:postId", likePostHandler.bind(this));
router.post("/bookmark/:postId/", bookmarkPostHandler.bind(this));