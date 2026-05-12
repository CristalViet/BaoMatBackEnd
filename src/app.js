const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();

// 🔐 Security
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// 🌐 CORS (FIX LỖI)
const allowedOrigins = [
  "https://hitocore.dangcongnhat.id.vn",
  "https://dccp5rk9n3xjo.cloudfront.net"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS blocked: " + origin));
      }
    },
    credentials: true,
  })
);

// 📝 Logger
app.use(morgan("dev"));

// 📦 Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ❤️ HEALTH CHECK
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

// 🚀 API routes
app.use("/api", routes);

// ❌ Not found
app.use(notFoundHandler);

// ❗ Error handler
app.use(errorHandler);

module.exports = app;
