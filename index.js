import express from 'express';
import cors from 'cors';
import '@dotenvx/dotenvx/config';
import { logger } from './config/logger.js';
import compression from 'compression';
import userRouter from './src/router/user-Service-Router.js';
import cookieParser from 'cookie-parser';
import sessionMiddleware from './middleware/sessionMiddleware.js';
import { helmetConfig } from './config/helmet.config.js';

const app = express();

app.use(express.json());
app.use(compression());
app.use(cookieParser());
const corsOptions = {origin:['http://localhost:3000', 'https://expense-tracker-6afeksr0j-gagans-projects-00cb1a77.vercel.app','http://192.168.0.105:3000'], credentials:true};
app.use(cors(corsOptions));
app.use(helmetConfig);

// app.use(sessionMiddleware);
app.get('/', (req, res)=>{
    return res.status(200).json({message:"Welcome to the User-service"});
});

app.use('/api/v1/user',userRouter);


app.listen(process.env.USER_SERVICE_PORT, ()=>{
    logger.info(`user-service is running on port ${process.env.USER_SERVICE_PORT}`)
})