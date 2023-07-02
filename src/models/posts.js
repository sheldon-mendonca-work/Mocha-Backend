import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    _id: {
        type: String,
        required: true
    },
    postDec: {
        type: String,
        default: ''
    },
    postImgLink: [{
        type: String,
        ref: 'Media'
    }],
    likedBy: [{
        type: String,
        ref: 'User'
    }],
    bookmarkBy: [{
        type: String,
        ref: 'User'
    }],
    commentsArray: [{
        type: String,
        ref: 'Post'
    }],
    parentPost: {
        type: String,
        ref: 'Post'
    },
    user_id: {
        type: String,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    editedAt: {
        type: Date,
        default: Date.now,
        required: true
    }
})

const Post = mongoose.model('Post', PostSchema);

export default Post;