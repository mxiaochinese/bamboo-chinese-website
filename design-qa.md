# Design QA — Bamboo Chinese course detail

## Reference and implementation

- Visual reference: https://mxiao.edu.vn/khoa-hoc/so-cap-0-hsk3
- Bamboo implementation: http://localhost:4173/lo-trinh/yct-1/
- Desktop review viewport: 1280 × 720 CSS px
- Mobile review viewport: 390 × 844 CSS px
- Review states: page top, course overview, curriculum, expanded FAQ, mobile stacked layout

## Visual comparison

The Bamboo implementation follows the reference page's information architecture and visual rhythm: breadcrumb and two-column course hero, prominent textbook artwork, compact overview dashboard, a sticky tuition/materials panel on desktop, continuous curriculum rows, teaching-method section, FAQ, teachers, and consultation form.

Intentional differences:

- Bamboo green/orange palette, logo, copy, YCT book artwork, and Gilroy typography replace MXiao branding.
- The curriculum is a flat ordered list of sessions, matching the user's explicit instruction to remove the separate “mốc” classification.
- MXiao-specific testimonial or student-ranking content is not copied where it does not fit Bamboo's current content.
- All images are local Bamboo assets; the implementation does not hotlink MXiao assets.

## Checks performed

- Desktop and mobile full-page structure compared against the reference.
- Hero, overview, tuition card, curriculum rows, FAQ, teacher strip, and form inspected as focused regions.
- Course-list link to YCT1 verified.
- FAQ expansion verified.
- Mobile horizontal overflow: none at 390 px.
- Console warnings/errors: none.
- Tuition copy verified as list price plus final discounted tuition; no “Giảm 500.000đ” label remains.
- YCT1 curriculum verified at 28 sessions; YCT6 verified through session 35.

## Iteration history

1. Replaced the earlier generic detail layout with the MXiao-inspired two-column course architecture.
2. Replaced grouped curriculum accordions with a single ordered session list.
3. Moved the mobile tuition card directly below course information so pricing is not buried after the curriculum.
4. Tightened responsive spacing and removed horizontal overflow.

## Result

Passed. No P0, P1, or P2 issues remain. The full-width Chinese parentheses retained in lesson titles are source-content typography and are non-blocking.

---

# Design QA — Bamboo Chinese contact page

## Reference and implementation

- Visual reference: https://mxiao.edu.vn/lien-he
- Bamboo implementation: http://localhost:4173/lien-he/
- Desktop review viewport: 1280 × 720 CSS px
- Mobile review viewport: 390 × 844 CSS px
- Review states: page top, channel cards, consultation form, expanded FAQ, mobile stacked layout

## Visual comparison

The Bamboo implementation follows the reference page's complete information architecture: contact hero, official contact channels, two-column desktop layout, consultation form, and three-question FAQ. On mobile the channel cards, form, and FAQ stack in the same reading order as the MXiao reference.

Intentional differences:

- Bamboo branding, green/orange palette, Gilroy typography, logo, and child-focused wording replace MXiao page branding.
- MXiao's shared hotline, email, addresses, Messenger, and TikTok channels are preserved exactly because both websites use the same support operation.
- The existing Bamboo lead endpoint is retained so the contact form follows the site's shared Bamboo/MXiao data flow.

## Checks performed

- Desktop and mobile layout compared against the reference.
- All six official contact channels verified in the rendered page.
- Required name and phone fields, optional email, learning-needs fields, and submit button verified.
- FAQ expansion verified for multiple questions.
- Mobile horizontal overflow: none at 390 px.
- Contact links use telephone, email, Messenger, and TikTok destinations from the reference.
- JavaScript syntax and whitespace checks passed.

## Result

Passed. No P0, P1, or P2 visual or interaction issues remain.

---

# Design QA — Bamboo Chinese homepage hero

## Source and implementation

- Source asset: `dist/assets/brand/cover.jpg` (3281 × 1441, panoramic ratio 2.28:1)
- Implementation: http://localhost:4173/
- Desktop review viewport: 1280 × 720 CSS px
- Mobile review viewport: 390 × 844 CSS px

## Changes verified

- The full promotional artwork is visible with no left, right, top, or bottom crop.
- The overlaid YCT card that previously obscured the artwork has been removed.
- The copy and calls to action remain in a separate column.
- The four benefit points and MXiao credit form one compact row below the hero.
- On mobile the artwork keeps its original aspect ratio and the action buttons stack without horizontal overflow.
- Browser console warnings/errors: none.

## Result

final result: passed

---

# Design QA — Rà soát câu chữ tiếng Việt

## Phạm vi

- Trang chủ, lộ trình, 6 trang khóa học, phương pháp học, tiến bộ của con, liên hệ, giới thiệu, góc phụ huynh, bài viết, danh sách giáo viên và 14 trang thông tin giáo viên.
- 32 đường dẫn hợp lệ trong bản dựng hiện tại.

## Nội dung đã chuẩn hóa

- Loại bỏ các cụm rút gọn khó hiểu như “Hồ sơ rõ” và “Rõ tiến độ”.
- Thay các câu mang giọng dịch hoặc thuật ngữ nội bộ như “một đường đi”, “đầu vào, đầu ra”, “có cấu trúc”.
- Thay từ tiếng Anh không cần thiết trong nội dung hiển thị: “form”, “online”, “hotline”, “email”.
- Biên tập lại toàn bộ dữ liệu giáo viên: “6+ năm”, “đa trình độ”, “thực chiến”, “giao tiếp thật”, “truyền đạt logic” và các cụm tương tự.
- Giữ nguyên tên riêng, chứng chỉ, cấp độ YCT và tên các nền tảng mạng xã hội.

## Kiểm tra

- Quét tự động 32 trang: không còn cụm từ thuộc danh sách cần loại bỏ.
- Kiểm tra bố cục ở chiều rộng 390 px: không phát hiện tràn ngang sau khi câu chữ dài hơn.
- JavaScript, JSON và kiểm tra khoảng trắng đều đạt.

## Result

final result: passed

---

# Design QA — Cân dòng tiêu đề toàn website

## Phạm vi

- 32 đường dẫn: trang chủ, các trang nội dung, danh sách và hồ sơ giáo viên, trang lộ trình và 6 trang YCT.
- Ba kích thước kiểm tra: desktop 1440 px, tablet 810 px, mobile 390 px.
- Tổng cộng 96 lượt kiểm tra responsive.

## Thay đổi và kết quả

- Áp dụng `text-wrap: balance` cho toàn bộ tiêu đề từ H1 đến H4 để tránh một từ bị tách riêng ở dòng cuối.
- Áp dụng `text-wrap: pretty` cho đoạn văn để hạn chế các dòng kết thúc quá ngắn.
- Tiêu đề “Hiểu người đồng hành cùng con.” đã được cân lại thành hai dòng đều trên desktop và mobile.
- Không phát hiện tràn ngang ở các trang hợp lệ tại cả ba kích thước.
- Các nhãn YCT1–YCT6 là tiêu đề một từ, chủ động hiển thị trên một dòng nên không thuộc lỗi dòng mồ côi.
- Trang `/lich-khai-giang` đã được bổ sung vào bản dựng và kiểm tra ở cả desktop lẫn mobile.

## Result

final result: passed
