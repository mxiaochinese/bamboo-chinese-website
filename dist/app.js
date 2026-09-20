const COURSE_FILES = [1, 2, 3, 4, 5, 6].map((level) => `/data/yct-${level}.json`);
const NAV_ITEMS = [
  ["Lộ trình học", "/lo-trinh"],
  ["Cách Bamboo dạy", "/cach-bamboo-day"],
  ["Tiến bộ của con", "/tien-bo-cua-con"],
  ["Giáo viên", "/giao-vien"],
  ["Góc phụ huynh", "/goc-phu-huynh"],
  ["Bài viết", "/bai-viet"],
];

const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
}[character]));

const formatPrice = (value) => `${Number(value).toLocaleString("vi-VN")}đ`;
const typeLabel = { lesson: "Buổi học", review: "Ôn tập", assessment: "Đánh giá" };
const levelPath = (level) => `/lo-trinh/yct-${level}`;
const courseImage = (level, kind = "journey") => `/assets/courses/yct-${level}-${kind}.jpg`;

let courses = [];

function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path || "/";
}

function link(label, href, className = "") {
  return `<a class="${className}" href="${href}">${escapeHTML(label)}</a>`;
}

function icon(name, size = 20) {
  const paths = {
    arrow: `<path d="M4 12h15M13 6l6 6-6 6"/>`,
    menu: `<path d="M4 7h16M4 12h16M4 17h16"/>`,
    close: `<path d="m6 6 12 12M18 6 6 18"/>`,
    check: `<path d="m5 12 4 4L19 6"/>`,
    leaf: `<path d="M19 4C10 4 5 8 5 15c0 3 2 5 5 5 7 0 9-7 9-16Z"/><path d="M5 20c3-5 6-8 12-11"/>`,
    plus: `<path d="M12 5v14M5 12h14"/>`,
  };
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name] || paths.arrow}</svg>`;
}

function header() {
  const path = currentPath();
  const isActive = (href) => path === href || (href !== "/" && path.startsWith(`${href}/`));
  const navLinks = NAV_ITEMS.map(([label, href]) => link(label, href, `nav-link${isActive(href) ? " active" : ""}`)).join("");
  return `
    <header class="site-header">
      <div class="container nav-shell">
        <a class="brand" href="/" aria-label="Bamboo Chinese, về trang chủ"><img class="brand-logo" src="/assets/brand/logo-color.png" alt="Bamboo Chinese"><span class="brand-by">by MXiao Chinese</span></a>
        <nav class="desktop-nav" aria-label="Điều hướng chính">${navLinks}</nav>
        ${link("Tìm lớp cho con", "/tim-lop-cho-con", "button primary small")}
        <button class="mobile-toggle" type="button" aria-label="Mở menu" aria-expanded="false" data-menu-toggle>${icon("menu", 25)}</button>
      </div>
      <div class="mobile-nav" data-mobile-nav>
        <div class="container mobile-nav-links" aria-label="Điều hướng di động">${navLinks}${link("Tìm lớp cho con", "/tim-lop-cho-con", "button primary full")}</div>
      </div>
    </header>`;
}

function footer() {
  return `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <a class="brand" href="/" aria-label="Bamboo Chinese, về trang chủ"><img class="brand-logo" src="/assets/brand/logo-white.png" alt="Bamboo Chinese"><span class="brand-by">by MXiao Chinese</span></a>
            <p>Tiếng Trung dành riêng cho trẻ 6-12 tuổi, với một hành trình học rõ ràng từ YCT1 đến YCT6.</p>
          </div>
          <div><p class="footer-title">Khám phá</p><div class="footer-links">${link("Lộ trình học", "/lo-trinh")}${link("Cách Bamboo dạy", "/cach-bamboo-day")}${link("Tiến bộ của con", "/tien-bo-cua-con")}</div></div>
          <div><p class="footer-title">Đồng hành</p><div class="footer-links">${link("Góc phụ huynh", "/goc-phu-huynh")}${link("Bài viết", "/bai-viet")}${link("Giáo viên", "/giao-vien")}</div></div>
          <div><p class="footer-title">Bắt đầu</p><div class="footer-links">${link("Tìm lớp cho con", "/tim-lop-cho-con")}${link("Liên hệ", "/lien-he")}${link("Về Bamboo", "/ve-bamboo")}</div></div>
        </div>
        <div class="footer-bottom"><span>© Bamboo Chinese</span><span>Phát triển bởi MXiao Chinese</span></div>
      </div>
    </footer>`;
}

function shell(content) {
  return `${header()}<main id="main-content">${content}</main>${footer()}`;
}

function pageHero(eyebrow, title, description, symbol = "竹") {
  return `<section class="page-hero"><div class="container page-hero-grid"><div class="page-hero-copy"><div class="breadcrumb">${link("Trang chủ", "/")}<span>/</span><span>${escapeHTML(title)}</span></div><p class="eyebrow">${escapeHTML(eyebrow)}</p><h1>${escapeHTML(title)}</h1><p class="lede">${escapeHTML(description)}</p></div><div class="page-hero-art" aria-hidden="true">${symbol}</div></div></section>`;
}

function yctJourney() {
  return `
    <div class="journey-grid">
      ${courses.map((course) => `<a class="journey-card" href="${levelPath(course.level)}"><span class="journey-level">YCT${course.level}</span><h3>${escapeHTML(course.title)}</h3><p>${course.duration.totalSessions} buổi · ${course.duration.lessonSessions} buổi học · ${course.duration.reviewSessions} buổi ôn tập</p><div class="journey-card-footer"><span>${course.level === 1 ? "Bắt đầu hành trình" : "Tiếp tục hành trình"}</span><span class="arrow-link" aria-hidden="true">${icon("arrow", 18)}</span></div></a>`).join("")}
    </div>`;
}

function rhythmCards() {
  const yct1 = courses[0];
  return `<div class="rhythm-grid"><article class="rhythm-card"><div class="rhythm-icon">01</div><h3>Học</h3><p>Các buổi học mới mở rộng từng bước qua Nghe, Nói, Đọc và Viết.</p><small>${yct1?.duration.lessonSessions || 22} buổi ở YCT1-YCT4 · ${courses[4]?.duration.lessonSessions || 28} buổi ở YCT5-YCT6</small></article><article class="rhythm-card green"><div class="rhythm-icon">02</div><h3>Ôn tập</h3><p>Mỗi chặng có mốc ôn tập để nhìn lại nội dung đã đi qua và củng cố nền tảng.</p><small>4 hoặc 5 mốc tùy cấp độ</small></article><article class="rhythm-card orange"><div class="rhythm-icon">03</div><h3>Đánh giá</h3><p>Hai buổi cuối khóa tách thành Nghe - Nói và Đọc - Viết.</p><small>Không thay thế tư vấn xếp lớp</small></article></div>`;
}

function finder() {
  return `<div class="finder" data-finder><div class="finder-panel"><div class="finder-progress" aria-hidden="true"><span class="progress-dot active" data-progress="1"></span><span class="progress-dot" data-progress="2"></span></div><p class="finder-question" data-finder-question>Con đã từng học tiếng Trung chưa?</p><div class="choice-grid" data-finder-choices></div><div class="finder-result" data-finder-result aria-live="polite"></div><p class="choice-note">Đây là gợi ý ban đầu, không phải bài kiểm tra xếp lớp chính thức.</p></div><div class="finder-steps"><div class="mini-step"><span class="mini-step-number">01</span><div><h3>Nhìn vào điểm bắt đầu</h3><p>Chọn tình trạng học hiện tại của con để bắt đầu một hướng gợi ý đơn giản.</p></div></div><div class="mini-step"><span class="mini-step-number">02</span><div><h3>Đi sâu vừa đủ</h3><p>Nếu con đã từng học, chọn cấp gần nhất để xem bước tiếp theo ở mức sơ bộ.</p></div></div><div class="mini-step"><span class="mini-step-number">03</span><div><h3>Trao đổi khi cần</h3><p>Bamboo sẽ hỗ trợ thêm khi gia đình chưa chắc về trình độ hoặc lựa chọn lớp.</p></div></div></div></div>`;
}

function progressPreview() {
  return `<div class="progress-preview"><div class="report-card"><div class="report-header"><div><strong>Cách đọc tiến bộ của con</strong><small>Minh họa các mốc trong hành trình</small></div><span class="report-badge">Tiến bộ của con</span></div><div class="report-row"><span class="report-number">01</span><div><strong>Nội dung đã học</strong><span>Những chủ đề và buổi học đã đi qua</span></div><span class="report-state">Đã học</span></div><div class="report-row"><span class="report-number">02</span><div><strong>Nội dung đang củng cố</strong><span>Mốc ôn tập giúp nhìn lại nền tảng</span></div><span class="report-state">Ôn tập</span></div><div class="report-row"><span class="report-number">03</span><div><strong>Chặng tiếp theo</strong><span>Bước tiếp nối trong lộ trình YCT</span></div><span class="report-state">Tiếp theo</span></div></div><div><p class="eyebrow">TIẾN BỘ CỦA CON</p><h2>Phụ huynh nhìn thấy cả quá trình, không chỉ một kết quả.</h2><p class="lede">Tiến bộ của con được giải thích qua nội dung học, mốc ôn tập, hai buổi đánh giá và phản hồi trong quá trình học.</p>${link("Xem cách Bamboo ghi nhận tiến bộ", "/tien-bo-cua-con", "arrow-link")}</div></div>`;
}

function priceCards() {
  return `<div class="price-grid">${courses.map((course, index) => `<article class="price-card ${index === 0 ? "featured" : ""}"><div class="price-card-top"><h3>YCT${course.level}</h3>${index === 0 ? `<span class="tag">Bắt đầu</span>` : ""}</div><p>${course.duration.totalSessions} buổi · lớp trực tuyến tối đa ${course.classSize.maxOnline} bạn</p><div class="price-value"><del>${formatPrice(course.pricing.listPrice)}</del><div class="price-discount">Giảm ${formatPrice(course.pricing.discountAmount)}</div></div>${link("Xem khóa học", levelPath(course.level), "button secondary small")}</article>`).join("")}</div>`;
}

function home() {
  return shell(`
    <section class="hero"><div class="container hero-grid"><div class="hero-copy"><p class="eyebrow">TIẾNG TRUNG DÀNH RIÊNG CHO TRẺ 6-12 TUỔI</p><h1>Học từng bước.<br><span style="color:var(--green)">Tiến bộ từng ngày.</span></h1><p class="lede">Một hành trình tiếng Trung rõ ràng cho phụ huynh và đủ gần gũi để trẻ muốn tiếp tục học mỗi ngày.</p><div class="hero-actions">${link("Tìm lộ trình cho con", "/tim-lop-cho-con", "button primary")}${link("Xem lộ trình YCT", "/lo-trinh", "button secondary")}</div><p class="hero-note"><span></span>Được phát triển bởi MXiao Chinese</p></div><div class="hero-visual" aria-label="Hình ảnh Bamboo Chinese"><div class="hero-photo"><img src="/assets/brand/cover.jpg" alt="Trẻ học tiếng Trung cùng giáo trình YCT" loading="eager"><div class="hero-photo-card"><strong>YCT1 → YCT6</strong><span>Học · Ôn tập · Đánh giá theo từng chặng</span></div></div></div></div></section>
    <div class="proof-strip"><div class="container proof-grid"><div class="proof-item">6-12 tuổi</div><div class="proof-item">6-8 bạn/lớp</div><div class="proof-item">Nghe - Nói - Đọc - Viết</div><div class="proof-item">YCT1-YCT6</div></div></div>
    <section class="section"><div class="container"><div class="section-heading"><p class="eyebrow">BẮT ĐẦU TỪ CÂU HỎI CỦA GIA ĐÌNH</p><h2>Con nên bắt đầu từ đâu?</h2><p class="lede">Không cần hiểu hết YCT trước. Hãy bắt đầu từ tình trạng học hiện tại của con.</p></div>${finder()}</div></section>
    <section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">MỘT HÀNH TRÌNH LIÊN TỤC</p><h2>YCT1 đến YCT6</h2><p class="lede">Sáu cấp độ được kết nối thành một đường đi để gia đình dễ hình dung bước tiếp theo.</p></div>${yctJourney()}</div></section>
    <section class="section"><div class="container"><div class="lesson-grid"><div class="lesson-card"><div class="lesson-card-top"><span class="mini-label" style="color:var(--orange)">MỘT BUỔI HỌC TẠI BAMBOO</span><span class="lesson-time">90 phút</span></div><h3>Học qua bốn kỹ năng, từng nhịp vừa đủ.</h3><p>Buổi học được tổ chức trong lớp nhỏ, với không gian để trẻ nghe, nói, đọc và viết.</p><div class="lesson-sequence"><div class="sequence-item"><span class="sequence-dot">01</span><span>Khởi động bằng Nghe</span></div><div class="sequence-item"><span class="sequence-dot">02</span><span>Luyện Nói qua tương tác</span></div><div class="sequence-item"><span class="sequence-dot">03</span><span>Đọc và Viết theo bài học</span></div></div></div><div class="lesson-copy"><div class="section-heading"><p class="eyebrow">CÁCH HỌC</p><h2>Một buổi học có cấu trúc, không nặng nề.</h2><p class="lede">Bamboo giữ cho phụ huynh biết con đang học gì, trong khi trẻ có đủ không gian để thực hành.</p></div><ul class="fact-list"><li><strong>6 bạn</strong><span>Tối đa ở lớp trực tuyến</span></li><li><strong>8 bạn</strong><span>Tối đa ở lớp trực tiếp</span></li><li><strong>4 kỹ năng</strong><span>Nghe - Nói - Đọc - Viết</span></li><li><strong>YCT1-YCT6</strong><span>Hành trình liên tục</span></li></ul></div></div></div></section>
    <section class="section soft"><div class="container"><div class="section-heading center"><p class="eyebrow">NHỊP CHƯƠNG TRÌNH</p><h2>Học - Ôn tập - Đánh giá</h2><p class="lede">Mỗi cấp độ có những mốc rõ ràng để việc học không bị đứt quãng.</p></div>${rhythmCards()}</div></section>
    <section class="section"><div class="container">${progressPreview()}</div></section>
    <section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">LỘ TRÌNH VÀ HỌC PHÍ</p><h2>Chọn chặng phù hợp để bắt đầu.</h2><p class="lede">Mỗi cấp độ dùng chung cấu trúc giá minh bạch và dữ liệu curriculum trong hành trình Bamboo.</p></div>${priceCards()}</div></section>
    <section class="section"><div class="container"><div class="cta-banner"><p class="eyebrow">BẠN ĐANG TÌM BƯỚC TIẾP THEO?</p><h2>Chưa chắc con nên bắt đầu từ đâu?</h2><p>Để lại thông tin cơ bản về con, Bamboo sẽ có cơ sở để cùng gia đình trao đổi lựa chọn phù hợp.</p>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button light")}</div></div></section>`);
}

function learningPath() {
  return shell(`${pageHero("LỘ TRÌNH HỌC", "Từ YCT1 đến YCT6", "Một cách nhìn rõ ràng về các chặng học, nhịp ôn tập và những mốc đánh giá trong hành trình Bamboo.", "路")}
    <section class="section compact"><div class="container"><div class="section-heading"><p class="eyebrow">TÌM ĐIỂM BẮT ĐẦU</p><h2>Con đang ở đâu trên hành trình?</h2><p class="lede">Gợi ý sơ bộ để gia đình biết nên tìm hiểu chặng nào trước.</p></div>${finder()}</div></section>
    <section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">HÀNH TRÌNH YCT</p><h2>Sáu cấp độ, một đường đi.</h2></div>${yctJourney()}</div></section>
    <section class="section"><div class="container"><div class="section-heading"><p class="eyebrow">SO SÁNH NHANH</p><h2>Thông tin cốt lõi của từng cấp.</h2></div><div class="compare-grid">${courses.map((course) => `<article class="compare-card"><h3>YCT${course.level}</h3><dl><dt>Tổng số buổi</dt><dd>${course.duration.totalSessions}</dd><dt>Ôn tập</dt><dd>${course.duration.reviewSessions} buổi</dd><dt>Đánh giá</dt><dd>${course.duration.assessmentSessions} buổi</dd></dl></article>`).join("")}</div></div></section>
    <section class="section soft"><div class="container"><div class="section-heading center"><p class="eyebrow">CẤU TRÚC CHƯƠNG TRÌNH</p><h2>Học - Ôn tập - Đánh giá</h2></div>${rhythmCards()}</div></section>
    <section class="section"><div class="container"><div class="section-heading"><p class="eyebrow">HỌC PHÍ</p><h2>Thông tin giá theo từng cấp độ.</h2></div>${priceCards()}</div></section>
    <section class="section compact"><div class="container"><div class="cta-banner"><p class="eyebrow">CẦN THÊM GỢI Ý?</p><h2>Tìm lớp cho con theo tình trạng học hiện tại.</h2>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button light")}</div></div></section>`);
}

function groupedCurriculum(course) {
  const groups = [];
  course.curriculum.forEach((session) => {
    const previous = groups[groups.length - 1];
    if (!previous || previous.type !== session.type) groups.push({ type: session.type, sessions: [session] });
    else previous.sessions.push(session);
  });
  return groups.map((group, index) => {
    const first = group.sessions[0].session;
    const last = group.sessions[group.sessions.length - 1].session;
    const label = group.type === "lesson" ? `Các buổi học ${first}–${last}` : group.type === "review" ? group.sessions[0].titleVi : "Hai buổi đánh giá cuối khóa";
    return `<details class="curriculum-group" ${index === 0 ? "open" : ""}><summary><span>${escapeHTML(label)}</span><span class="curriculum-meta">${group.sessions.length} ${group.type === "lesson" ? "buổi" : "mốc"}</span></summary><div class="session-list">${group.sessions.map((session) => `<div class="session"><span class="session-number">${session.session}</span><div class="session-title"><small>${escapeHTML(session.titleZh)}</small>${escapeHTML(session.titleVi)}</div><span class="session-type ${session.type}">${typeLabel[session.type]}</span></div>`).join("")}</div></details>`;
  }).join("");
}

function coursePage(course) {
  const previous = courses.find((item) => item.level === course.level - 1);
  const next = courses.find((item) => item.level === course.level + 1);
  return shell(`<section class="course-hero"><div class="container course-hero-grid"><div><div class="breadcrumb">${link("Trang chủ", "/")}<span>/</span>${link("Lộ trình học", "/lo-trinh")}<span>/</span><span>YCT${course.level}</span></div><p class="eyebrow">LỘ TRÌNH YCT${course.level}</p><h1>${escapeHTML(course.title)}</h1><p class="lede">${course.duration.totalSessions} buổi học theo nhịp Học - Ôn tập - Đánh giá, phát triển Nghe - Nói - Đọc - Viết.</p><div class="course-actions">${link("Tìm lớp cho con", "/tim-lop-cho-con", "button primary")}${link("Xem toàn bộ lộ trình", "/lo-trinh", "button secondary")}</div></div><div class="course-image-frame"><img src="${courseImage(course.level)}" alt="Lộ trình YCT${course.level}" loading="eager"></div></div></section><div class="container course-facts"><div class="course-fact"><strong>${course.duration.totalSessions}</strong><span>Tổng số buổi</span></div><div class="course-fact"><strong>${course.duration.lessonSessions}</strong><span>Buổi học</span></div><div class="course-fact"><strong>${course.duration.reviewSessions}</strong><span>Buổi ôn tập</span></div><div class="course-fact"><strong>${course.duration.assessmentSessions}</strong><span>Buổi đánh giá</span></div></div>
    <section class="section compact"><div class="container"><div class="section-heading"><p class="eyebrow">CẤU TRÚC KHÓA HỌC</p><h2>Một chặng học có điểm bắt đầu, mốc củng cố và điểm nhìn lại.</h2></div><div class="milestone-grid"><article class="milestone lesson"><strong>${course.duration.lessonSessions}</strong><h3>Buổi học</h3><p>Các bài học theo curriculum YCT${course.level}, giữ nguyên tên tiếng Trung và tiếng Việt từ dữ liệu nguồn.</p></article><article class="milestone review"><strong>${course.duration.reviewSessions}</strong><h3>Buổi ôn tập</h3><p>Mốc ôn tập được đặt sau từng chặng nội dung trong curriculum.</p></article><article class="milestone assessment"><strong>${course.duration.assessmentSessions}</strong><h3>Buổi đánh giá</h3><p>Gồm Nghe - Nói và Đọc - Viết ở cuối khóa.</p></article></div></div></section>
    <section class="section tint"><div class="container"><div class="section-heading"><p class="eyebrow">NỘI DUNG YCT${course.level}</p><h2>Các buổi học trong lộ trình.</h2><p class="lede">Mở từng chặng để xem tên bài đúng theo dữ liệu curriculum đã cung cấp.</p></div><div class="curriculum-list">${groupedCurriculum(course)}</div></div></section>
    <section class="section"><div class="container"><div class="lesson-grid"><div class="lesson-card"><div class="lesson-card-top"><span class="mini-label" style="color:var(--orange)">MỘT BUỔI HỌC</span><span class="lesson-time">${course.duration.minutesPerSession || 90} phút</span></div><h3>Học qua bốn kỹ năng.</h3><p>Trang tập trung vào những thông tin đã có trong nguồn khóa học.</p><div class="lesson-sequence"><div class="sequence-item"><span class="sequence-dot">01</span><span>Nghe</span></div><div class="sequence-item"><span class="sequence-dot">02</span><span>Nói</span></div><div class="sequence-item"><span class="sequence-dot">03</span><span>Đọc</span></div><div class="sequence-item"><span class="sequence-dot">04</span><span>Viết</span></div></div></div><div class="lesson-copy"><div class="section-heading"><p class="eyebrow">TIẾN BỘ CỦA CON</p><h2>Nhìn thấy mốc học, ôn tập và đánh giá.</h2><p class="lede">Tiến bộ của con là cách giải thích cơ chế ghi nhận tiến bộ, không phải bảng theo dõi cá nhân đang hoạt động.</p></div>${link("Tìm hiểu Tiến bộ của con", "/tien-bo-cua-con", "arrow-link")}</div></div></div></section>
    <section class="section soft"><div class="container"><div class="price-callout"><div><p class="eyebrow" style="color:var(--orange)">HỌC PHÍ YCT${course.level}</p><del>${formatPrice(course.pricing.listPrice)}</del><div class="price-discount">Giảm ${formatPrice(course.pricing.discountAmount)}</div></div>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button light")}</div></div></section>
    <section class="section compact"><div class="container course-nav">${previous ? `<a class="course-nav-card" href="${levelPath(previous.level)}"><small>Khóa trước</small><strong>YCT${previous.level} ←</strong></a>` : `<a class="course-nav-card" href="/lo-trinh"><small>Điểm bắt đầu</small><strong>Xem tổng quan lộ trình</strong></a>`}${next ? `<a class="course-nav-card next" href="${levelPath(next.level)}"><small>Khóa tiếp theo</small><strong>→ YCT${next.level}</strong></a>` : `<a class="course-nav-card next" href="/tim-lop-cho-con"><small>Bước tiếp theo</small><strong>Tìm lớp cho con →</strong></a>`}</div></section>`);
}

function editorialPage(kind) {
  if (kind === "teach") return shell(`${pageHero("CÁCH BAMBOO DẠY", "Học thế nào tại Bamboo?", "Một cơ chế học rõ ràng cho trẻ và một cách nhìn dễ theo dõi cho phụ huynh.", "學")}<section class="section"><div class="container"><div class="section-heading"><p class="eyebrow">MỘT BUỔI HỌC</p><h2>Học qua tương tác, thực hành và lặp lại có chủ đích.</h2><p class="lede">Bamboo tổ chức nội dung trong lớp nhỏ, theo nhịp học, ôn tập và đánh giá của từng cấp độ.</p></div><div class="editorial-grid"><article class="editorial-card"><div class="editorial-icon">聽</div><h3>Nghe và nói</h3><p>Trẻ có thời gian tiếp nhận âm thanh và thực hành nói trong một lớp học có quy mô nhỏ.</p></article><article class="editorial-card"><div class="editorial-icon">讀</div><h3>Đọc và viết</h3><p>Hai kỹ năng được đưa vào từng chặng học theo dữ liệu curriculum của YCT.</p></article><article class="editorial-card"><div class="editorial-icon">小</div><h3>Lớp nhỏ</h3><p>Tối đa 6 bạn ở lớp trực tuyến và 8 bạn ở lớp trực tiếp.</p></article></div></div></section><section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">NHỊP HỌC</p><h2>Học - Ôn tập - Đánh giá</h2></div>${rhythmCards()}</div></section><section class="section compact"><div class="container"><div class="cta-banner"><p class="eyebrow">BẮT ĐẦU TỪ ĐÂY</p><h2>Tìm lộ trình phù hợp để cùng con bước vào hành trình.</h2>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button light")}</div></div></section>`);
  if (kind === "progress") return shell(`${pageHero("TIẾN BỘ CỦA CON", "Tiến bộ của con", "Bamboo giúp phụ huynh đọc được quá trình học qua nội dung, mốc ôn tập, đánh giá và bước tiếp theo.", "進")}<section class="section"><div class="container">${progressPreview()}</div></section><section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">BỐN KỸ NĂNG</p><h2>Một bức tranh tiến bộ có nhiều mốc.</h2><p class="lede">Quá trình học được nhìn qua các mốc, không quy đổi thành điểm số hoặc xếp hạng.</p></div><div class="editorial-grid"><article class="editorial-card"><div class="number">01</div><h3>Nghe</h3><p>Những nội dung con đã tiếp nhận và đang củng cố.</p></article><article class="editorial-card"><div class="number">02</div><h3>Nói</h3><p>Cơ hội thực hành trong lớp và mốc đánh giá cuối khóa.</p></article><article class="editorial-card"><div class="number">03</div><h3>Đọc - Viết</h3><p>Các chặng nội dung đi cùng YCT.</p></article></div></div></section><section class="section compact"><div class="container"><div class="cta-banner"><p class="eyebrow">CẦN TƯ VẤN</p><h2>Trao đổi để hiểu bước tiếp theo của con.</h2>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button light")}</div></div></section>`);
  return shell(`${pageHero("VỀ BAMBOO", "Bamboo Chinese là gì?", "Bamboo Chinese là chương trình tiếng Trung dành cho trẻ 6-12 tuổi, được phát triển trong hệ sinh thái MXiao Chinese.", "竹")}<section class="section"><div class="container about-grid"><div class="about-image"><img src="/assets/brand-visual-reference.png" alt="Không gian hình ảnh Bamboo Chinese" loading="lazy"></div><div class="about-copy"><p class="eyebrow">BAMBOO CHINESE × MXIAO CHINESE</p><h2>Một trải nghiệm riêng trên nền tảng chuyên môn chung.</h2><p>Bamboo là thương hiệu trực tiếp đồng hành cùng trẻ và phụ huynh. MXiao Chinese đứng sau về nền tảng chuyên môn và hạ tầng dùng chung.</p><p>Bamboo không chỉ là danh mục sáu khóa YCT. Website bắt đầu từ những câu hỏi thật của gia đình: con đang ở đâu, sẽ học thế nào và làm sao phụ huynh hiểu quá trình tiến bộ.</p>${link("Xem lộ trình YCT", "/lo-trinh", "button primary")}</div></div></section><section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">KHÔNG GIAN BAMBOO</p><h2>Tươi sáng, ấm áp, có cấu trúc.</h2><p class="lede">Hình ảnh Bamboo lấy cảm hứng từ tre, lá, mây, đồi xanh và đường phát triển — đủ gần gũi với trẻ nhưng vẫn rõ ràng cho phụ huynh.</p></div></div></section>`);
}

function parentCorner() {
  const categories = ["Bắt đầu học tiếng Trung", "Hiểu về YCT", "Đồng hành cùng con", "Hiểu tiến bộ"];
  return shell(`${pageHero("GÓC PHỤ HUYNH", "Những điều phụ huynh muốn biết", "Các chủ đề để gia đình bắt đầu tìm hiểu trước khi chọn lộ trình cho con.", "家")}<section class="section"><div class="container"><div class="article-categories">${categories.map((category, index) => `<div class="category-card"><span>0${index + 1}</span><h3>${category}</h3></div>`).join("")}</div></div></section><section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">NỘI DUNG ĐỒNG HÀNH</p><h2>Đi từ câu hỏi của gia đình.</h2><p class="lede">Bamboo sẽ mở rộng các bài viết theo nguồn nội dung được duyệt, cùng hệ thống nội dung của MXiao Chinese.</p></div><div class="cta-banner"><p class="eyebrow">ĐÃ SẴN SÀNG TÌM HIỂU?</p><h2>Khám phá lộ trình YCT1-YCT6.</h2>${link("Xem lộ trình", "/lo-trinh", "button light")}</div></div></section>`);
}

function articlePage() {
  return shell(`${pageHero("BÀI VIẾT", "Bài viết cho phụ huynh", "Những nội dung giúp gia đình hiểu cách bắt đầu và đồng hành cùng hành trình tiếng Trung của con.", "文")}<section class="section"><div class="container not-found"><div><p class="eyebrow">BAMBOO CHINESE</p><h2>Những câu hỏi đáng để bắt đầu.</h2><p class="lede" style="margin:18px auto 0">Khám phá lộ trình và cách Bamboo tổ chức việc học trước khi chọn bước tiếp theo cho con.</p>${link("Xem cách Bamboo dạy", "/cach-bamboo-day", "button primary")}</div></div></section>`);
}

function teachers(path) {
  const isDetail = path.startsWith("/giao-vien/");
  return shell(`${pageHero("GIÁO VIÊN", isDetail ? "Hồ sơ giáo viên" : "Đội ngũ giáo viên", isDetail ? "Thông tin hồ sơ giáo viên được trình bày theo nguồn dữ liệu chung của MXiao Chinese." : "Bamboo sử dụng nguồn dữ liệu giáo viên chung của MXiao Chinese để bảo đảm thông tin nhất quán.", "師")}<section class="section"><div class="container not-found"><div><p class="eyebrow">MXIAO CHINESE</p><h2>${isDetail ? "Không tìm thấy hồ sơ này." : "Bamboo và MXiao cùng một nguồn giáo viên."}</h2><p class="lede" style="margin:18px auto 0">${isDetail ? "Hãy quay lại danh sách để tiếp tục tìm hiểu." : "Bamboo trình bày thông tin giáo viên theo dữ liệu đã được xác nhận của MXiao Chinese."}</p>${link(isDetail ? "Về trang giáo viên" : "Tìm lớp cho con", isDetail ? "/giao-vien" : "/tim-lop-cho-con", "button primary")}</div></div></section>`);
}

function contactForm() {
  return `<form class="form-card" data-lead-form novalidate><input type="hidden" name="brand" value="bamboo"><input type="hidden" name="formType" value="course-interest"><input type="hidden" name="sourcePage" value="${escapeHTML(currentPath())}"><p class="form-section-title">Thông tin về con</p><div class="form-grid"><div class="field"><label for="child-age">Tuổi của con</label><select id="child-age" name="childAge" required><option value="">Chọn độ tuổi</option><option>6-7 tuổi</option><option>8-9 tuổi</option><option>10-12 tuổi</option></select></div><div class="field"><label for="prior-learning">Con đã từng học tiếng Trung?</label><select id="prior-learning" name="priorLearning" required><option value="">Chọn một phương án</option><option>Chưa từng học</option><option>Đã từng học</option><option>Không chắc trình độ</option></select></div><div class="field full"><label for="previous-level">Cấp độ gần nhất nếu con đã từng học</label><select id="previous-level" name="previousLevel"><option value="">Chưa chọn / không áp dụng</option>${courses.map((course) => `<option>YCT${course.level}</option>`).join("")}</select><small>Không cần điền nếu con chưa từng học hoặc gia đình chưa chắc trình độ.</small></div><div class="field full"><label for="learning-mode">Hình thức học mong muốn</label><select id="learning-mode" name="learningMode" required><option value="">Chọn hình thức</option><option>Trực tuyến</option><option>Trực tiếp</option><option>Chưa quyết định</option></select></div></div><hr class="form-divider"><p class="form-section-title">Thông tin phụ huynh</p><div class="form-grid"><div class="field"><label for="parent-name">Tên phụ huynh</label><input id="parent-name" name="parentName" autocomplete="name" required></div><div class="field"><label for="parent-phone">Số điện thoại</label><input id="parent-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required></div><div class="field full"><label for="parent-email">Email <span class="muted">(tùy chọn)</span></label><input id="parent-email" name="email" type="email" autocomplete="email"></div><div class="field full"><label for="parent-note">Điều gia đình muốn trao đổi <span class="muted">(tùy chọn)</span></label><textarea id="parent-note" name="note" placeholder="Ví dụ: gia đình muốn được tư vấn điểm bắt đầu"></textarea></div></div><div class="form-error" data-form-error role="alert"></div><div class="form-success" data-form-success role="status">Bamboo đã nhận thông tin của bạn.</div><button class="button primary full" type="submit">Gửi thông tin cho Bamboo</button></form>`;
}

function leadPage() {
  return shell(`${pageHero("TÌM LỚP CHO CON", "Bắt đầu hành trình của con", "Chia sẻ một vài thông tin cơ bản để Bamboo hiểu nhu cầu của gia đình và cùng bạn tìm bước tiếp theo.", "始")}<section class="section"><div class="container form-layout"><div><p class="eyebrow">GỌN VÀ ĐỦ</p><h2>Thông tin về con trước, thông tin liên hệ sau.</h2><p class="lede">Bạn không cần cung cấp ngày sinh đầy đủ. Chỉ những thông tin cần thiết cho cuộc trao đổi ban đầu.</p><div class="contact-list"><div class="contact-item"><span class="contact-icon">01</span><div><strong>Tuổi của con</strong><span>Giúp định hình điểm bắt đầu trong hành trình 6-12 tuổi.</span></div></div><div class="contact-item"><span class="contact-icon">02</span><div><strong>Tình trạng học</strong><span>Chưa từng học, đã từng học hoặc chưa chắc trình độ.</span></div></div><div class="contact-item"><span class="contact-icon">03</span><div><strong>Hình thức mong muốn</strong><span>Trực tuyến, trực tiếp hoặc cần thêm tư vấn.</span></div></div></div></div>${contactForm()}</div></section>`);
}

function contactPage() {
  return shell(`${pageHero("LIÊN HỆ", "Trao đổi cùng Bamboo", "Nếu gia đình chưa biết bắt đầu từ đâu, hãy để lại thông tin để Bamboo có cơ sở tư vấn.", "聯")}<section class="section"><div class="container"><div class="cta-banner"><p class="eyebrow">BƯỚC TIẾP THEO</p><h2>Tìm lớp cho con theo tình trạng học hiện tại.</h2><p>Bamboo sẽ bắt đầu từ những điều gia đình đã biết về con, không yêu cầu một bài kiểm tra dài.</p>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button light")}</div></div></section>`);
}

function notFound() {
  return shell(`<section class="not-found"><div><p class="eyebrow">BAMBOO CHINESE</p><h1>Trang này chưa có.</h1><p class="lede" style="margin:18px auto 0">Hãy quay lại trang chủ để tiếp tục hành trình.</p>${link("Về trang chủ", "/", "button primary")}</div></section>`);
}

function setMeta(title, description) {
  document.title = `${title} — Bamboo Chinese`;
  const descriptionTag = document.querySelector('meta[name="description"]');
  if (descriptionTag) descriptionTag.setAttribute("content", description);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", window.location.origin + currentPath());
}

function renderPage() {
  const path = currentPath();
  let content;
  if (path === "/") { content = home(); setMeta("Học từng bước. Tiến bộ từng ngày.", "Bamboo Chinese giúp phụ huynh hiểu lộ trình tiếng Trung cho trẻ 6-12 tuổi."); }
  else if (path === "/lo-trinh") { content = learningPath(); setMeta("Lộ trình YCT1-YCT6", "Khám phá lộ trình học tiếng Trung YCT1-YCT6 tại Bamboo Chinese."); }
  else if (/^\/lo-trinh\/yct-[1-6]$/.test(path)) { const level = Number(path.match(/yct-(\d)/)[1]); const course = courses.find((item) => item.level === level); content = course ? coursePage(course) : notFound(); setMeta(course ? `YCT${level}` : "Không tìm thấy trang", "Thông tin lộ trình Bamboo Chinese."); }
  else if (path === "/cach-bamboo-day") { content = editorialPage("teach"); setMeta("Cách Bamboo dạy", "Tìm hiểu cách Bamboo tổ chức một buổi học và nhịp chương trình."); }
  else if (path === "/tien-bo-cua-con") { content = editorialPage("progress"); setMeta("Tiến bộ của con", "Cách Bamboo ghi nhận tiến bộ qua các mốc học, ôn tập và đánh giá."); }
  else if (path === "/ve-bamboo") { content = editorialPage("about"); setMeta("Về Bamboo", "Bamboo Chinese được phát triển bởi MXiao Chinese cho trẻ 6-12 tuổi."); }
  else if (path === "/giao-vien" || path.startsWith("/giao-vien/")) { content = teachers(path); setMeta("Giáo viên", "Thông tin đội ngũ giáo viên Bamboo Chinese từ nguồn MXiao Chinese."); }
  else if (path === "/goc-phu-huynh") { content = parentCorner(); setMeta("Góc phụ huynh", "Các chủ đề phụ huynh cần biết khi bắt đầu cho con học tiếng Trung."); }
  else if (path === "/bai-viet" || path.startsWith("/bai-viet/")) { content = articlePage(); setMeta("Bài viết", "Bài viết dành cho phụ huynh có con học tiếng Trung."); }
  else if (path === "/tim-lop-cho-con") { content = leadPage(); setMeta("Tìm lớp cho con", "Để lại thông tin để Bamboo Chinese cùng gia đình tìm bước tiếp theo."); }
  else if (path === "/lien-he") { content = contactPage(); setMeta("Liên hệ", "Trao đổi cùng Bamboo Chinese."); }
  else { content = notFound(); setMeta("Không tìm thấy trang", "Bamboo Chinese."); }
  document.querySelector("#app").innerHTML = content;
  bindInteractions();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderFinder(root) {
  const question = root.querySelector("[data-finder-question]");
  const choices = root.querySelector("[data-finder-choices]");
  const result = root.querySelector("[data-finder-result]");
  const progress = root.querySelectorAll("[data-progress]");
  let step = "prior";
  let selectedPrior = "";
  const setChoices = (items) => {
    choices.innerHTML = items.map((item) => `<button type="button" class="choice" data-value="${escapeHTML(item.value)}"><span class="choice-mark">${icon("check", 15)}</span><span>${escapeHTML(item.label)}</span></button>`).join("");
  };
  const showResult = (title, copy, href = "/tim-lop-cho-con", label = "Tìm lớp cho con") => {
    result.innerHTML = `<strong>${escapeHTML(title)}</strong><p>${escapeHTML(copy)}</p>${link(label, href, "button light small")}`;
    result.classList.add("visible");
  };
  const showStep = (nextStep) => {
    step = nextStep;
    result.classList.remove("visible");
    progress.forEach((dot) => dot.classList.toggle("active", dot.dataset.progress === (step === "prior" ? "1" : "2")));
    if (step === "prior") {
      question.textContent = "Con đã từng học tiếng Trung chưa?";
      setChoices([{ value: "never", label: "Chưa từng học" }, { value: "yes", label: "Đã từng học" }, { value: "unsure", label: "Không chắc trình độ" }]);
    } else if (step === "age") {
      question.textContent = "Con bao nhiêu tuổi?";
      setChoices([{ value: "6-7", label: "6-7 tuổi" }, { value: "8-9", label: "8-9 tuổi" }, { value: "10-12", label: "10-12 tuổi" }]);
    } else {
      question.textContent = "Con đã học đến cấp nào gần nhất?";
      setChoices(courses.map((course) => ({ value: String(course.level), label: `YCT${course.level}` })));
    }
  };
  choices.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-value]");
    if (!choice) return;
    choices.querySelectorAll(".choice").forEach((item) => item.classList.toggle("selected", item === choice));
    const value = choice.dataset.value;
    if (step === "prior") {
      selectedPrior = value;
      if (value === "never") showStep("age");
      if (value === "unsure") showResult("Bamboo có thể cùng gia đình đánh giá bước đầu.", "Hãy để lại thông tin để được hỗ trợ khi gia đình chưa chắc về trình độ.");
      if (value === "yes") showStep("level");
    } else if (step === "age") {
      showResult("YCT1 có thể là điểm bắt đầu phù hợp với con.", "Đây là gợi ý ban đầu dựa trên việc con chưa từng học tiếng Trung.", levelPath(1), "Xem YCT1");
    } else if (step === "level") {
      const current = Number(value);
      const next = current < 6 ? current + 1 : current;
      const text = current < 6 ? `YCT${next} có thể là bước tiếp theo để gia đình tìm hiểu.` : "Gia đình có thể trao đổi thêm để Bamboo hỗ trợ xác nhận bước tiếp theo.";
      showResult(text, "Bamboo sẽ kiểm tra và tư vấn trước khi xếp lớp nếu cần.", current < 6 ? levelPath(next) : "/tim-lop-cho-con", current < 6 ? `Xem YCT${next}` : "Tìm lớp cho con");
    }
  });
  setChoices([{ value: "never", label: "Chưa từng học" }, { value: "yes", label: "Đã từng học" }, { value: "unsure", label: "Không chắc trình độ" }]);
}

function bindInteractions() {
  const menuToggle = document.querySelector("[data-menu-toggle]");
  menuToggle?.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Đóng menu" : "Mở menu");
    menuToggle.innerHTML = icon(open ? "close" : "menu", 25);
  });
  document.querySelectorAll(".mobile-nav a").forEach((item) => item.addEventListener("click", () => document.body.classList.remove("menu-open")));
  document.querySelectorAll("[data-finder]").forEach(renderFinder);
  const form = document.querySelector("[data-lead-form]");
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const error = form.querySelector("[data-form-error]");
    if (!form.checkValidity()) {
      error.textContent = "Vui lòng điền các thông tin bắt buộc trước khi gửi.";
      form.reportValidity();
      return;
    }
    error.textContent = "";
    form.querySelector("[data-form-success]").classList.add("visible");
    form.querySelector("button[type=submit]").disabled = true;
  });
}

async function loadCourses() {
  const responses = await Promise.all(COURSE_FILES.map((file) => fetch(file)));
  courses = await Promise.all(responses.map((response) => response.json()));
  courses.sort((a, b) => a.level - b.level);
}

window.addEventListener("popstate", renderPage);
document.addEventListener("click", (event) => {
  const anchor = event.target.closest("a");
  if (!anchor || !anchor.href || new URL(anchor.href).origin !== window.location.origin || anchor.target === "_blank") return;
  const destination = new URL(anchor.href);
  if (destination.pathname.startsWith("/assets/") || destination.pathname.startsWith("/data/")) return;
  event.preventDefault();
  window.history.pushState({}, "", destination.pathname);
  renderPage();
});

loadCourses().then(renderPage).catch(() => {
  document.querySelector("#app").innerHTML = shell(`<section class="not-found"><div><p class="eyebrow">BAMBOO CHINESE</p><h1>Không thể mở dữ liệu lộ trình.</h1><p class="lede" style="margin:18px auto 0">Vui lòng tải lại trang để thử lại.</p></div></section>`);
});
