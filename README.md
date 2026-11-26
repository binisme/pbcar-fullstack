# Hệ Thống Quản Lý Xe Điện Công Viên — PBCAR Fullstack

Kiến trúc tách biệt rõ ràng 3 tầng:
- **Database (`/database`)**: Kết nối trực tiếp **Firebase Firestore (`ebike-c0a0b`)** — giữ nguyên dữ liệu cũ và dùng chung được với ứng dụng hiện tại.
- **Backend (`/backend`)**: **Node.js + Express (JavaScript ESM) + Socket.IO** — xử lý toàn bộ nghiệp vụ, đồng bộ thời gian thực, tự động báo hết giờ & tự reset bộ đếm `Today` về `0` lúc `00:00` giờ Việt Nam.
- **Frontend (`/frontend`)**: **React 18 + TypeScript + Vite + Tailwind CSS** — tối ưu iPhone PWA, chuông + giọng đọc tiếng Việt chuẩn (`"xe 1 đã hết giờ"`).

## Cây thư mục hệ thống
```text
pbcar-park-fullstack/
├── database/
│   ├── firestore.rules
│   └── README.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── config/
│       │   ├── env.js
│       │   └── firebase.js
│       ├── utils/
│       │   └── dateHelper.js
│       ├── services/
│       │   ├── parkStore.js
│       │   ├── vehicleService.js
│       │   └── reportService.js
│       ├── controllers/
│       │   ├── vehicleController.js
│       │   ├── reportController.js
│       │   └── settingsController.js
│       ├── routes/
│       │   └── index.js
│       ├── middlewares/
│       │   └── errorHandler.js
│       └── server.js
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    ├── index.html
    └── src/
        ├── types/index.ts
        ├── utils/
        │   ├── format.ts
        │   └── audio.ts
        ├── services/api.ts
        ├── hooks/useParkSystem.ts
        ├── components/
        │   ├── Header.tsx
        │   ├── VehicleCard.tsx
        │   ├── PackageModal.tsx
        │   ├── RunningActionModal.tsx
        │   ├── ReportView.tsx
        │   ├── HistoryView.tsx
        │   ├── VehiclesManageView.tsx
        │   ├── SettingsView.tsx
        │   └── BottomNav.tsx
        ├── App.tsx
        ├── main.tsx
        └── index.css
```

## Chạy trên máy tính (2 Terminal)

### Terminal 1 — Backend (Cổng 4000)
```bash
cd backend
npm install
npm run dev
```

### Terminal 2 — Frontend (Cổng 5173)
```bash
cd frontend
npm install
npm run dev
```

## Deploy lên mạng để mở trên iPhone (4G/5G mọi nơi)
1. **Backend lên Render.com**:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
2. **Frontend lên Vercel.com**:
   - Root Directory: `frontend`
   - Environment Variable: `VITE_API_URL=https://<ten-backend-cua-ban>.onrender.com`
3. Mở link Vercel bằng **Safari trên iPhone** → **Chia sẻ** → **Thêm vào Màn hình chính**.
