# [Mocha](https://mocha-sheldon.netlify.app/)
## [Back-end](https://sheldon-mocha-backend.netlify.app/)
This is the back-end for the social media app: Mocha.
This app has been designed using [React(front-end)](https://github.com/sheldon-mendonca-work/Mocha-frontend), express(middleware and backend) and MongoDB Atlas.
The functionality of this app is inspired by Twitter.

## Tech Stack
- Authentication via JWT
- Moongoose. [Click for models](https://github.com/sheldon-mendonca-work/Mocha-Backend/tree/main/src/models)
- Upload and delete media functionality via cloudinary
- Express server deployed on Netlify.
- MongoDB database.
- CORS handling.
- Netlify functions.

## Features
- Routing certain paths based on user authentication. Headers from request are used with JWT decoding.
- Mongoose ODM including foreign references for posts, images. Populate and selection of required data is done as per requirements.
- Create/edit a user. Default profile and banner images if not entered. Set token as per JWT encoding.
- Follow/Unfollow functionality by updating current user as well as following user.
- Like/Bookmark post by updating post as well as the user details.
- Show list of all likes/bookmarks for a post.
- Add post and set up media based on received cloudinary data.
- Add a comment in form of post. Link comment to parent post if needed.
- Add/edit media and upload/destroy from cloudinary.
- Get all posts from a user.
- Handle deleting a post. Includes updating all likes, bookmarks, parent post, comment post and user details.
- Delete a user. Includes deleting all posts, likes, bookmarks and media automatically. Also update followers, following for other users correspondingly
- Handle search functionality by searching for username or displayName.
