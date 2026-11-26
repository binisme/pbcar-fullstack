# Database Layer — Firebase Firestore (ebike-c0a0b)

Hệ thống dùng chung trực tiếp cơ sở dữ liệu Firebase Firestore của dự án **`ebike-c0a0b`**:

## Cấu trúc Document & Collection
1. **Trạng thái 24 xe & cài đặt hệ thống**:
   - Đường dẫn: `artifacts/ebike-c0a0b/public/data/park_state/main`
   - Trường dữ liệu:
     - `dateStr`: ngày hiện tại dạng `DD/MM/YYYY` (giờ Việt Nam)
     - `dailyResetAt`: mốc reset thủ công bộ đếm thẻ (`number | null`)
     - `vehicles`: danh sách 24 xe (`Xe01`–`Xe24`) và trạng thái hiện tại
     - `settings`: `{ soundEnabled, voiceEnabled, testMode }`

2. **Lịch sử lượt chạy & doanh thu vĩnh viễn**:
   - Đường dẫn: `artifacts/ebike-c0a0b/public/data/park_history/{historyId}`
   - Trường dữ liệu: `id, dateStr, vehicleId, vehicleName, packageMinutes, totalMinutes, extensions[], packageLabel, price, startTime, endTime, status, isTest`
   - Các bản ghi có `isTest: true` tự động bị loại khỏi doanh thu và bộ đếm lượt.
