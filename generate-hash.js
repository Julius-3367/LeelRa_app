const bcrypt = require('bcryptjs');

bcrypt.hash('SuperAdmin@2026', 12)
  .then(hash => {
    console.log(hash);
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
