// scripts/vite-https.cjs
const { createServer } = require('vite');
const fs = require('fs');
const path = require('path');

(async () => {
  const vite = await createServer({
    server: {
      https: {
        key: fs.readFileSync(
          path.resolve(__dirname, '../ssl/localhost-key.pem')
        ),
        cert: fs.readFileSync(
          path.resolve(__dirname, '../ssl/localhost.pem')
        ),
      },
      host: 'localhost',
      port: 3000,
    },
  });
  await vite.listen();
  console.log('🚀 Dev server running at https://localhost:3000');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
