import { exec } from 'node:child_process';
import waitOn from 'wait-on';

const urls = [
  'http://localhost:5001/api/health',
  'http://localhost:5173/admin/',
  'http://localhost:3000',
];

waitOn({
  resources: urls,
  timeout: 180000,
  interval: 500,
  validateStatus: (status) => status >= 200 && status < 400,
})
  .then(() => {
    const openCmd =
      process.platform === 'darwin'
        ? 'open'
        : process.platform === 'win32'
          ? 'start'
          : 'xdg-open';

    exec(`${openCmd} http://localhost:3000 http://localhost:5173/admin/`);
    console.log('Opened http://localhost:3000 and http://localhost:5173/admin/');
  })
  .catch((error) => {
    console.warn('Could not open dev URLs automatically:', error.message);
    console.warn('Open manually: http://localhost:3000 and http://localhost:5173/admin/');
  });
