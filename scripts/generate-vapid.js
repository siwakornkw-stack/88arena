const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
console.log('\nVAPID Keys generated! Add these to your .env:\n');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log('\nAlso update sw.js if you change the public key.\n');
