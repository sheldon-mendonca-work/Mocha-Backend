import dotenv from 'dotenv';
import express, { Router } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import serverless from 'serverless-http';
import path from 'path';

import { router as authRoutes }  from '../../src/routes/auth.js';
import { router as postRoutes }  from '../../src/routes/posts.js';
import { router as userRoutes }  from '../../src/routes/users.js';


import '../../src/models/media.js';
import '../../src/models/users.js';
import '../../src/models/posts.js';

/* Mongoose connection */
dotenv.config({path: path.join(path.resolve(), '../../.env')});

mongoose.connect(`mongodb+srv://sheldonmendonca1012:${process.env.MONGO_PASSWORD}@cluster0.q7vle77.mongodb.net/mochaDB`);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error in establishing connection'));
db.once('open', ()=>{
    console.log("Database is connected");
});

/* app initialization */
const app = express();
const port = 3001;
/* Express Routing */
const allowCrossDomain = (req, res, next) => {
    res.header(`Access-Control-Allow-Origin`, `*`);
    res.header(`Access-Control-Allow-Methods`, `GET,PUT,POST,DELETE`);
    res.header(`Access-Control-Allow-Headers`, `Content-Type`);
    next();
  };
app.use(cors({
    origin: "http://localhost:3000",
    methods: ['GET', 'PUT', "DELETE", "POST"],
    credentials: true
}));
app.use(allowCrossDomain)
const router = Router();


// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/users", userRoutes);
app.use('/', router)

router.get('/', (req, res) => {
    res.json({"Hello": "Hello"});
});

router.get('*', (req, res) => {
    res.send("PAGE NOT FOUND");
})


export const handler = serverless(app);