require("dotenv").config();
const express = require("express");
const passport = require("passport");
const FacebookTokenStrategy = require("passport-facebook-token");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const connectToDatabase = require("./src/config/database");
const error = require("./src/middleware/error.js");
const indexRoute = require("./src/routes/index");

const app = express();

// Secure app by setting various HTTP headers
app.use(helmet());

// Connect to the database
connectToDatabase();

function isDevelopmentMode() {
  return process.env.NODE_ENV === "development";
}

const getCorsSettings = () => {
  const allowlist = ["https://cardom.netlify.app", "https://cardom.app"];

  /**
   * Origin: true => CORS is allowed
   * Origin: false => CORS is completely removed, and `Same-Origin-Policy` will be invoked.
   *
   * Reference: https://expressjs.com/en/resources/middleware/cors.html#:~:text=for%20all%20routes.-,Configuring%20CORS%20Asynchronously,-var%20express%20%3D
   */
  const corsOptionsDelegate = (req, callback) => {
    const corsOptions = { credentials: true };
    corsOptions.origin = allowlist.indexOf(req.header("Origin")) !== -1;
    callback(null, corsOptions);
  };

  // FE server will run on a different port in the development mode
  if (isDevelopmentMode()) {
    return {
      methods: ["GET", "POST", "DELETE", "UPDATE", "PUT", "PATCH", "OPTIONS"],
      credentials: true,
      origin: "http://localhost:3001",
    };
  }

  return corsOptionsDelegate;
};

// Set up middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors(getCorsSettings()));

function mongoDbUrl() {
  if (process.env.NODE_ENV === "development") {
    return process.env.DATABASE_TEST_URI;
  } else {
    return process.env.DATABASE_PROD_URI;
  }
}

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: mongoDbUrl(), // Ensure this environment variable is set
      ttl: 14 * 24 * 60 * 60, // = 14 days. Adjust the time-to-live for sessions as needed.
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Set up Facebook strategy
passport.use(
  new FacebookTokenStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  done(null, { id });
});

// Routes
app.use("/api", indexRoute);

app.get("*", (req, res) => {
  res.status(200).json({ message: "Welcome to cardom" });
});

// Error handling middleware
app.use(error);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
