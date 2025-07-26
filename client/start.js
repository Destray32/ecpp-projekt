require('dotenv').config();
const { execSync } = require('child_process');

console.log('[+] Automatyczne startowanie aplikacji...\n sprawdź co masz w pliku .env (`NODE_ENV`)');

if (process.env.NODE_ENV === 'production') {
  execSync('npm run start:prod', { stdio: 'inherit' });
} else {
  execSync('npm run start:dev', { stdio: 'inherit' });
}