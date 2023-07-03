import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/users.js';
import { v4 as uuid } from 'uuid';
import Post from '../models/posts.js';
import sign from "jwt-encode";

/* Mongoose connection */
mongoose.connect('mongodb://127.0.0.1:27017/mochaDB');

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error in establishing connection'));
db.once('open', ()=>{
    console.log("Database is connected");
});

const userSeedDB = async() => {
    const newID = "23722911-080f-4a3a-82bb-185caad7fb75";
    const encodedToken = sign(
        { _id: newID, username: "sheldon_mendonca"},
        process.env.REACT_APP_JWT_SECRET
      );
    const user1 = new User({
        _id: newID,
        displayName: "Sheldon Mendonca",
        username: "sheldon_mendonca",
        email: "sheldonmendonca@yahoo.com",
        userPassword: "Jv0U6RWpvXFmPow",
        phNo: "4281321649",
        dateOfBirth: "1996-12-10",
        bio: "A test user checking out this app",
        encodedToken: encodedToken
      });

    await user1.save();

    

}

userSeedDB().then(() => {
    mongoose.connection.close();
})
