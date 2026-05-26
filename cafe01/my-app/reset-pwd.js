const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function reset() {
  await mongoose.connect('mongodb://localhost:27017/cafe');
  const hashed = await bcrypt.hash('password123', 12);
  await mongoose.connection.db.collection('users').updateOne(
    { email: 'prathameshkshirsagar116@gmail.com' },
    { $set: { password: hashed } }
  );
  console.log("Password reset for prathameshkshirsagar116@gmail.com to 'password123'");
  process.exit(0);
}

reset().catch(console.error);
