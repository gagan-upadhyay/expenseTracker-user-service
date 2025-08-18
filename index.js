import express from 'express';
import cors from 'cors';
import '@dotenvx/dotenvx/config';
import { logger } from '../auth-service/config/logger.js';
import compression from 'compression';
import helmet from 'helmet';
import userRouter from './src/router/user-Service-Router.js';
import cookieParser from 'cookie-parser';

const app = express();

app.use(compression());
app.use(cookieParser());
const corsOptions = {origin:['http://localhost:3000', 'https://expense-tracker-self-rho-12.vercel.app'], credentials:true};
app.use(cors(corsOptions));
app.use(helmet());

app.get('/', (req, res)=>{
    return res.status(200).json({message:"Welcome to the User-service"});
});

app.use('/api/v1/user',userRouter);



app.listen(process.env.USER_SERVICE_PORT, ()=>{
    logger.info(`user-service is running on port ${process.env.USER_SERVICE_PORT}`)
})