# Design QA — Bamboo Chinese, phương án 1

## Phạm vi so sánh

- Nguồn thiết kế đã chọn: `/Users/hoeng/.codex/generated_images/01a0bf89-cfe5-7932-af35-369ad6c1ed99/exec-27a7df1f-c431-4a15-8711-d3363d56e73f.png`
- Bản triển khai: `http://localhost:4173/`
- Viewport đã kiểm tra trực quan: desktop 1440 × 1000, tablet mặc định của Codex Browser và mobile 390 × 844.

## Đối chiếu thiết kế

- Giữ đúng cấu trúc chính của phương án 1: header gọn, hero tương phản mạnh, kệ YCT1–YCT6, dải phương pháp học, đội ngũ giáo viên, cụm kỹ năng và CTA cuối trang.
- Dùng ảnh thật do người dùng cung cấp cho hero và đủ sáu giáo trình; không dùng placeholder cho các nội dung này.
- Dùng 14 ảnh và hồ sơ giáo viên từ nguồn MXiao trong trang danh sách và trang chi tiết.
- Tăng độ tương phản bằng chữ xanh đậm trên nền sáng, section phương pháp xanh đậm/chữ trắng và CTA cam nổi bật.
- Font nội dung dùng Gilroy Medium; tiêu đề tăng kích thước và trọng lượng để rõ thứ bậc.
- Khoảng cách section được rút xuống 46–62 px; các nội dung liên quan được ghép thành dải liên tục thay vì nhiều box rời.
- Icon dùng Font Awesome; chuyển động gồm sách nổi nhẹ, hover nâng card và zoom ảnh giáo viên, có hỗ trợ `prefers-reduced-motion`.
- Mobile dùng kệ sách và dải giáo viên cuộn ngang có điểm dừng; menu khóa học mở thành danh sách YCT1–YCT6.

## Kiểm tra chức năng và nội dung

- Navigation có Trang chủ, Khóa học, Phương pháp học, Đội ngũ giáo viên, Tiến bộ của con và Liên hệ; đã bỏ Góc phụ huynh khỏi navigation chính.
- Học phí hiển thị đúng nguồn đã chốt: YCT1–2 là 6.500.000đ, YCT3–4 là 7.000.000đ, YCT5–6 là 9.500.000đ; tất cả ghi rõ Giảm 500.000đ.
- 6 JSON khóa học, 6 ảnh sách, 14 hồ sơ và 14 ảnh giáo viên đều đọc được.
- Các route trang chủ, lộ trình, YCT1, giáo viên, hồ sơ giáo viên và form tìm lớp đều trả HTTP 200.
- Menu mobile, điều hướng SPA, trang hồ sơ giáo viên và accordion curriculum hoạt động.
- Console trình duyệt: không có error hoặc warning.

## Kết luận

final result: passed
