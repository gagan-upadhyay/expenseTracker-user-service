import express from 'express';
import cors from 'cors';
import '@dotenvx/dotenvx/config';
import { logger } from './config/logger.js';
import compression from 'compression';
import userRouter from './src/router/user-Service-Router.js';
import cookieParser from 'cookie-parser';
import sessionMiddleware from './middleware/sessionMiddleware.js';
import { helmetConfig } from './config/helmet.config.js';
import setupGracefulShutDown from './utils/setupGracefulShutdown.js';
import {getRedisClient} from './config/redisConnection.js';
import { pool } from './config/db.js';
import { setupHealthCheckUp } from './utils/setupHealthcheckUp.js';

const app = express();

app.use(express.json());
app.use(compression());
app.use(cookieParser());

// const corsOptions={
//     origin:['http://localhost:3000', 'https://expense-tracker-self-rho-12.vercel.app/', 'http://192.168.0.148:3000'],
//     credentials:true
// }
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000', 'https://expense-tracker-6afeksr0j-gagans-projects-00cb1a77.vercel.app', 'http://172.168.0.148:3000', 'https://expense-tracker-self-rho-12.vercel.app'
    ];
    const ipRegex = /^http:\/\/192\.168\.0\.\d{1,3}:3000$/;
    if (!origin || allowedOrigins.includes(origin) || ipRegex.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
// const corsOptions = {
//   origin: function (origin, callback) {
//     const allowedOrigins = [
//       'http://localhost:3000',
//       'https://expense-tracker-6afeksr0j-gagans-projects-00cb1a77.vercel.app'
//     ];
//     const ipRegex = /^http:\/\/192\.168\.0\.\d{1,3}:3000$/;
//     if (!origin || allowedOrigins.includes(origin) || ipRegex.test(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true
// };
app.use(cors(corsOptions));

app.use(helmetConfig);

// app.use(sessionMiddleware);
app.get('/', (req, res)=>{
    return res.status(200).json({message:"Welcome to the User-service"});
});

setupHealthCheckUp(app);
app.use('/api/v1/user',userRouter);



const server = app.listen(process.env.USER_SERVICE_PORT, ()=>{
    logger.info(`user-service is running on port ${process.env.USER_SERVICE_PORT}`);
})

setupGracefulShutDown(server, [
    async()=>getRedisClient.disconnect(),
    async()=> pool.end(),
])

export default app;