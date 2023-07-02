import {
    autoLoginHandler,
    checkUsernameHandler,
    deleteUserHandler,
    emailLoginHandler,
    logoutUserHandler,
    phoneLoginHandler,
    signupHandler,
  } from "../controllers/AuthController.js";

import express from 'express';


export const router = express.Router();

// auth routes (public)
router.post("/check", checkUsernameHandler.bind(this));
router.post("/signup", signupHandler.bind(this));
router.post("/login/email", emailLoginHandler.bind(this));
router.post("/login/phone", phoneLoginHandler.bind(this));
router.post("/autologin", autoLoginHandler.bind(this));

// auth routes (private)
router.post("/logout", logoutUserHandler.bind(this));
router.delete("/delete", deleteUserHandler.bind(this));