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
        profileImg: "1dbce2d2-b7f6-4150-9539-b3be3f2a6ee3", 
        posts: ["1c55ec33-9694-4d6e-8d9a-105dd15af267"],
        encodedToken: encodedToken
      });

    await user1.save();

    const post1 = new Post({ //
      _id: "1c55ec33-9694-4d6e-8d9a-105dd15af267",
      postDec:
      `🏆 Premier League winner
🏆 Premier League Golden Boot winner
🏆 Premier League Player of the Season
🏆 FA Cup winner
🏆 Champions League winner
    
Erling Haaland's first season at Man City was… not bad. 😮‍💨🧘🏼‍♂️`,
      postImgLink: ["cf1e7edd-f78c-4773-bcef-f146e52f80ea"],
      parentPost: null,
      user_id: user1._id,
      
    });
  
    await post1.save();

}

userSeedDB().then(() => {
    mongoose.connection.close();
})

// const postSeedDB = async() => {

  

// }

// postSeedDB().then(() => {
//   mongoose.connection.close();
// })