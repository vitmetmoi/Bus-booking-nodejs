import express, { type Express } from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import path from "path";
import { pino } from "pino";

import { openAPIRouter } from "@/api-docs/openAPIRouter";

import { userRouter } from "@/api/user/userRouter";
import { stationRouter } from "@/api/station/stationRouter";
import { busCompanyRouter } from "@/api/busCompanies/busCompanyRouter";

import { authRouter } from "@/api/auth/authRouter";
import { routesRouter } from "./api/routes/routesRouter";
import { carRouter } from "@/api/car/carRouter";
import { seatRoter } from "./api/seat/seatRouter";
import { ticketRouter } from "@/api/ticket/ticketRouter";

import { chatbotRouter } from "@/api/chatbot/chatbotRouter";



import { vehicleScheduleRouter } from "./api/vehicleSchedule/vehicleSchedule.routes";
import errorHandler from "@/common/middleware/errorHandler";
import rateLimiter from "@/common/middleware/rateLimiter";
import requestLogger from "@/common/middleware/requestLogger";
import { env } from "@/common/utils/envConfig";

import '@/common/config/passport';
import session from 'express-session';
import passport from 'passport';
import sessionMiddleware from '@/common/middleware/sessionMiddleware';

const logger = pino({
    name: "server start",
    level: env.isProduction ? "info" : "debug",
    transport: env.isProduction ? undefined : { target: "pino-pretty" },
});
import cors from "cors";
const app: Express = express();



// Set the application to trust the reverse proxy
app.set("trust proxy", true);

// auth passport
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
// app.use(session({
//     secret: 'your_secret',
//     resave: false,
//     saveUninitialized: false
// }));

// app.use(passport.initialize());
// app.use(passport.session());

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001", "*"],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "http://localhost:*", "https:", "http://localhost:5000"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// Request logging
app.use(requestLogger);
// Ở file server.js hoặc app.js
// const cors = require('cors');



// Routes
app.use("/users", userRouter);
app.use("/bus-companies", busCompanyRouter);

app.use("/auth", authRouter);
app.use("/routes", routesRouter);
app.use("/stations", stationRouter);
app.use("/cars", carRouter);
app.use("/seats", seatRoter);
app.use("/tickets", ticketRouter);

app.use("/chatbot", chatbotRouter);




// Home route


app.use("/vehicle-schedules", vehicleScheduleRouter);

// Serve static files from public directory
// Use absolute path to ensure it works correctly
const publicPath = path.resolve(__dirname, "../src/public/uploads");

// Add CORS headers for static files
app.use("/uploads", (req, res, next) => {
    console.log('Static file request from origin:', req.headers.origin);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    next();
});

app.use("/uploads", express.static(publicPath));

// Swagger UI
app.use(openAPIRouter);

// Error handlers
app.use(errorHandler());


export { app, logger };