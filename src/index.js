import dotenv from 'dotenv';
import express, { Router } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import serverless from 'serverless-http';
import path from 'path';

import { router as authRoutes }  from './routes/auth.js';
import { router as postRoutes }  from './routes/posts.js';
import { router as userRoutes }  from './routes/users.js';


import './models/media.js';
import './models/users.js';
import './models/posts.js';

/* Mongoose connection */
dotenv.config({path: path.join(path.resolve(), '../.env')})

mongoose.connect(`mongodb+srv://sheldonmendonca1012:${process.env.MONGO_PASSWORD}@cluster0.q7vle77.mongodb.net/mochaDB`);
// mongoose.connect(`mongodb://127.0.0.1:27017/mochaDB`);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error in establishing connection'));
db.once('open', ()=>{
    console.log("Database is connected");
});

/* app initialization */
const app = express();
const port = 3001;

/* Express Routing */
app.use(cors());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
const router = Router();

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);

app.use('/.netlify/functions/index', router)

router.get('/', (req, res) => {
    res.json({"Hello": "HEllo"});
});

router.get('/api', (req, res) => {
    res.json({"api": "api"});
})

export const handler = serverless(app);