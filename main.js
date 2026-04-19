const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    title: 'CineGalaxy',
    // icon: path.join(__dirname, 'public/cinegalaxy_logo.png'), 
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    autoHideMenuBar: true,
    backgroundColor: '#000000',
  });

  // THE MAGIC AD-BLOCKER / POP-UP KILLER 🛡️
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Si intenta abrir un iframe (como anuncios de Videasy de PopUnder), DENEGAR
    return { action: 'deny' };
  });

  // Impedir que la ventana principal sea redirigida hacia sitios de anuncios por los Iframes
  mainWindow.webContents.on('will-navigate', (e, url) => {
    // Si la URL no es Vercel o Localhost, bloqueamos la navegación o la lanzamos al navegador
    if (!url.includes('localhost') && !url.includes('cine-galaxy.vercel.app')) {
      e.preventDefault();
    }
  });

  // MUY IMPORTANTE: ¡Cambia esta URL por la tuya real que te asigne Vercel!
  const startUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://cine-galaxy.vercel.app'; // <--- CAMBIA ESTO por tu dominio real
    
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
