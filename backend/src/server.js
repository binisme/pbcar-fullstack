import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { ENV } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { initFirebaseStore, subscribeStoreChange } from './services/parkStore.js';
import { getPublicState, processBackgroundTick } from './services/vehicleService.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: ENV.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  },
});

app.use(cors({ origin: ENV.CORS_ORIGIN }));
app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use('/api', apiRoutes);
app.use(errorHandler);

// Đồng bộ ngược khi dữ liệu Firebase thay đổi từ máy khác
subscribeStoreChange(() => {
  io.emit('park:update', getPublicState());
});

io.on('connection', (socket) => {
  socket.emit('park:update', getPublicState());
});

// Vòng lặp 1 giây tại Server: tự chuyển xe hết giờ & tự reset 00:00 giờ VN
setInterval(async () => {
  try {
    const changed = await processBackgroundTick();
    if (changed) {
      io.emit('park:update', getPublicState());
    }
  } catch (err) {
    console.error('Lỗi Server Ticker:', err.message);
  }
}, 1000);

async function bootstrap() {
  await initFirebaseStore();
  server.listen(ENV.PORT, '0.0.0.0', () => {
    console.log(`🚀 PBCAR Backend đang chạy tại http://localhost:${ENV.PORT}`);
  });
}

bootstrap();
