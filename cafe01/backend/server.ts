import app from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 Standalone Cafe Express Server is active!`);
  console.log(`🌐 Port: ${env.port}`);
  console.log(`🔗 Health Check: http://localhost:${env.port}/api/status`);
  console.log(`======================================================\n`);
});
