import 'dotenv/config';
import mongoose from 'mongoose';
import Media from '../models/media.js';

/* Mongoose connection */
mongoose.connect(`mongodb+srv://sheldon123:${process.env.MONGO_PASSWORD}@cluster0.ymemj0t.mongodb.net/mochaDB`);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error in establishing connection'));
db.once('open', ()=>{
    console.log("Database is connected");
});

const mediaSeedDB = async() => {
    
    
    const media1 = new Media({
        _id:  "b7684540-1a95-4574-b3c2-e65bc2441b68",
        type: 'image',
        name: '/images/profileImg/default-user-image.png'
      });

      const media2 = new Media({
        _id:  "44d0636e-7f2e-449d-b216-2ddb33a13f7b",
        type: 'image',
        name: "/images/BannerImg/blank-banner.jpg"
      });

      const media3 = new Media({
        _id:  "c79f3a10-e2b9-491b-9dc1-d15a9cfcb747",
        type: 'image',
        name: "/images/BannerImg/sea-edge-79ab30e2.png"
      });

      

    await media1.save();
    await media2.save();
    await media3.save();
    
}

mediaSeedDB().then(() => {
    mongoose.connection.close();
})
