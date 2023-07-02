import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    _id: {
        type: String,
        required: true
      },
    displayName: {
        type: String,
        required: true
      },
    username: {
        type: String,
        required: true,
        unique: true
      },
    email: {
      type: String,
      
    },
    userPassword: {
      type: String,
      
    },
    phNo: {
      type: String,
      
    },
    dateOfBirth: Date,
    bio: String,
    profileImg: {
      type: String,
      ref: 'Media',
      default: 'b7684540-1a95-4574-b3c2-e65bc2441b68'
    },
    bannerImg: {
      type: String,
      ref: 'Media',
      default: "44d0636e-7f2e-449d-b216-2ddb33a13f7b"
    }
    , 
    backImgLink: {
      type: String,
      ref: 'Media',
      default: "2317c324-72de-4351-ba82-56d6dcb2b2cf"
    },
    createdAt: {
      type: Date,
      default: Date.now
      },
    loginAt: {
      type: Date,
      default: Date.now,
    },
    bookmarks: [{
      type: String,
      ref: 'Post'
    }],
    posts: [{
      type: String,
      ref: 'Post'
    }],
    likes: [{
      type: String,
      ref: 'Post'
    }],
    followers: [{
        type: String,
        ref: 'User'
      }],
    following: [{
        type: String,
        ref: 'User'
      }],
    token: String
  })

  
const User = mongoose.model('User', UserSchema);

export default User;