// import session from 'express-session';
// import { env } from "@/common/utils/envConfig";
// import { SessionOptions } from 'express-session';

// const sessionMiddleware = session({
//   secret: env.SESSION_SECRET,
//   resave: false,
//   saveUninitialized: false,
//   cookie: {
//     secure: false, // true nếu dùng HTTPS
//     httpOnly: true,
//     maxAge: 24 * 60 * 60 * 1000, // 1 ngày
//   },
// } as SessionOptions);

// export default sessionMiddleware;

import session, { SessionOptions } from 'express-session';
import { RequestHandler } from 'express';
import { env } from "@/common/utils/envConfig";

const sessionMiddleware: RequestHandler = session({
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // true nếu dùng HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 ngày
  },
} as SessionOptions);

export default sessionMiddleware;
