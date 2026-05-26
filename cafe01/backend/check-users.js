const mongoose = require('mongoose');

async function check() {
  await mongoose.connect('mongodb://localhost:27017/cafe');
  const users = await mongoose.connection.db.collection('users').find({}).toArray();
  console.log("USERS IN DB:");
  users.forEach(u => console.log(`- ${u.email} (has password: ${!!u.password})`));
  process.exit(0);
}

check().catch(console.error);
