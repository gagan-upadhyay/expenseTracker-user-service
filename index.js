import express from 'express';
import cors from 'cors';
import '@dotenvx/dotenvx/config';
import { logger } from './config/logger.js';
import compression from 'compression';
import userRouter from './src/router/user-Service-Router.js';
import cookieParser from 'cookie-parser';
// import sessionMiddleware from './middleware/sessionMiddleware.js';
import { helmetConfig } from './config/helmet.config.js';
import setupGracefulShutDown from './utils/setupGracefulShutdown.js';
import {getRedisClient} from './config/redisConnection.js';
import { pool } from './config/db.js';
import { setupHealthCheckUp } from './utils/setupHealthcheckUp.js';

const app = express();
const corsOptions={
    origin:[
        'http://192.168.0.126:3000', 
        'https://expense-tracker-git-newbranch-gagans-projects-00cb1a77.vercel.app',
        'http://localhost:3000', 
        'https://expense-tracker-self-rho-12.vercel.app', 
        'https://expense-tracker-gagans-projects-00cb1a77.vercel.app',
        ],
    credentials:true
}
app.use(cors(corsOptions));
app.use(express.json());
app.use(compression());
app.use(cookieParser());
app.use(helmetConfig);

// app.use(sessionMiddleware);
app.get('/', (req, res)=>{
    return res.status(200).json({message:"Welcome to the User-service"});
});

setupHealthCheckUp(app);
app.use('/api/v1/user',userRouter);


let server = null 
if(process.env.NODE_ENV!=="test"){
     server = app.listen(process.env.USER_SERVICE_PORT || 5001, "0.0.0.0", () => {
        logger.info(`User service running on ${process.env.USER_SERVICE_PORT}`);
    });

    setupGracefulShutDown(server, [
        async()=>await getRedisClient.disconnect(),
        async()=>await pool.end()
    ]);
}
export {app, server};