const app = require("./app");
const env = require("./config/env");
const prisma = require("./lib/prisma");

async function start() {
  try {
    await prisma.$connect();
    app.listen(env.port, () => {
      console.log(`Server is running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

start();
