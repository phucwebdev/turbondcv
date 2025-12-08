<div align="center">
   <!-- Logo nội bộ -->
   <h1 style="margin-top:12px; font-size:2.4rem; font-weight:800; letter-spacing:-1px; background:linear-gradient(135deg,#FF6A00,#CC4F00); -webkit-background-clip:text; color:transparent;">TutorBond CV Screener</h1>
</div>

# Giới thiệu

Ứng dụng nội bộ hỗ trợ **upload và lọc CV gia sư** (tóm tắt thông tin + bộ lọc khu vực/môn/giá). Phần phân tích AI là tùy chọn – có thể bật/tắt.

## Chức năng chính (tối giản)

- Upload file CV (PDF) và trích xuất thông tin cơ bản.
- Bộ lọc: môn học, mức giá theo giờ, khu vực.
- (Roadmap) Xuất danh sách gia sư đã lọc (CSV).

## Kiến trúc

- React + Vite (frontend).
- Module phân tích CV (tuỳ chọn) trong `services/geminiService.ts` – có thể thay thế hoặc vô hiệu nếu không dùng AI.
- Kiểu dữ liệu: `types.ts`; hằng số: `constants.ts`.

## Chuẩn bị môi trường

Yêu cầu: Node.js >= 18

1. Cài đặt dependencies:
   ```bash
   npm install
   ```
2. (Tuỳ chọn nếu bật phân tích AI) tạo file `.env.local` và thêm khóa API phù hợp:
   ```bash
   API_KEY=YOUR_AI_KEY
   ```
3. Chạy chế độ development:
   ```bash
   npm run dev
   ```
4. Mở trình duyệt tại địa chỉ hiển thị (VD: http://localhost:3000 hoặc 3001).

## Cấu trúc thư mục chính

```
tutorbond-cv-screener/
  App.tsx              // Root layout
  components/          // Các thành phần UI (Badge, FilterBar, TutorList,...)
   services/geminiService.ts // Phân tích & chuẩn hoá dữ liệu CV (tuỳ chọn AI)
  types.ts             // Interface và kiểu dữ liệu
  constants.ts         // Danh sách môn học, cấu hình mặc định
```


