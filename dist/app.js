const COURSE_FILES = [1, 2, 3, 4, 5, 6].map((level) => `/data/yct-${level}.json?v=2`);
const TEACHER_FILE = "/data/teachers.json?v=2";
const SCHEDULE_CSV_URL = "https://docs.google.com/spreadsheets/d/1rj1Jhvbgsyn83L895BD8gFkDX5DpIJ4UBDhBtg7kXmo/gviz/tq?tqx=out:csv&sheet=Bamboo%20Chinese";
const NAV_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Khóa học", href: "/lo-trinh", children: [1, 2, 3, 4, 5, 6].map((level) => ({ label: `Khóa YCT${level}`, href: `/lo-trinh/yct-${level}` })) },
  { label: "Lịch khai giảng", href: "/lich-khai-giang" },
  { label: "Phương pháp học", href: "/cach-bamboo-day" },
  { label: "Đội ngũ giáo viên", href: "/giao-vien" },
  { label: "Tiến bộ của con", href: "/tien-bo-cua-con" },
  { label: "Liên hệ", href: "/lien-he" },
];

const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
}[character]));

const formatPrice = (value) => `${Number(value).toLocaleString("vi-VN")}đ`;
const discountedPrice = (course) => course.pricing.listPrice - course.pricing.discountAmount;
const PROMOTION_STORAGE_KEY = "bamboo-promotion-cycle-v1";
const PROMOTION_DURATION_MS = 48 * 60 * 60 * 1000;
const PROMOTION_COOLDOWN_MS = 20 * 24 * 60 * 60 * 1000;
const levelPath = (level) => `/lo-trinh/yct-${level}`;
const courseImage = (level, kind = "journey") => `/assets/courses/yct-${level}-${kind}.jpg`;
const courseBook = (level) => `/assets/books/YCT${level}.png`;

let courses = [];
let teachersData = [];
let promotionTimer = null;
let scheduleRefreshTimer = null;

function promotionState(now = Date.now()) {
  let stored = null;
  try { stored = JSON.parse(localStorage.getItem(PROMOTION_STORAGE_KEY) || "null"); } catch (_) { stored = null; }
  const valid = stored && Number.isFinite(stored.startedAt) && Number.isFinite(stored.expiresAt) && Number.isFinite(stored.eligibleAt);
  if (!valid || now >= stored.eligibleAt) {
    stored = { startedAt: now, expiresAt: now + PROMOTION_DURATION_MS, eligibleAt: now + PROMOTION_DURATION_MS + PROMOTION_COOLDOWN_MS };
    try { localStorage.setItem(PROMOTION_STORAGE_KEY, JSON.stringify(stored)); } catch (_) { /* Local-only offer gracefully falls back to this page view. */ }
  }
  return { ...stored, active: now < stored.expiresAt, remaining: Math.max(0, stored.expiresAt - now) };
}

function countdownText(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function countdownParts(milliseconds) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return {
    days: String(Math.floor(totalSeconds / 86400)).padStart(2, "0"),
    hours: String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, "0"),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0"),
    seconds: String(totalSeconds % 60).padStart(2, "0"),
  };
}

function promoClock(className = "") {
  const units = [["days", "Ngày"], ["hours", "Giờ"], ["minutes", "Phút"], ["seconds", "Giây"]];
  return `<div class="promo-clock ${className}" data-promo-clock aria-label="Thời gian ưu đãi còn lại">${units.map(([part, label]) => `<span class="promo-clock-unit"><strong data-promo-part="${part}">00</strong><small>${label}</small></span>`).join("")}</div>`;
}

function floatingPromotion() {
  return `<a class="floating-promotion" href="/lo-trinh" data-floating-promotion aria-label="Xem các khóa học đang có ưu đãi"><span class="floating-promotion-icon">${icon("star", 16)}</span><span class="floating-promotion-copy"><small>ƯU ĐÃI HỌC PHÍ</small><strong>Xem các khóa học</strong></span>${promoClock("floating-promo-clock")}<span class="floating-promotion-arrow">${icon("arrow", 13)}</span></a>`;
}

function floatingContactRail() {
  return `<aside class="floating-contact-rail" aria-label="Liên hệ nhanh với Bamboo">
    <div class="floating-contact-primary">
      <a class="floating-contact-tab schedule" href="/lich-khai-giang">${icon("calendar", 16)}<span>Lịch khai giảng</span></a>
      <a class="floating-contact-tab consult" href="/tim-lop-cho-con">${icon("message", 16)}<span>Tư vấn ngay</span></a>
    </div>
    <div class="floating-contact-channels">
      <a class="floating-contact-channel messenger" href="https://m.me/mxiao.chinese" target="_blank" rel="noopener noreferrer" aria-label="Nhắn tin qua Messenger"><i class="fa-brands fa-facebook-messenger" aria-hidden="true"></i><span>Messenger</span></a>
      <a class="floating-contact-channel zalo" href="https://zalo.me/0877271760" target="_blank" rel="noopener noreferrer" aria-label="Nhắn tin qua Zalo"><strong aria-hidden="true">Zalo</strong><span>Zalo</span></a>
      <a class="floating-contact-channel phone" href="tel:0877271760" aria-label="Gọi Bamboo qua số 0877 271 760">${icon("phone", 17)}<span>Hotline</span></a>
    </div>
  </aside>`;
}

function promoAttributes(course) {
  return `data-list-price="${course.pricing.listPrice}" data-sale-price="${discountedPrice(course)}"`;
}

function initialPromoState() {
  return promotionState().active ? " is-active" : "";
}

function currentPath() {
  const path = window.location.pathname.replace(/\/+$/, "");
  return path || "/";
}

function link(label, href, className = "") {
  return `<a class="${className}" href="${href}">${escapeHTML(label)}</a>`;
}

function htmlLink(content, href, className = "") {
  return `<a class="${className}" href="${href}">${content}</a>`;
}

function icon(name, size = 20) {
  const names = {
    arrow: "fa-arrow-right",
    menu: "fa-bars",
    close: "fa-xmark",
    check: "fa-check",
    leaf: "fa-leaf",
    plus: "fa-plus",
    book: "fa-book-open",
    users: "fa-people-group",
    chart: "fa-chart-simple",
    calendar: "fa-calendar-days",
    headphones: "fa-headphones",
    message: "fa-comments",
    pen: "fa-pen",
    graduation: "fa-graduation-cap",
    shield: "fa-shield-heart",
    star: "fa-star",
    location: "fa-location-dot",
    flag: "fa-flag-checkered",
    trophy: "fa-trophy",
    phone: "fa-phone",
    envelope: "fa-envelope",
    video: "fa-video",
    clock: "fa-clock",
  };
  return `<i aria-hidden="true" class="fa-solid ${names[name] || names.arrow}" style="font-size:${size}px"></i>`;
}

function header() {
  const path = currentPath();
  const isActive = (href) => path === href || (href !== "/" && path.startsWith(`${href}/`));
  const navLinks = NAV_ITEMS.map((item) => `<div class="nav-item${item.children ? " has-dropdown" : ""}">${link(item.label, item.href, `nav-link${isActive(item.href) ? " active" : ""}`)}${item.children ? `<button class="nav-caret" type="button" aria-label="Mở danh sách khóa học">${icon("arrow", 12)}</button><div class="course-dropdown">${item.children.map((child) => link(child.label, child.href, isActive(child.href) ? "active" : "")).join("")}</div>` : ""}</div>`).join("");
  return `
    <header class="site-header">
      <div class="container nav-shell">
        <a class="brand" href="/" aria-label="Bamboo Chinese, về trang chủ"><img class="brand-logo" src="/assets/brand/logo-color-large.png" alt="Bamboo Chinese"></a>
        <nav class="desktop-nav" aria-label="Điều hướng chính">${navLinks}</nav>
        ${htmlLink(`${icon("message", 16)}<span>Tìm lớp cho con</span>`, "/tim-lop-cho-con", "button primary small html-link")}
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
            <a class="brand" href="/" aria-label="Bamboo Chinese, về trang chủ"><img class="brand-logo" src="/assets/brand/logo-white-large.png" alt="Bamboo Chinese"></a>
            <p>Tiếng Trung dành riêng cho trẻ 6-12 tuổi, với lộ trình liền mạch từ YCT1 đến YCT6.</p>
          </div>
          <div><p class="footer-title">Khóa học</p><div class="footer-links">${link("Lộ trình YCT1-YCT6", "/lo-trinh")}${link("Lịch khai giảng", "/lich-khai-giang")}${link("Học phí", "/lo-trinh")}</div></div>
          <div><p class="footer-title">Bamboo</p><div class="footer-links">${link("Phương pháp học", "/cach-bamboo-day")}${link("Đội ngũ giáo viên", "/giao-vien")}${link("Tiến bộ của con", "/tien-bo-cua-con")}</div></div>
          <div><p class="footer-title">Bắt đầu</p><div class="footer-links">${link("Tìm lớp cho con", "/tim-lop-cho-con")}${link("Liên hệ", "/lien-he")}${link("Về Bamboo", "/ve-bamboo")}</div></div>
        </div>
        <div class="footer-bottom"><span>© Bamboo Chinese</span><span>Phát triển bởi MXiao Chinese</span></div>
      </div>
    </footer>`;
}

function shell(content) {
  return `${header()}<main id="main-content">${content}</main>${floatingContactRail()}${floatingPromotion()}${footer()}`;
}

function pageHero(eyebrow, title, description, symbol = "竹") {
  return `<section class="page-hero"><div class="container page-hero-grid"><div class="page-hero-copy"><div class="breadcrumb">${link("Trang chủ", "/")}<span>/</span><span>${escapeHTML(title)}</span></div><p class="eyebrow">${escapeHTML(eyebrow)}</p><h1>${escapeHTML(title)}</h1><p class="lede">${escapeHTML(description)}</p></div><div class="page-hero-art" aria-hidden="true">${icon("book", 54)}<strong>${escapeHTML(symbol)}</strong></div></div></section>`;
}

function yctJourney() {
  return `
    <div class="course-shelf">
      ${courses.map((course) => `<a class="shelf-course level-${course.level}" href="${levelPath(course.level)}"><div class="book-stage"><span class="level-orbit">${course.level}</span><img src="${courseBook(course.level)}" alt="Giáo trình YCT${course.level}" loading="lazy"></div><div class="shelf-copy"><span class="journey-level">YCT${course.level}</span><h3>${escapeHTML(course.title)}</h3><p>${course.duration.totalSessions} buổi · lớp ${course.classSize.maxOnline}-${course.classSize.maxOffline} bạn</p><div class="shelf-price promo-price${initialPromoState()}" ${promoAttributes(course)}><del data-original-price>${formatPrice(course.pricing.listPrice)}</del><strong data-current-price>${formatPrice(discountedPrice(course))}</strong><small class="promo-countdown" data-promo-countdown></small></div><span class="shelf-link">Xem khóa học ${icon("arrow", 14)}</span></div></a>`).join("")}
    </div>`;
}

function developmentJourney() {
  const stages = [
    { level: 1, icon: "star", phase: "Làm quen", title: "Hứng thú với tiếng Trung", copy: "Âm thanh, lời chào và mẫu câu đầu tiên." },
    { level: 2, icon: "message", phase: "Giao tiếp", title: "Phản xạ câu cơ bản", copy: "Hỏi – đáp ngắn trong tình huống hằng ngày." },
    { level: 3, icon: "book", phase: "Xây nền", title: "Hiểu và diễn đạt rõ hơn", copy: "Đọc hiểu và diễn đạt bằng câu trọn vẹn." },
    { level: 4, icon: "pen", phase: "Mở rộng", title: "Dùng tiếng Trung linh hoạt", copy: "Mở rộng vốn từ và khả năng đọc – viết." },
    { level: 5, icon: "chart", phase: "Tự tin", title: "Chủ động giao tiếp", copy: "Trình bày suy nghĩ mạch lạc, tự tin hơn." },
    { level: 6, icon: "graduation", phase: "Vững vàng", title: "Sẵn sàng cho chặng mới", copy: "Hoàn thiện nền tảng YCT và học chủ động." },
  ];
  return `<div class="development-journey ladder-journey"><div class="yct-ladder" aria-label="Lộ trình bậc thang từ YCT1 đến YCT6">${stages.map((stage, index) => `<div class="yct-ladder-slot" style="--ladder-height:${360 + index * 30}px;--ladder-tablet-height:${340 + index * 27}px;--ladder-mobile-height:${330 + index * 21}px"><a class="yct-ladder-card level-${stage.level}" href="${levelPath(stage.level)}" aria-label="Xem lộ trình YCT${stage.level}: ${escapeHTML(stage.title)}"><div class="ladder-card-head"><span class="ladder-level">YCT${stage.level}</span><span class="ladder-number">0${stage.level}</span></div><div class="ladder-book"><img src="${courseBook(stage.level)}" alt="" loading="lazy"></div><p class="ladder-phase">${icon(stage.level === 6 ? "trophy" : stage.icon, 13)} ${escapeHTML(stage.phase)}</p><h3>${escapeHTML(stage.title)}</h3><p class="ladder-copy">${escapeHTML(stage.copy)}</p><span class="ladder-link">Xem chặng ${icon("arrow", 12)}</span></a></div>`).join("")}</div><div class="ladder-axis" aria-hidden="true"><span>${icon("flag", 13)} Xuất phát</span><span>Tiến bộ qua từng cấp độ</span><span>${icon("trophy", 13)} Đích đến</span></div><div class="journey-outcome"><span>${icon("leaf", 20)}</span><div><strong>Mỗi bậc là một bước tiến của con</strong><p>Từ làm quen ngôn ngữ đến phản xạ, giao tiếp tự tin và nền tảng YCT vững chắc.</p></div>${htmlLink(`<span>Xem lộ trình chi tiết</span>${icon("arrow", 14)}`, "/lo-trinh", "arrow-link")}</div></div>`;
}

function rhythmCards() {
  return `<div class="learning-flow"><article><span class="flow-icon">${icon("book", 25)}</span><div><small>01</small><h3>Học</h3><p>Khám phá kiến thức qua Nghe, Nói, Đọc, Viết.</p></div></article><span class="flow-arrow">${icon("arrow", 20)}</span><article><span class="flow-icon orange">${icon("star", 25)}</span><div><small>02</small><h3>Ôn tập</h3><p>Củng cố qua trò chơi và bài tập.</p></div></article><span class="flow-arrow">${icon("arrow", 20)}</span><article><span class="flow-icon blue">${icon("chart", 25)}</span><div><small>03</small><h3>Đánh giá</h3><p>Ghi nhận tiến bộ theo từng kỹ năng.</p></div></article></div>`;
}

function teacherCard(teacher, compact = false) {
  return `<a class="teacher-card${compact ? " compact" : ""}" href="/giao-vien/${teacher.id}"><div class="teacher-photo"><img src="${teacher.avatar}" alt="Giáo viên ${escapeHTML(teacher.name)}" loading="lazy"><span>${icon("graduation", 16)}</span></div><div class="teacher-copy"><p>${escapeHTML(teacher.role)}</p><h3>${escapeHTML(teacher.name)}</h3><div class="teacher-badges">${teacher.badges.slice(0, compact ? 2 : 3).map((badge) => `<span>${escapeHTML(badge)}</span>`).join("")}</div>${compact ? "" : `<p class="teacher-experience">${escapeHTML(teacher.experience)}</p>`}<span class="teacher-more">Xem thông tin giáo viên ${icon("arrow", 13)}</span></div></a>`;
}

function teacherShowcase(limit = 6) {
  return `<div class="teacher-strip">${teachersData.slice(0, limit).map((teacher) => teacherCard(teacher, true)).join("")}</div>`;
}

function finder() {
  return `<div class="finder" data-finder><div class="finder-panel"><div class="finder-progress" aria-hidden="true"><span class="progress-dot active" data-progress="1"></span><span class="progress-dot" data-progress="2"></span></div><p class="finder-question" data-finder-question>Con đã từng học tiếng Trung chưa?</p><div class="choice-grid" data-finder-choices></div><div class="finder-result" data-finder-result aria-live="polite"></div></div><div class="finder-story"><figure class="finder-scene"><img src="/assets/brand/classroom-learning-v1.png" alt="Giáo viên và trẻ cùng học trong lớp nhỏ" loading="lazy"><figcaption><strong>Đồng hành cùng con</strong><span>Chọn đúng điểm bắt đầu</span></figcaption></figure><div class="finder-steps"><div class="mini-step"><span class="mini-step-number">01</span><div><h3>Nền tảng</h3><p>Đã học hay chưa</p></div></div><div class="mini-step"><span class="mini-step-number">02</span><div><h3>Cấp độ</h3><p>YCT gần nhất</p></div></div><div class="mini-step"><span class="mini-step-number">03</span><div><h3>Lớp học</h3><p>Theo độ tuổi và lịch học</p></div></div></div></div></div>`;
}

function progressPreview() {
  return `<div class="progress-preview"><div class="report-card"><div class="report-header"><div><strong>Theo dõi tiến bộ của con</strong><small>Qua từng nội dung học</small></div><span class="report-badge">Tiến bộ của con</span></div><div class="report-row"><span class="report-number">01</span><div><strong>Nội dung đã học</strong><span>Những chủ đề và buổi học con đã hoàn thành</span></div><span class="report-state">Đã học</span></div><div class="report-row"><span class="report-number">02</span><div><strong>Nội dung đang ôn tập</strong><span>Những phần con đang cần củng cố</span></div><span class="report-state">Ôn tập</span></div><div class="report-row"><span class="report-number">03</span><div><strong>Chặng tiếp theo</strong><span>Nội dung tiếp nối trong lộ trình YCT</span></div><span class="report-state">Tiếp theo</span></div></div><div><p class="eyebrow">TIẾN BỘ CỦA CON</p><h2>Phụ huynh theo dõi cả quá trình, không chỉ kết quả cuối.</h2><p class="lede">Bamboo ghi nhận nội dung đã học, phần cần ôn tập, kết quả đánh giá và phản hồi trong từng giai đoạn.</p>${link("Xem cách Bamboo ghi nhận tiến bộ", "/tien-bo-cua-con", "arrow-link")}</div></div>`;
}

function priceCards() {
  return `<div class="price-grid">${courses.map((course, index) => `<article class="price-card ${index === 0 ? "featured" : ""}"><div class="price-sprout" aria-hidden="true"><span></span><span></span><span></span></div><div class="price-card-top"><h3>YCT${course.level}</h3>${index === 0 ? `<span class="tag">Bắt đầu</span>` : ""}</div><p>${course.duration.totalSessions} buổi · lớp trực tuyến tối đa ${course.classSize.maxOnline} bạn</p><div class="price-value promo-price${initialPromoState()}" ${promoAttributes(course)}><del data-original-price>${formatPrice(course.pricing.listPrice)}</del><div class="price-discount" data-current-price>${formatPrice(discountedPrice(course))}</div><small class="promo-countdown" data-promo-countdown></small></div>${link("Xem khóa học", levelPath(course.level), "button secondary small")}</article>`).join("")}</div>`;
}

function schedulePage() {
  return shell(`${pageHero("LỊCH KHAI GIẢNG", "Lịch lớp Bamboo Chinese", "Các lớp YCT1–YCT6 sắp mở.", "曆")}
    <section class="section schedule-section"><div class="container"><div class="schedule-intro"><div><p class="eyebrow">LỚP SẮP MỞ</p><h2>Chọn lịch học<br>phù hợp.</h2></div><div class="schedule-intro-note"><span>${icon("calendar", 23)}</span><p>Lọc theo ngày, cơ sở và giáo viên.</p></div></div>
      <div class="schedule-board" data-schedule-board>
        <div class="schedule-filters" aria-label="Bộ lọc lịch khai giảng">
          <label><span>Từ ngày</span><div class="schedule-control">${icon("calendar", 15)}<input type="date" data-schedule-from></div></label>
          <label><span>Đến ngày</span><div class="schedule-control">${icon("calendar", 15)}<input type="date" data-schedule-to></div></label>
          <label><span>Cơ sở</span><div class="schedule-control">${icon("location", 15)}<select data-schedule-campus><option value="all">Tất cả cơ sở</option></select></div></label>
          <label><span>Giáo viên</span><div class="schedule-control">${icon("graduation", 15)}<select data-schedule-teacher><option value="all">Tất cả giáo viên</option></select></div></label>
          <button class="button primary schedule-reset" type="button" data-schedule-reset>${icon("arrow", 14)}<span>Đặt lại</span></button>
        </div>
        <div class="schedule-content" data-schedule-content><div class="schedule-loading"><span>${icon("calendar", 26)}</span><strong>Đang cập nhật lịch lớp…</strong></div></div>
        <p class="schedule-count" data-schedule-count></p>
      </div>
    </div></section>
    <section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">THÔNG TIN CẦN BIẾT</p><h2>Chọn lịch học cho con dễ dàng hơn.</h2></div><div class="schedule-faq">
      <details open><summary>Khi nào Bamboo cập nhật lịch mới?</summary><p>Khi lớp mới sẵn sàng nhận học viên.</p></details>
      <details><summary>Chưa có khung giờ phù hợp?</summary><p>Gửi khung giờ mong muốn để Bamboo tư vấn lớp gần nhất.</p></details>
      <details><summary>Trực tuyến và trực tiếp khác nhau thế nào?</summary><p>Cùng lộ trình YCT, khác sĩ số và cách tổ chức lớp.</p></details>
    </div></div></section>
    <section class="section compact"><div class="container"><div class="cta-banner"><p class="eyebrow">CHƯA THẤY LỊCH PHÙ HỢP?</p><h2>Gửi khung giờ mong muốn.</h2>${htmlLink(`${icon("message", 16)}<span>Tìm lớp cho con</span>`, "/tim-lop-cho-con", "button light")}</div></div></section>`);
}

function parseScheduleCsv(csv) {
  const parsed = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') { cell += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && csv[index + 1] === "\n") index += 1;
      row.push(cell); parsed.push(row); row = []; cell = "";
    } else cell += character;
  }
  if (cell || row.length) { row.push(cell); parsed.push(row); }
  const headers = parsed.shift()?.map((value) => value.trim()) || [];
  return parsed.map((values) => Object.fromEntries(headers.map((header, index) => [header, (values[index] || "").trim()])))
    .filter((item) => item["Hiển thị"].toLowerCase() === "có" && item["Mã lớp"] && item["Ngày khai giảng"]);
}

function scheduleDateValue(value) {
  const match = String(value || "").match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/);
  if (!match) return Number.NaN;
  return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1])).getTime();
}

function scheduleStatusClass(status) {
  if (status === "Đã đủ") return "full";
  if (status === "Gần đủ") return "nearly-full";
  return "available";
}

function scheduleStatusLabel(status) {
  if (status === "Đã đủ") return "Hết chỗ";
  if (status === "Gần đủ") return "Gần hết chỗ";
  return "Còn chỗ";
}

function scheduleTable(rows) {
  if (!rows.length) return `<div class="schedule-empty"><span>${icon("calendar", 28)}</span><h3>Lịch mới đang được cập nhật</h3><p>Chưa có lớp phù hợp với bộ lọc hiện tại.</p>${link("Tìm lớp theo nhu cầu", "/tim-lop-cho-con", "button primary")}</div>`;
  return `<div class="schedule-table-wrap"><table class="schedule-table"><thead><tr><th>Khóa học</th><th>Địa điểm</th><th>Mã lớp</th><th>Giáo viên</th><th>Lịch học</th><th>Ngày khai giảng</th><th>Trạng thái</th><th>Đăng ký</th></tr></thead><tbody>${rows.map((row) => {
    const classCode = row["Mã lớp"];
    const courseName = row["Khóa học"];
    const href = `/tim-lop-cho-con?lop=${encodeURIComponent(classCode)}&khoa=${encodeURIComponent(courseName)}`;
    return `<tr><td><strong>${escapeHTML(courseName)}</strong><span>${escapeHTML(row["Hình thức"])}</span></td><td><strong>${escapeHTML(row["Cơ sở"])}</strong></td><td><strong>${escapeHTML(classCode)}</strong></td><td>${escapeHTML(row["Giảng viên"])}</td><td><strong class="schedule-days">${escapeHTML(row["Ngày học"])}</strong><span>${escapeHTML(row["Giờ học"])}</span></td><td><strong>${escapeHTML(row["Ngày khai giảng"])}</strong></td><td><span class="schedule-status ${scheduleStatusClass(row["Trạng thái"])}">${scheduleStatusLabel(row["Trạng thái"])}</span></td><td>${link(row["Trạng thái"] === "Đã đủ" ? "Nhận lịch mới" : "Đăng ký", href, "schedule-register")}</td></tr>`;
  }).join("")}</tbody></table></div>`;
}

function home() {
  return shell(`
    <section class="hero"><div class="container"><div class="hero-grid"><div class="hero-copy"><p class="hero-badge">${icon("star", 14)} TIẾNG TRUNG CHO TRẺ 6-12 TUỔI</p><h1>Học là vui.<br><span>Vui là nhớ.</span></h1><p class="lede">Lộ trình YCT1–YCT6 phát triển đồng đều Nghe, Nói, Đọc, Viết.</p><div class="hero-actions">${htmlLink(`${icon("message", 17)}<span>Tìm lớp cho con</span>`, "/tim-lop-cho-con", "button primary")}${htmlLink(`<span>Khám phá khóa học</span>${icon("arrow", 15)}`, "/lo-trinh", "button secondary")}</div></div><div class="hero-visual"><img src="/assets/brand/cover.jpg" alt="Học sinh Bamboo Chinese học cùng giáo trình YCT" loading="eager"></div></div><div class="hero-bottom"><div class="hero-benefits"><div>${icon("users", 19)}<span><strong>Lớp nhỏ</strong>6–8 bạn</span></div><div>${icon("book", 19)}<span><strong>Giáo trình</strong>YCT chuẩn</span></div><div>${icon("chart", 19)}<span><strong>Tiến bộ</strong>Theo từng chặng</span></div><div>${icon("graduation", 19)}<span><strong>Giáo viên</strong>Thông tin đầy đủ</span></div></div><p class="hero-note"><span></span>Phát triển bởi MXiao Chinese</p></div></div></section>
    <section class="section course-section"><div class="container"><div class="split-heading"><div><p class="eyebrow">LỘ TRÌNH PHÁT TRIỂN YCT1–YCT6</p><h2>Mỗi cấp độ,<br>một bước tiến của con.</h2></div><p>Sáu cấp độ từ làm quen đến giao tiếp tự tin.</p></div>${developmentJourney()}</div></section>
    <section class="schedule-home"><div class="container"><div class="schedule-home-card"><span class="schedule-home-icon">${icon("calendar", 28)}</span><div><p class="eyebrow">LỊCH KHAI GIẢNG</p><h2>Chọn lịch học phù hợp.</h2><p>Xem các lớp sắp mở theo cấp độ và khung giờ.</p></div>${htmlLink(`<span>Xem lịch khai giảng</span>${icon("arrow", 14)}`, "/lich-khai-giang", "button light")}</div></div></section>
    <section class="method-section"><div class="container"><div class="split-heading light"><div><p class="eyebrow">CÁCH BAMBOO DẠY</p><h2>Ba bước giúp con học chắc và tiến bộ đều.</h2></div>${link("Xem phương pháp học", "/cach-bamboo-day", "text-link-light")}</div>${rhythmCards()}</div></section>
    <section class="section finder-section"><div class="container"><div class="section-heading"><p class="eyebrow">TÌM ĐIỂM BẮT ĐẦU</p><h2>Con nên bắt đầu ở YCT nào?</h2><p class="lede">Chọn theo độ tuổi và nền tảng của con.</p></div>${finder()}</div></section>
    <section class="teacher-section"><div class="container"><div class="split-heading"><div><p class="eyebrow">ĐỘI NGŨ GIÁO VIÊN</p><h2>Giáo viên tận tâm,<br>chuyên môn vững vàng.</h2></div><p>Xem kinh nghiệm, chứng chỉ và thế mạnh giảng dạy.</p></div>${teacherShowcase(6)}<div class="section-action">${htmlLink(`<span>Xem toàn bộ giáo viên</span>${icon("arrow", 14)}`, "/giao-vien", "button secondary")}</div></div></section>
    <section class="value-strip"><div class="container value-grid"><div>${icon("headphones", 22)}<span><strong>Nghe</strong>Làm quen âm thanh</span></div><div>${icon("message", 22)}<span><strong>Nói</strong>Tăng phản xạ</span></div><div>${icon("book", 22)}<span><strong>Đọc</strong>Hiểu nội dung</span></div><div>${icon("pen", 22)}<span><strong>Viết</strong>Nhớ mặt chữ</span></div></div></section>
    <section class="section compact"><div class="container"><div class="cta-banner"><p class="eyebrow">BẮT ĐẦU CÙNG BAMBOO</p><h2>Chưa chắc con nên học khóa nào?</h2>${htmlLink(`${icon("message", 16)}<span>Tìm lớp cho con</span>`, "/tim-lop-cho-con", "button light")}</div></div></section>`);
}

function learningPath() {
  return shell(`${pageHero("LỘ TRÌNH HỌC", "Từ YCT1 đến YCT6", "Sáu cấp độ nối tiếp trong một hành trình.", "路")}
    <section class="section compact"><div class="container"><div class="section-heading"><p class="eyebrow">TÌM ĐIỂM BẮT ĐẦU</p><h2>Con đang ở đâu trên hành trình?</h2><p class="lede">Chọn theo nền tảng hiện tại.</p></div>${finder()}</div></section>
    <section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">HÀNH TRÌNH YCT</p><h2>Sáu cấp độ trong một lộ trình liền mạch.</h2></div>${yctJourney()}</div></section>
    <section class="section"><div class="container"><div class="section-heading"><p class="eyebrow">SO SÁNH NHANH</p><h2>Thông tin chính của từng cấp độ.</h2></div><div class="compare-grid">${courses.map((course) => `<article class="compare-card"><h3>YCT${course.level}</h3><dl><dt>Tổng số buổi</dt><dd>${course.duration.totalSessions}</dd><dt>Ôn tập</dt><dd>${course.duration.reviewSessions} buổi</dd><dt>Đánh giá</dt><dd>${course.duration.assessmentSessions} buổi</dd></dl></article>`).join("")}</div></div></section>
    <section class="section soft"><div class="container"><div class="section-heading center"><p class="eyebrow">CẤU TRÚC CHƯƠNG TRÌNH</p><h2>Học – Ôn tập – Đánh giá</h2></div>${rhythmCards()}</div></section>
    <section class="section"><div class="container"><div class="section-heading"><p class="eyebrow">HỌC PHÍ</p><h2>Thông tin giá theo từng cấp độ.</h2></div>${priceCards()}</div></section>
    <section class="section compact"><div class="container"><div class="cta-banner"><p class="eyebrow">CẦN THÊM GỢI Ý?</p><h2>Tìm lớp phù hợp với nền tảng hiện tại của con.</h2>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button light")}</div></div></section>`);
}

function curriculumSessions(course) {
  return `<ol class="curriculum-list">${course.curriculum.map((session) => `<li class="session"><span class="session-number">Buổi ${session.session}</span><div class="session-title"><span lang="zh">${escapeHTML(session.titleZh)}</span><strong>${escapeHTML(session.titleVi)}</strong></div></li>`).join("")}</ol>`;
}

function coursePage(course) {
  const previous = courses.find((item) => item.level === course.level - 1);
  const next = courses.find((item) => item.level === course.level + 1);
  const entry = course.level === 1 ? "Chưa từng học tiếng Trung" : `Hoàn thành lộ trình YCT${course.level - 1}`;
  const outcome = course.level === 6 ? "Hoàn thiện nền tảng YCT" : `Sẵn sàng bước tiếp lên YCT${course.level + 1}`;
  const highlights = [
    `${course.duration.totalSessions} buổi theo đúng lộ trình`,
    `Phát triển bốn kỹ năng Nghe - Nói - Đọc - Viết`,
    `Giáo trình YCT${course.level} chuẩn, chủ đề gần gũi với trẻ`,
    `Lớp nhỏ tối đa ${course.classSize.maxOnline} bạn trực tuyến, ${course.classSize.maxOffline} bạn trực tiếp`,
    "Ôn tập và đánh giá trong chương trình",
    "Dễ theo dõi nội dung đã học",
  ];
  return shell(`<div class="course-detail level-${course.level}">
    <section class="course-detail-hero"><div class="container"><div class="breadcrumb">${link("Trang chủ", "/")}<span>›</span>${link("Khóa học", "/lo-trinh")}<span>›</span><span>YCT${course.level}</span></div><div class="course-detail-hero-grid"><div class="course-detail-hero-copy"><p class="eyebrow">LỘ TRÌNH TIẾNG TRUNG TRẺ EM</p><h1>Khóa học YCT${course.level}</h1><p class="lede">${course.duration.totalSessions} buổi phát triển Nghe – Nói – Đọc – Viết.</p><div class="course-actions">${htmlLink(`${icon("calendar", 16)}<span>Xem lịch khai giảng</span>`, "/lich-khai-giang", "button primary")}${link("Tìm lớp cho con", "/tim-lop-cho-con", "button secondary")}</div></div><div class="course-book-visual"><span class="book-standard">GIÁO TRÌNH CHUẨN</span><span class="book-level">YCT${course.level}</span><img src="${courseBook(course.level)}" alt="Giáo trình YCT${course.level}" loading="eager"></div></div></div></section>
    <section class="course-overview"><div class="container"><div class="course-section-title"><p class="eyebrow">TỔNG QUAN</p><h2>Thông tin khóa học</h2></div><div class="course-detail-layout"><div class="course-main-column">
      <article class="course-panel course-info-panel"><h3>Điểm bắt đầu và kết quả sau khóa học</h3><div class="course-stat-grid"><div><span class="course-stat-icon">${icon("flag", 18)}</span><small>TRƯỚC KHÓA HỌC</small><strong>${escapeHTML(entry)}</strong></div><div><span class="course-stat-icon">${icon("trophy", 18)}</span><small>SAU KHÓA HỌC</small><strong>${escapeHTML(outcome)}</strong></div><div><span class="course-stat-icon">${icon("calendar", 18)}</span><small>SỐ BUỔI</small><strong>${course.duration.totalSessions} buổi</strong></div><div><span class="course-stat-icon">${icon("users", 18)}</span><small>SĨ SỐ</small><strong>${course.classSize.maxOnline}–${course.classSize.maxOffline} bạn</strong></div></div><div class="course-skills"><p>BỐN KỸ NĂNG TRONG KHÓA HỌC</p><div><span>${icon("headphones", 14)} Nghe</span><span>${icon("message", 14)} Nói</span><span>${icon("book", 14)} Đọc</span><span>${icon("pen", 14)} Viết</span></div></div></article>
      <article class="course-price-card course-price-mobile promo-price${initialPromoState()}" ${promoAttributes(course)}><p data-promo-label>HỌC PHÍ ƯU ĐÃI</p><del data-original-price>${formatPrice(course.pricing.listPrice)}</del><strong data-current-price>${formatPrice(discountedPrice(course))}</strong>${promoClock("course-promo-clock")}${htmlLink(`<span>Nhận tư vấn khóa học</span>${icon("arrow", 14)}`, "/tim-lop-cho-con", "button light full")}</article>
      <article class="course-panel course-highlights"><h3>Điểm nổi bật</h3><div class="highlight-list">${highlights.map((item) => `<div>${icon("check", 14)}<span>${escapeHTML(item)}</span></div>`).join("")}</div></article>
      <article class="course-panel course-curriculum"><div class="course-panel-heading"><div><p class="eyebrow">NỘI DUNG YCT${course.level}</p><h3>Lộ trình buổi học</h3></div><span>${course.duration.totalSessions} BUỔI</span></div>${curriculumSessions(course)}</article>
    </div><aside class="course-side-column"><article class="course-price-card promo-price${initialPromoState()}" ${promoAttributes(course)}><p data-promo-label>HỌC PHÍ ƯU ĐÃI</p><del data-original-price>${formatPrice(course.pricing.listPrice)}</del><strong data-current-price>${formatPrice(discountedPrice(course))}</strong>${promoClock("course-promo-clock")}${htmlLink(`<span>Nhận tư vấn khóa học</span>${icon("arrow", 14)}`, "/tim-lop-cho-con", "button light full")}</article><article class="course-panel course-gifts"><p class="eyebrow">ĐI KÈM KHÓA HỌC</p><h3>Giáo trình và học cụ</h3><div class="gift-list"><div>${icon("check", 14)}<span>Giáo trình chuẩn YCT${course.level}</span></div><div>${icon("check", 14)}<span>Vở viết chữ Hán và dụng cụ học tập</span></div><div>${icon("check", 14)}<span>Tài liệu ôn tập</span></div><div>${icon("check", 14)}<span>Phản hồi học tập</span></div></div></article><article class="course-panel course-commitment"><span class="commitment-icon">${icon("shield", 24)}</span><div><h3>Theo sát từng buổi học</h3><p>Giáo viên ghi nhận nội dung con đã học trong suốt khóa.</p></div></article></aside></div></div></section>
    <section class="course-method"><div class="container course-method-grid"><div><p class="eyebrow">CÁCH BAMBOO DẠY</p><h2>Học qua tương tác và thực hành.</h2><p class="lede">Mỗi buổi ${course.duration.minutesPerSession || 90} phút tạo cơ hội để trẻ nghe, nói, đọc và viết ngay trong lớp nhỏ.</p>${link("Xem phương pháp học", "/cach-bamboo-day", "button secondary")}</div><div class="method-chip-grid"><div>${icon("headphones", 22)}<span><strong>Nghe</strong>Nhận diện âm thanh</span></div><div>${icon("message", 22)}<span><strong>Nói</strong>Tăng phản xạ</span></div><div>${icon("book", 22)}<span><strong>Đọc</strong>Hiểu chủ đề</span></div><div>${icon("pen", 22)}<span><strong>Viết</strong>Nhớ mặt chữ</span></div></div></div></section>
    <section class="section course-faq-section"><div class="container"><div class="course-section-title"><p class="eyebrow">GIẢI ĐÁP</p><h2>Câu hỏi thường gặp về YCT${course.level}</h2></div><div class="course-faq-list"><details open><summary>Khóa YCT${course.level} phù hợp với ai?</summary><p>Khóa học phù hợp với trẻ 6–12 tuổi và ${escapeHTML(entry.toLowerCase())}.</p></details><details><summary>Khóa học có bao nhiêu buổi?</summary><p>Khóa YCT${course.level} gồm ${course.duration.totalSessions} buổi, mỗi buổi ${course.duration.minutesPerSession || 90} phút.</p></details><details><summary>Sĩ số lớp được tổ chức như thế nào?</summary><p>Lớp trực tuyến tối đa ${course.classSize.maxOnline} bạn; lớp trực tiếp tối đa ${course.classSize.maxOffline} bạn để giáo viên có thời gian tương tác với từng trẻ.</p></details><details><summary>Con sẽ học bằng tài liệu gì?</summary><p>Trẻ học theo giáo trình chuẩn YCT${course.level}, cùng học cụ và tài liệu ôn tập phù hợp với chương trình.</p></details></div></div></section>
    <section class="course-teachers"><div class="container"><div class="split-heading"><div><p class="eyebrow">GIÁO VIÊN</p><h2>Đội ngũ đồng hành cùng con.</h2></div>${link("Xem toàn bộ giáo viên", "/giao-vien", "button secondary")}</div>${teacherShowcase(3)}</div></section>
    <section class="section course-lead"><div class="container"><div class="course-section-title"><p class="eyebrow">ĐĂNG KÝ TƯ VẤN</p><h2>Nhận tư vấn về YCT${course.level}</h2></div><div class="course-lead-grid"><div class="course-lead-copy"><span>${icon("leaf", 26)}</span><h3>Chọn đúng điểm bắt đầu.</h3><p>Theo độ tuổi, nền tảng và hình thức học.</p><div class="course-nav">${previous ? `<a class="course-nav-card" href="${levelPath(previous.level)}"><small>Khóa trước</small><strong>← YCT${previous.level}</strong></a>` : `<a class="course-nav-card" href="/lo-trinh"><small>Điểm bắt đầu</small><strong>Tổng quan lộ trình</strong></a>`}${next ? `<a class="course-nav-card next" href="${levelPath(next.level)}"><small>Khóa tiếp theo</small><strong>YCT${next.level} →</strong></a>` : `<a class="course-nav-card next" href="/lo-trinh"><small>Hoàn thành</small><strong>Xem toàn bộ lộ trình</strong></a>`}</div></div>${contactForm()}</div></div></section>
  </div>`);
}

function editorialPage(kind) {
  if (kind === "teach") return shell(`${pageHero("CÁCH BAMBOO DẠY", "Học thế nào tại Bamboo?", "Học, ôn tập và đánh giá theo từng cấp độ.", "學")}<section class="section"><div class="container"><div class="section-heading"><p class="eyebrow">MỘT BUỔI HỌC</p><h2>Tương tác, thực hành và lặp lại.</h2></div><div class="editorial-grid"><article class="editorial-card"><div class="editorial-icon">聽</div><h3>Nghe và nói</h3><p>Nhận diện âm thanh, luyện phản xạ.</p></article><article class="editorial-card"><div class="editorial-icon">讀</div><h3>Đọc và viết</h3><p>Đọc hiểu và viết theo từng chủ đề.</p></article><article class="editorial-card"><div class="editorial-icon">小</div><h3>Lớp nhỏ</h3><p>6 bạn trực tuyến, 8 bạn trực tiếp.</p></article></div></div></section><section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">NHỊP HỌC</p><h2>Học - Ôn tập - Đánh giá</h2></div>${rhythmCards()}</div></section><section class="section compact"><div class="container"><div class="cta-banner"><p class="eyebrow">BẮT ĐẦU TỪ ĐÂY</p><h2>Chọn lộ trình phù hợp cho con.</h2>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button light")}</div></div></section>`);
  if (kind === "progress") return shell(`${pageHero("TIẾN BỘ CỦA CON", "Tiến bộ của con", "Theo dõi nội dung học, ôn tập và bước tiếp theo.", "進")}<section class="section"><div class="container">${progressPreview()}</div></section><section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">BỐN KỸ NĂNG</p><h2>Tiến bộ qua từng chặng.</h2></div><div class="editorial-grid"><article class="editorial-card"><div class="number">01</div><h3>Nghe</h3><p>Tiếp nhận và củng cố nội dung.</p></article><article class="editorial-card"><div class="number">02</div><h3>Nói</h3><p>Thực hành và tăng phản xạ.</p></article><article class="editorial-card"><div class="number">03</div><h3>Đọc - Viết</h3><p>Phát triển theo lộ trình YCT.</p></article></div></div></section><section class="section compact"><div class="container"><div class="cta-banner"><p class="eyebrow">CẦN TƯ VẤN</p><h2>Chọn bước tiếp theo cho con.</h2>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button light")}</div></div></section>`);
  return shell(`${pageHero("VỀ BAMBOO", "Bamboo Chinese là gì?", "Tiếng Trung cho trẻ 6-12 tuổi, phát triển bởi MXiao Chinese.", "竹")}<section class="section"><div class="container about-grid"><div class="about-image"><img src="/assets/brand-visual-reference.png" alt="Không gian hình ảnh Bamboo Chinese" loading="lazy"></div><div class="about-copy"><p class="eyebrow">BAMBOO CHINESE × MXIAO CHINESE</p><h2>Chuyên môn vững vàng, trải nghiệm dành riêng cho trẻ.</h2><p>Lộ trình YCT liền mạch, lớp nhỏ và phương pháp phù hợp với lứa tuổi.</p>${link("Xem lộ trình YCT", "/lo-trinh", "button primary")}</div></div></section><section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">KHÔNG GIAN BAMBOO</p><h2>Không gian tươi sáng, ấm áp và gần gũi với trẻ.</h2></div></div></section>`);
}

function parentCorner() {
  const categories = ["Bắt đầu học tiếng Trung", "Tìm hiểu về YCT", "Đồng hành cùng con", "Theo dõi tiến bộ"];
  return shell(`${pageHero("GÓC PHỤ HUYNH", "Những điều phụ huynh muốn biết", "Các chủ đề để gia đình bắt đầu tìm hiểu trước khi chọn lộ trình cho con.", "家")}<section class="section"><div class="container"><div class="article-categories">${categories.map((category, index) => `<div class="category-card"><span>0${index + 1}</span><h3>${category}</h3></div>`).join("")}</div></div></section><section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">NỘI DUNG ĐỒNG HÀNH</p><h2>Giải đáp điều gia đình quan tâm.</h2><p class="lede">Những chia sẻ ngắn gọn giúp phụ huynh hiểu YCT, chọn điểm bắt đầu và đồng hành cùng con trong quá trình học.</p></div><div class="cta-banner"><p class="eyebrow">ĐÃ SẴN SÀNG TÌM HIỂU?</p><h2>Khám phá lộ trình YCT1–YCT6.</h2>${link("Xem lộ trình", "/lo-trinh", "button light")}</div></div></section>`);
}

function articlePage() {
  return shell(`${pageHero("BÀI VIẾT", "Bài viết cho phụ huynh", "Những nội dung giúp gia đình hiểu cách bắt đầu và đồng hành cùng hành trình tiếng Trung của con.", "文")}<section class="section"><div class="container not-found"><div><p class="eyebrow">BAMBOO CHINESE</p><h2>Bắt đầu từ điều phụ huynh quan tâm.</h2><p class="lede" style="margin:18px auto 0">Khám phá lộ trình và cách Bamboo tổ chức việc học trước khi chọn bước tiếp theo cho con.</p>${link("Xem cách Bamboo dạy", "/cach-bamboo-day", "button primary")}</div></div></section>`);
}

function teachers(path) {
  const id = path.split("/").filter(Boolean)[1];
  if (id) {
    const teacher = teachersData.find((item) => item.id === id);
    if (!teacher) return shell(`${pageHero("GIÁO VIÊN", "Không tìm thấy thông tin giáo viên", "Hãy quay lại danh sách để tiếp tục tìm hiểu đội ngũ giáo viên.", "師")}<section class="section compact"><div class="container section-action">${link("Về trang giáo viên", "/giao-vien", "button primary")}</div></section>`);
    return shell(`${pageHero("THÔNG TIN GIÁO VIÊN", teacher.name, teacher.role, "師")}<section class="section"><div class="container teacher-profile"><div class="teacher-profile-photo"><img src="${teacher.avatar}" alt="Giáo viên ${escapeHTML(teacher.name)}"></div><div class="teacher-profile-copy"><p class="eyebrow">KINH NGHIỆM VÀ THẾ MẠNH</p><h2>${escapeHTML(teacher.experience)}</h2><p class="lede">${escapeHTML(teacher.shortBio)}</p><div class="teacher-badges large">${teacher.badges.map((badge) => `<span>${escapeHTML(badge)}</span>`).join("")}</div><h3>Thế mạnh giảng dạy</h3><ul class="strength-list">${teacher.strengths.map((strength) => `<li>${icon("check", 13)} ${escapeHTML(strength)}</li>`).join("")}</ul>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button primary")}</div></div></section><section class="section compact tint"><div class="container section-action">${link("← Xem toàn bộ giáo viên", "/giao-vien", "arrow-link")}</div></section>`);
  }
  return shell(`${pageHero("ĐỘI NGŨ GIÁO VIÊN", "Người đồng hành cùng con", "Kinh nghiệm, chứng chỉ và thế mạnh giảng dạy.", "師")}<section class="section"><div class="container"><div class="split-heading"><div><p class="eyebrow">THÔNG TIN GIÁO VIÊN</p><h2>Tìm hiểu đội ngũ đồng hành cùng con.</h2></div><p>Kinh nghiệm và thế mạnh của từng giáo viên.</p></div><div class="teacher-grid">${teachersData.map((teacher) => teacherCard(teacher)).join("")}</div></div></section><section class="section compact"><div class="container"><div class="cta-banner"><p class="eyebrow">CẦN GỢI Ý LỚP HỌC?</p><h2>Chọn điểm bắt đầu cho con.</h2>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button light")}</div></div></section>`);
}

function contactForm() {
  const query = new URLSearchParams(window.location.search);
  const scheduleClass = query.get("lop") || "";
  const scheduleCourse = query.get("khoa") || "";
  const interestNotice = scheduleClass ? `<div class="form-interest">${icon("calendar", 15)}<span>Lớp gia đình đang quan tâm: <strong>${escapeHTML(scheduleClass)}</strong>${scheduleCourse ? ` · ${escapeHTML(scheduleCourse)}` : ""}</span></div>` : "";
  return `<form class="form-card" data-lead-form novalidate><input type="hidden" name="brand" value="bamboo"><input type="hidden" name="formType" value="course-interest"><input type="hidden" name="sourcePage" value="${escapeHTML(currentPath())}"><input type="hidden" name="scheduleClass" value="${escapeHTML(scheduleClass)}"><input type="hidden" name="scheduleCourse" value="${escapeHTML(scheduleCourse)}"><input class="honeypot" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">${interestNotice}<p class="form-section-title">Thông tin về con</p><div class="form-grid"><div class="field"><label for="child-age">Tuổi của con</label><select id="child-age" name="childAge" required><option value="">Chọn độ tuổi</option><option>6–7 tuổi</option><option>8–9 tuổi</option><option>10–12 tuổi</option></select></div><div class="field"><label for="prior-learning">Con đã từng học tiếng Trung?</label><select id="prior-learning" name="priorLearning" data-prior-learning required><option value="">Chọn một phương án</option><option value="Rồi">Rồi</option><option value="Chưa">Chưa</option></select></div><div class="field full" data-level-field hidden><label for="previous-level">Cấp độ gần nhất</label><select id="previous-level" name="previousLevel" data-previous-level><option value="">Chọn cấp độ gần nhất</option>${courses.map((course) => `<option>YCT${course.level}</option>`).join("")}<option value="Không nhớ">Không nhớ</option><option value="Khác">Khác</option></select></div><div class="field full" data-other-level-field hidden><label for="other-level">Cấp độ hoặc chương trình đã học</label><input id="other-level" name="otherLevel" data-other-level maxlength="200" placeholder="Ví dụ: HSK 1 hoặc giáo trình khác"></div><div class="field full"><label for="learning-mode">Hình thức học</label><select id="learning-mode" name="learningMode" required><option value="">Chọn hình thức</option><option>Trực tuyến</option><option>Trực tiếp</option><option>Chưa quyết định</option></select></div></div><hr class="form-divider"><p class="form-section-title">Thông tin phụ huynh</p><div class="form-grid"><div class="field"><label for="parent-name">Tên phụ huynh</label><input id="parent-name" name="parentName" autocomplete="name" required maxlength="80"></div><div class="field"><label for="parent-phone">Số điện thoại</label><input id="parent-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="20"></div><div class="field full"><label for="parent-email">Thư điện tử <span class="muted">(tùy chọn)</span></label><input id="parent-email" name="email" type="email" autocomplete="email" maxlength="120"></div><div class="field full"><label for="parent-note">Nội dung cần trao đổi <span class="muted">(tùy chọn)</span></label><textarea id="parent-note" name="note" maxlength="300" placeholder="Nhu cầu của gia đình"></textarea></div></div><div class="form-error" data-form-error role="alert"></div><div class="form-success" data-form-success role="status">Bamboo đã nhận thông tin và sẽ sớm liên hệ.</div><button class="button primary full" type="submit">Gửi thông tin</button></form>`;
}

function leadPage() {
  return shell(`${pageHero("TÌM LỚP CHO CON", "Bắt đầu hành trình của con", "Chọn lớp theo độ tuổi và nền tảng tiếng Trung.", "始")}<section class="section"><div class="container form-layout"><div><p class="eyebrow">THÔNG TIN CẦN THIẾT</p><h2>Chọn lớp phù hợp cho con.</h2><div class="contact-list"><div class="contact-item"><span class="contact-icon">01</span><div><strong>Tuổi</strong><span>6-12 tuổi</span></div></div><div class="contact-item"><span class="contact-icon">02</span><div><strong>Nền tảng</strong><span>Đã học hoặc chưa</span></div></div><div class="contact-item"><span class="contact-icon">03</span><div><strong>Hình thức</strong><span>Trực tuyến hoặc trực tiếp</span></div></div></div></div>${contactForm()}</div></section>`);
}

function contactPage() {
  const channels = [
    { icon: "phone", label: "ĐIỆN THOẠI", value: "0877.271.760", href: "tel:0877271760" },
    { icon: "envelope", label: "THƯ ĐIỆN TỬ", value: "info@mxiao.edu.vn", href: "mailto:info@mxiao.edu.vn" },
    { icon: "location", label: "CƠ SỞ ĐỐNG ĐA", value: "A1 Ngõ 15, Phố Vĩnh Hồ, Đống Đa, Hà Nội" },
    { icon: "location", label: "CƠ SỞ PHƯƠNG MAI", value: "Số 4, Ngách 19, Ngõ 167, Phố Phương Mai, Kim Liên, Hà Nội" },
    { icon: "message", label: "MESSENGER", value: "Nhắn tin với MXiao", href: "https://m.me/mxiao.chinese" },
    { icon: "video", label: "TIKTOK", value: "@mxiaochinese.official", href: "https://www.tiktok.com/@mxiaochinese.official" },
  ];
  const channelCards = channels.map((item) => {
    const body = `<span class="contact-channel-icon">${icon(item.icon, 20)}</span><span><small>${item.label}</small><strong>${item.value}</strong></span>`;
    return item.href ? `<a class="contact-channel-card" href="${item.href}"${item.href.startsWith("http") ? ' target="_blank" rel="noreferrer"' : ""}>${body}</a>` : `<div class="contact-channel-card">${body}</div>`;
  }).join("");
  const contactTeam = ["thu-giang.png", "nguyen-ngoc-hoa.png", "nguyen-thi-tho.png"];
  const consultationForm = `<form class="form-card contact-consultation-form" data-lead-form novalidate><input type="hidden" name="brand" value="bamboo"><input type="hidden" name="formType" value="contact-consultation"><input type="hidden" name="sourcePage" value="${escapeHTML(currentPath())}"><input class="honeypot" name="website" tabindex="-1" autocomplete="off" aria-hidden="true"><h3>Đăng ký tư vấn cùng Bamboo</h3><p>Để lại thông tin, Bamboo sẽ tư vấn khóa học phù hợp với nền tảng và mục tiêu của con.</p><p class="form-section-title">Thông tin liên hệ</p><div class="form-grid"><div class="field"><label for="contact-name">Họ và tên</label><input id="contact-name" name="parentName" autocomplete="name" required maxlength="80"></div><div class="field"><label for="contact-phone">Số điện thoại</label><input id="contact-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" required maxlength="20"></div><div class="field full"><label for="contact-email">Thư điện tử</label><input id="contact-email" name="email" type="email" autocomplete="email" maxlength="120"></div></div><p class="form-section-title contact-learning-title">Nhu cầu học tập</p><div class="form-grid"><div class="field"><label for="contact-level">Trình độ hiện tại</label><input id="contact-level" name="currentLevel" maxlength="120"></div><div class="field"><label for="contact-time">Khung giờ mong muốn</label><input id="contact-time" name="preferredTime" maxlength="120"></div><div class="field full"><label for="contact-goal">Mục tiêu học tập</label><textarea id="contact-goal" name="learningGoal" maxlength="500"></textarea></div></div><div class="form-error" data-form-error role="alert"></div><div class="form-success" data-form-success role="status">Bamboo đã nhận thông tin và sẽ sớm liên hệ.</div><button class="button primary full" type="submit">Gửi đăng ký tư vấn</button></form>`;
  const peopleCard = `<div class="contact-people-card"><div class="contact-people-photos">${contactTeam.map((photo, index) => `<img src="/assets/teachers/${photo}" alt="Giáo viên Bamboo ${index + 1}" loading="lazy">`).join("")}</div><div><p class="eyebrow">ĐỘI NGŨ ĐỒNG HÀNH</p><h3>Trao đổi trực tiếp với đội ngũ Bamboo</h3><p>Tư vấn từ 9h đến 21h mỗi ngày.</p></div>${link("Xem đội ngũ giáo viên", "/giao-vien", "arrow-link")}</div>`;
  return shell(`<section class="contact-hero"><div class="container"><div class="breadcrumb">${link("Trang chủ", "/")}<span>›</span><span>Liên hệ</span></div><div class="contact-hero-grid"><div class="contact-hero-copy"><p class="eyebrow">LIÊN HỆ BAMBOO</p><h1>Cùng gia đình chọn đúng lớp cho con.</h1><p>Kết nối với Bamboo qua điện thoại, thư điện tử, mạng xã hội hoặc phiếu đăng ký tư vấn.</p><div class="contact-hero-actions"><a class="button primary" href="tel:0877271760">${icon("phone", 16)}<span>0877.271.760</span></a>${link("Đăng ký tư vấn", "#contact-form", "button secondary")}</div></div><div class="contact-hero-photo"><img src="/assets/brand/classroom-learning-v1.png" alt="Giáo viên đồng hành cùng các bạn nhỏ trong lớp tiếng Trung" loading="eager"><div><strong>Học cùng niềm vui</strong><span>Lớp nhỏ · Theo sát từng bạn</span></div></div></div></div></section>
    <section class="section contact-main-section"><div class="container"><div class="contact-main-grid"><div class="contact-channel-column"><div class="contact-channel-heading"><p class="eyebrow">KÊNH CHÍNH THỨC</p><h2>Liên hệ nhanh với Bamboo</h2></div><div class="contact-channel-list">${channelCards}</div>${peopleCard}</div><div id="contact-form">${consultationForm}</div></div></div></section>
    <section class="section contact-faq-section"><div class="container contact-faq-grid"><div><p class="eyebrow">GIẢI ĐÁP NHANH</p><h2>Những điều phụ huynh thường hỏi trước khi liên hệ</h2></div><div class="contact-faq-list"><details open><summary>Bamboo thường phản hồi đăng ký tư vấn trong bao lâu?</summary><p>Đội ngũ thường phản hồi trong khung giờ từ 9h đến 21h. Nếu gửi thông tin ngoài giờ, Bamboo sẽ liên hệ trong khung giờ làm việc tiếp theo.</p></details><details><summary>Có thể liên hệ với Bamboo bằng cách nào?</summary><p>Phụ huynh có thể gọi điện, gửi thư điện tử hoặc nhắn qua Messenger và Zalo chính thức của MXiao.</p></details><details><summary>Nếu chưa xác định rõ mục tiêu học thì có nên để lại thông tin không?</summary><p>Có. Phụ huynh chỉ cần chia sẻ tình hình hiện tại hoặc thời gian có thể học; đội ngũ tư vấn sẽ hỗ trợ xác định mục tiêu và gợi ý lộ trình phù hợp.</p></details></div></div></section>`);
}

function notFound() {
  return shell(`<section class="not-found"><div><p class="eyebrow">BAMBOO CHINESE</p><h1>Không tìm thấy trang.</h1><p class="lede" style="margin:18px auto 0">Hãy quay lại trang chủ để tiếp tục tìm hiểu.</p>${link("Về trang chủ", "/", "button primary")}</div></section>`);
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
  else if (path === "/lich-khai-giang") { content = schedulePage(); setMeta("Lịch khai giảng", "Xem lịch các lớp YCT1-YCT6 sắp khai giảng tại Bamboo Chinese."); }
  else if (path === "/cach-bamboo-day") { content = editorialPage("teach"); setMeta("Cách Bamboo dạy", "Tìm hiểu cách Bamboo tổ chức một buổi học và nhịp chương trình."); }
  else if (path === "/tien-bo-cua-con") { content = editorialPage("progress"); setMeta("Tiến bộ của con", "Cách Bamboo ghi nhận nội dung học, ôn tập và đánh giá của con."); }
  else if (path === "/ve-bamboo") { content = editorialPage("about"); setMeta("Về Bamboo", "Bamboo Chinese được phát triển bởi MXiao Chinese cho trẻ 6-12 tuổi."); }
  else if (path === "/giao-vien" || path.startsWith("/giao-vien/")) { content = teachers(path); setMeta("Giáo viên", "Tìm hiểu đội ngũ giáo viên Bamboo Chinese giàu kinh nghiệm và tận tâm."); }
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
      setChoices([{ value: "yes", label: "Rồi" }, { value: "never", label: "Chưa" }]);
    } else if (step === "age") {
      question.textContent = "Con bao nhiêu tuổi?";
      setChoices([{ value: "6-7", label: "6-7 tuổi" }, { value: "8-9", label: "8-9 tuổi" }, { value: "10-12", label: "10-12 tuổi" }]);
    } else {
      question.textContent = "Cấp độ gần nhất con từng học là gì?";
      setChoices([
        ...courses.map((course) => ({ value: String(course.level), label: `YCT${course.level}` })),
        { value: "forgot", label: "Không nhớ" },
        { value: "other", label: "Khác" },
      ]);
    }
  };
  choices.addEventListener("click", (event) => {
    const choice = event.target.closest("[data-value]");
    if (!choice) return;
    choices.querySelectorAll(".choice").forEach((item) => item.classList.toggle("selected", item === choice));
    const value = choice.dataset.value;
    if (step === "prior") {
      if (value === "never") showStep("age");
      if (value === "yes") showStep("level");
    } else if (step === "age") {
      showResult("YCT1 là cấp độ phù hợp để gia đình tham khảo.", "Con sẽ làm quen tiếng Trung qua các chủ đề gần gũi và hoạt động phù hợp với độ tuổi.", levelPath(1), "Xem YCT1");
    } else if (step === "level") {
      if (value === "forgot") {
        showResult("Bamboo sẽ giúp gia đình chọn cấp độ phù hợp.", "Hãy chia sẻ những thông tin gia đình còn nhớ về quá trình học của con.");
        return;
      }
      if (value === "other") {
        result.innerHTML = `<label class="finder-other-label" for="finder-other-level">Cấp độ hoặc chương trình đã học</label><div class="finder-other-row"><input id="finder-other-level" data-finder-other-input placeholder="Ví dụ: HSK 1 hoặc giáo trình khác"><button type="button" class="button light small" data-finder-other-submit>Tiếp tục</button></div>`;
        result.classList.add("visible");
        result.querySelector("[data-finder-other-input]")?.focus();
        return;
      }
      const current = Number(value);
      const next = current < 6 ? current + 1 : current;
      const text = current < 6 ? `YCT${next} có thể là bước tiếp theo của con.` : "Bamboo sẽ tư vấn chặng học tiếp theo cho con.";
      showResult(text, "Bamboo sẽ trao đổi thêm về nội dung con đã học để tư vấn lớp phù hợp.", current < 6 ? levelPath(next) : "/tim-lop-cho-con", current < 6 ? `Xem YCT${next}` : "Tìm lớp cho con");
    }
  });
  result.addEventListener("click", (event) => {
    if (!event.target.closest("[data-finder-other-submit]")) return;
    const input = result.querySelector("[data-finder-other-input]");
    if (!input?.value.trim()) {
      input?.focus();
      return;
    }
    showResult("Bamboo sẽ dựa trên thông tin gia đình cung cấp để tư vấn.", "Hãy chia sẻ tên chương trình hoặc giáo trình con từng học để Bamboo chọn cấp độ phù hợp.");
  });
  setChoices([{ value: "yes", label: "Rồi" }, { value: "never", label: "Chưa" }]);
}

function updatePromotionUI() {
  const state = promotionState();
  const parts = countdownParts(state.remaining);
  document.querySelectorAll(".promo-price").forEach((element) => {
    const listPrice = Number(element.dataset.listPrice);
    const salePrice = Number(element.dataset.salePrice);
    element.classList.toggle("is-active", state.active);
    const currentPrice = element.querySelector("[data-current-price]");
    if (currentPrice) currentPrice.textContent = formatPrice(state.active ? salePrice : listPrice);
    const countdown = element.querySelector("[data-promo-countdown]");
    if (countdown) countdown.textContent = state.active ? `Ưu đãi còn ${countdownText(state.remaining)}` : "";
    const label = element.querySelector("[data-promo-label]");
    if (label) label.textContent = state.active ? "HỌC PHÍ ƯU ĐÃI" : "HỌC PHÍ";
  });
  document.querySelectorAll("[data-promo-clock]").forEach((clock) => {
    clock.hidden = !state.active;
    Object.entries(parts).forEach(([part, value]) => {
      const target = clock.querySelector(`[data-promo-part="${part}"]`);
      if (target) target.textContent = value;
    });
  });
  const floatingPromotion = document.querySelector("[data-floating-promotion]");
  if (floatingPromotion) floatingPromotion.hidden = !state.active;
  if (!state.active && promotionTimer) {
    clearInterval(promotionTimer);
    promotionTimer = null;
  }
}

function bindPromotion() {
  if (promotionTimer) clearInterval(promotionTimer);
  updatePromotionUI();
  if (promotionState().active) promotionTimer = window.setInterval(updatePromotionUI, 1000);
}

function bindScheduleBoard() {
  if (scheduleRefreshTimer) {
    clearInterval(scheduleRefreshTimer);
    scheduleRefreshTimer = null;
  }
  const root = document.querySelector("[data-schedule-board]");
  if (!root) return;
  const content = root.querySelector("[data-schedule-content]");
  const count = root.querySelector("[data-schedule-count]");
  const fromInput = root.querySelector("[data-schedule-from]");
  const toInput = root.querySelector("[data-schedule-to]");
  const campusSelect = root.querySelector("[data-schedule-campus]");
  const teacherSelect = root.querySelector("[data-schedule-teacher]");
  let scheduleRows = [];

  const render = () => {
    const from = fromInput.value ? new Date(`${fromInput.value}T00:00:00`).getTime() : Number.NaN;
    const to = toInput.value ? new Date(`${toInput.value}T23:59:59`).getTime() : Number.NaN;
    const filtered = scheduleRows.filter((row) => {
      const date = scheduleDateValue(row["Ngày khai giảng"]);
      if (campusSelect.value !== "all" && row["Cơ sở"] !== campusSelect.value) return false;
      if (teacherSelect.value !== "all" && row["Giảng viên"] !== teacherSelect.value) return false;
      if (!Number.isNaN(from) && !Number.isNaN(date) && date < from) return false;
      if (!Number.isNaN(to) && !Number.isNaN(date) && date > to) return false;
      return true;
    });
    content.innerHTML = scheduleTable(filtered);
    count.textContent = filtered.length ? `Đang hiển thị ${filtered.length} lớp phù hợp.` : "";
  };

  const fillOptions = (select, values) => {
    const selected = select.value;
    const initial = select.querySelector("option").outerHTML;
    select.innerHTML = initial + values.map((value) => `<option value="${escapeHTML(value)}">${escapeHTML(value)}</option>`).join("");
    if ([...select.options].some((option) => option.value === selected)) select.value = selected;
  };

  const load = async () => {
    try {
      const response = await fetch(`${SCHEDULE_CSV_URL}&_=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("schedule-unavailable");
      scheduleRows = parseScheduleCsv(await response.text());
      fillOptions(campusSelect, [...new Set(scheduleRows.map((row) => row["Cơ sở"]).filter(Boolean))].sort());
      fillOptions(teacherSelect, [...new Set(scheduleRows.map((row) => row["Giảng viên"]).filter(Boolean))].sort());
      render();
    } catch (_) {
      content.innerHTML = `<div class="schedule-empty"><span>${icon("calendar", 28)}</span><h3>Chưa thể tải lịch lớp</h3><p>Gia đình có thể gửi nhu cầu để Bamboo tư vấn khung giờ phù hợp.</p>${link("Tìm lớp theo nhu cầu", "/tim-lop-cho-con", "button primary")}</div>`;
      count.textContent = "";
    }
  };

  [fromInput, toInput, campusSelect, teacherSelect].forEach((control) => control.addEventListener("change", render));
  root.querySelector("[data-schedule-reset]")?.addEventListener("click", () => {
    fromInput.value = "";
    toInput.value = "";
    campusSelect.value = "all";
    teacherSelect.value = "all";
    render();
  });
  load();
  scheduleRefreshTimer = window.setInterval(load, 60_000);
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
  bindPromotion();
  bindScheduleBoard();
  document.querySelectorAll("[data-finder]").forEach(renderFinder);
  const form = document.querySelector("[data-lead-form]");
  const priorLearning = form?.querySelector("[data-prior-learning]");
  const levelField = form?.querySelector("[data-level-field]");
  const previousLevel = form?.querySelector("[data-previous-level]");
  const otherLevelField = form?.querySelector("[data-other-level-field]");
  const otherLevel = form?.querySelector("[data-other-level]");
  const syncLearningFields = () => {
    const hasLearned = priorLearning?.value === "Rồi";
    if (levelField) levelField.hidden = !hasLearned;
    if (previousLevel) {
      previousLevel.disabled = !hasLearned;
      previousLevel.required = hasLearned;
      if (!hasLearned) previousLevel.value = "";
    }
    const isOther = hasLearned && previousLevel?.value === "Khác";
    if (otherLevelField) otherLevelField.hidden = !isOther;
    if (otherLevel) {
      otherLevel.disabled = !isOther;
      otherLevel.required = isOther;
      if (!isOther) otherLevel.value = "";
    }
  };
  priorLearning?.addEventListener("change", syncLearningFields);
  previousLevel?.addEventListener("change", syncLearningFields);
  syncLearningFields();
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = form.querySelector("[data-form-error]");
    const success = form.querySelector("[data-form-success]");
    const submitButton = form.querySelector("button[type=submit]");
    success.classList.remove("visible");
    if (!form.checkValidity()) {
      error.textContent = "Vui lòng điền các thông tin bắt buộc trước khi gửi.";
      form.reportValidity();
      return;
    }
    error.textContent = "";
    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Đang gửi thông tin...";

    const data = new FormData(form);
    const formType = String(data.get("formType") || "course-interest");
    const isContactConsultation = formType === "contact-consultation";
    const priorLearningValue = String(data.get("priorLearning") || "");
    const selectedLevel = priorLearningValue === "Rồi" ? String(data.get("previousLevel") || "") : "Không áp dụng";
    const courseLevel = selectedLevel === "Khác" ? String(data.get("otherLevel") || "") : selectedLevel;
    const currentLevel = isContactConsultation ? String(data.get("currentLevel") || "Chưa xác định") : courseLevel;
    const familyNote = String(data.get("note") || "").trim();
    const learningGoal = String(data.get("learningGoal") || "").trim();
    const preferredTime = String(data.get("preferredTime") || data.get("learningMode") || "").trim();
    const scheduleClass = String(data.get("scheduleClass") || "").trim();
    const scheduleCourse = String(data.get("scheduleCourse") || "").trim();
    const detailNote = [
      `Thương hiệu: Bamboo Chinese`,
      scheduleClass ? `Mã lớp quan tâm: ${scheduleClass}` : "",
      data.get("childAge") ? `Tuổi của con: ${String(data.get("childAge"))}` : "",
      priorLearningValue ? `Đã từng học tiếng Trung: ${priorLearningValue}` : "",
      `Trình độ hiện tại: ${currentLevel || "Chưa xác định"}`,
      preferredTime ? `Khung giờ hoặc hình thức mong muốn: ${preferredTime}` : "",
      learningGoal ? `Mục tiêu học tập: ${learningGoal}` : "",
      familyNote ? `Nội dung cần trao đổi: ${familyNote}` : "",
    ].filter(Boolean).join("\n");
    const courseMatch = currentPath().match(/yct-(\d)/);

    try {
      const response = await fetch("https://mxiao.edu.vn/api/bamboo-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: String(data.get("parentName") || ""),
          phone: String(data.get("phone") || ""),
          email: String(data.get("email") || ""),
          age: String(data.get("childAge") || ""),
          currentLevel,
          preferredTime,
          interestedCourse: scheduleCourse || (courseMatch ? `YCT${courseMatch[1]}` : "Tư vấn lộ trình YCT"),
          source: "bamboo-chinese",
          sourcePage: currentPath(),
          sourceSection: isContactConsultation ? "bamboo-contact" : "bamboo-course-finder",
          landingPage: window.location.href,
          referrer: document.referrer,
          submittedAt: new Date().toISOString(),
          note: detailNote,
          website: String(data.get("website") || ""),
        }),
      });
      const responseData = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseData?.error || "Không thể gửi thông tin lúc này.");
      success.classList.add("visible");
      submitButton.textContent = "Đã gửi thông tin";
    } catch (submitError) {
      error.textContent = submitError instanceof Error ? submitError.message : "Không thể gửi thông tin. Vui lòng thử lại.";
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    } finally {
      submitButton.removeAttribute("aria-busy");
    }
  });
}

async function loadCourses() {
  const [responses, teachersResponse] = await Promise.all([
    Promise.all(COURSE_FILES.map((file) => fetch(file))),
    fetch(TEACHER_FILE),
  ]);
  courses = await Promise.all(responses.map((response) => response.json()));
  teachersData = await teachersResponse.json();
  courses.sort((a, b) => a.level - b.level);
}

window.addEventListener("popstate", renderPage);
document.addEventListener("click", (event) => {
  const anchor = event.target.closest("a");
  if (!anchor || !anchor.href || new URL(anchor.href).origin !== window.location.origin || anchor.target === "_blank") return;
  const destination = new URL(anchor.href);
  if (destination.pathname.startsWith("/assets/") || destination.pathname.startsWith("/data/")) return;
  event.preventDefault();
  window.history.pushState({}, "", destination.pathname + destination.search);
  renderPage();
});

loadCourses().then(renderPage).catch(() => {
  document.querySelector("#app").innerHTML = shell(`<section class="not-found"><div><p class="eyebrow">BAMBOO CHINESE</p><h1>Chưa thể mở lộ trình.</h1><p class="lede" style="margin:18px auto 0">Vui lòng tải lại trang để thử lại.</p></div></section>`);
});
