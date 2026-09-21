const COURSE_FILES = [1, 2, 3, 4, 5, 6].map((level) => `/data/yct-${level}.json`);
const TEACHER_FILE = "/data/teachers.json";
const NAV_ITEMS = [
  { label: "Trang chủ", href: "/" },
  { label: "Khóa học", href: "/lo-trinh", children: [1, 2, 3, 4, 5, 6].map((level) => ({ label: `Khóa YCT${level}`, href: `/lo-trinh/yct-${level}` })) },
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
const levelPath = (level) => `/lo-trinh/yct-${level}`;
const courseImage = (level, kind = "journey") => `/assets/courses/yct-${level}-${kind}.jpg`;
const courseBook = (level) => `/assets/books/YCT${level}.png`;

let courses = [];
let teachersData = [];

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
            <p>Tiếng Trung dành riêng cho trẻ 6-12 tuổi, với một hành trình học rõ ràng từ YCT1 đến YCT6.</p>
          </div>
          <div><p class="footer-title">Khóa học</p><div class="footer-links">${link("Lộ trình YCT1-YCT6", "/lo-trinh")}${link("Tìm khóa phù hợp", "/tim-lop-cho-con")}${link("Học phí", "/lo-trinh")}</div></div>
          <div><p class="footer-title">Bamboo</p><div class="footer-links">${link("Phương pháp học", "/cach-bamboo-day")}${link("Đội ngũ giáo viên", "/giao-vien")}${link("Tiến bộ của con", "/tien-bo-cua-con")}</div></div>
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
  return `<section class="page-hero"><div class="container page-hero-grid"><div class="page-hero-copy"><div class="breadcrumb">${link("Trang chủ", "/")}<span>/</span><span>${escapeHTML(title)}</span></div><p class="eyebrow">${escapeHTML(eyebrow)}</p><h1>${escapeHTML(title)}</h1><p class="lede">${escapeHTML(description)}</p></div><div class="page-hero-art" aria-hidden="true">${icon("book", 54)}<strong>${escapeHTML(symbol)}</strong></div></div></section>`;
}

function yctJourney() {
  return `
    <div class="course-shelf">
      ${courses.map((course) => `<a class="shelf-course level-${course.level}" href="${levelPath(course.level)}"><div class="book-stage"><span class="level-orbit">${course.level}</span><img src="${courseBook(course.level)}" alt="Giáo trình YCT${course.level}" loading="lazy"></div><div class="shelf-copy"><span class="journey-level">YCT${course.level}</span><h3>${escapeHTML(course.title)}</h3><p>${course.duration.totalSessions} buổi · lớp ${course.classSize.maxOnline}-${course.classSize.maxOffline} bạn</p><div class="shelf-price"><del>${formatPrice(course.pricing.listPrice)}</del><strong>${formatPrice(discountedPrice(course))}</strong></div><span class="shelf-link">Xem khóa học ${icon("arrow", 14)}</span></div></a>`).join("")}
    </div>`;
}

function developmentJourney() {
  const stages = [
    { level: 1, icon: "star", phase: "Làm quen", title: "Hứng thú với tiếng Trung", copy: "Làm quen âm thanh, lời chào và những mẫu câu đầu tiên trong các tình huống gần gũi." },
    { level: 2, icon: "message", phase: "Giao tiếp", title: "Phản xạ câu cơ bản", copy: "Mở rộng cách hỏi – đáp và tự tin sử dụng những câu ngắn trong đời sống hằng ngày." },
    { level: 3, icon: "book", phase: "Xây nền", title: "Hiểu và diễn đạt rõ hơn", copy: "Kết nối từ vựng với chủ đề, đọc hiểu tốt hơn và diễn đạt ý bằng câu trọn vẹn." },
    { level: 4, icon: "pen", phase: "Mở rộng", title: "Dùng tiếng Trung linh hoạt", copy: "Mở rộng vốn từ, tăng khả năng đọc – viết và ứng dụng ngôn ngữ trong nhiều bối cảnh." },
    { level: 5, icon: "chart", phase: "Tự tin", title: "Chủ động giao tiếp", copy: "Trình bày suy nghĩ mạch lạc hơn, củng cố bốn kỹ năng và tăng sự tự tin khi tương tác." },
    { level: 6, icon: "graduation", phase: "Vững vàng", title: "Sẵn sàng cho chặng mới", copy: "Hoàn thiện nền tảng YCT, hình thành thói quen học chủ động và sẵn sàng tiến xa hơn." },
  ];
  const roadPath = "M70 105 C170 52 230 126 300 148 C385 176 418 218 500 192 C585 164 630 218 690 258 C770 312 816 344 890 314 C978 278 1040 332 1135 382";
  return `<div class="development-journey"><div class="roadmap-scroll"><div class="roadmap"><svg class="road-svg" viewBox="0 0 1200 460" role="img" aria-label="Con đường phát triển từ YCT1 đến YCT6"><path class="road-edge" d="${roadPath}"/><path class="road-surface" d="${roadPath}"/><path class="road-center" d="${roadPath}"/></svg><span class="road-label road-start">${icon("flag", 15)} Xuất phát</span>${stages.map((stage) => `<a class="road-stop stop-${stage.level}" href="${levelPath(stage.level)}" aria-label="Xem lộ trình YCT${stage.level}: ${escapeHTML(stage.title)}"><span class="road-pin${stage.level === 6 ? " goal" : ""}">${icon(stage.level === 6 ? "trophy" : "location", 18)}<strong>YCT${stage.level}</strong></span><article class="road-stage-card"><p class="stage-phase">${escapeHTML(stage.phase)}</p><h3>${escapeHTML(stage.title)}</h3><p>${escapeHTML(stage.copy)}</p></article></a>`).join("")}<span class="road-label road-finish">${icon("trophy", 15)} Đích đến</span></div></div><div class="journey-outcome"><span>${icon("leaf", 20)}</span><div><strong>Mỗi chặng là một bước trưởng thành</strong><p>Trẻ không chỉ học thêm kiến thức mà còn phát triển phản xạ, sự tự tin và khả năng sử dụng tiếng Trung ngày một tự nhiên hơn.</p></div>${htmlLink(`<span>Xem lộ trình chi tiết</span>${icon("arrow", 14)}`, "/lo-trinh", "arrow-link")}</div></div>`;
}

function rhythmCards() {
  const yct1 = courses[0];
  return `<div class="learning-flow"><article><span class="flow-icon">${icon("book", 25)}</span><div><small>01</small><h3>Học</h3><p>Khám phá kiến thức mới qua Nghe, Nói, Đọc và Viết.</p><strong>${yct1?.duration.lessonSessions || 22} hoặc ${courses[4]?.duration.lessonSessions || 28} buổi học</strong></div></article><span class="flow-arrow">${icon("arrow", 20)}</span><article><span class="flow-icon orange">${icon("star", 25)}</span><div><small>02</small><h3>Ôn tập</h3><p>Củng cố sau từng chặng bằng hoạt động và bài tập có mục tiêu.</p><strong>4 hoặc 5 mốc ôn tập</strong></div></article><span class="flow-arrow">${icon("arrow", 20)}</span><article><span class="flow-icon blue">${icon("chart", 25)}</span><div><small>03</small><h3>Đánh giá</h3><p>Nhìn lại Nghe - Nói và Đọc - Viết ở cuối mỗi cấp độ.</p><strong>2 buổi đánh giá cuối khóa</strong></div></article></div>`;
}

function teacherCard(teacher, compact = false) {
  return `<a class="teacher-card${compact ? " compact" : ""}" href="/giao-vien/${teacher.id}"><div class="teacher-photo"><img src="${teacher.avatar}" alt="Giáo viên ${escapeHTML(teacher.name)}" loading="lazy"><span>${icon("graduation", 16)}</span></div><div class="teacher-copy"><p>${escapeHTML(teacher.role)}</p><h3>${escapeHTML(teacher.name)}</h3><div class="teacher-badges">${teacher.badges.slice(0, compact ? 2 : 3).map((badge) => `<span>${escapeHTML(badge)}</span>`).join("")}</div>${compact ? "" : `<p class="teacher-experience">${escapeHTML(teacher.experience)}</p>`}<span class="teacher-more">Xem hồ sơ ${icon("arrow", 13)}</span></div></a>`;
}

function teacherShowcase(limit = 6) {
  return `<div class="teacher-strip">${teachersData.slice(0, limit).map((teacher) => teacherCard(teacher, true)).join("")}</div>`;
}

function finder() {
  return `<div class="finder" data-finder><div class="finder-panel"><div class="finder-progress" aria-hidden="true"><span class="progress-dot active" data-progress="1"></span><span class="progress-dot" data-progress="2"></span></div><p class="finder-question" data-finder-question>Con đã từng học tiếng Trung chưa?</p><div class="choice-grid" data-finder-choices></div><div class="finder-result" data-finder-result aria-live="polite"></div><p class="choice-note">Đây là gợi ý ban đầu, không phải bài kiểm tra xếp lớp chính thức.</p></div><div class="finder-story"><figure class="finder-scene"><img src="/assets/brand/classroom-learning-v1.png" alt="Giáo viên và trẻ cùng học trong lớp nhỏ" loading="lazy"><figcaption><strong>Đi từng bước cùng con</strong><span>Từ điểm bắt đầu đến chặng học tiếp theo</span></figcaption></figure><div class="finder-steps"><div class="mini-step"><span class="mini-step-number">01</span><div><h3>Nhìn vào điểm bắt đầu</h3><p>Chọn tình trạng học hiện tại của con để bắt đầu một hướng gợi ý đơn giản.</p></div></div><div class="mini-step"><span class="mini-step-number">02</span><div><h3>Đi sâu vừa đủ</h3><p>Nếu con đã từng học, chọn cấp gần nhất để xem bước tiếp theo ở mức sơ bộ.</p></div></div><div class="mini-step"><span class="mini-step-number">03</span><div><h3>Trao đổi khi cần</h3><p>Bamboo sẽ hỗ trợ thêm khi gia đình chưa chắc về trình độ hoặc lựa chọn lớp.</p></div></div></div></div></div>`;
}

function progressPreview() {
  return `<div class="progress-preview"><div class="report-card"><div class="report-header"><div><strong>Cách đọc tiến bộ của con</strong><small>Minh họa các mốc trong hành trình</small></div><span class="report-badge">Tiến bộ của con</span></div><div class="report-row"><span class="report-number">01</span><div><strong>Nội dung đã học</strong><span>Những chủ đề và buổi học đã đi qua</span></div><span class="report-state">Đã học</span></div><div class="report-row"><span class="report-number">02</span><div><strong>Nội dung đang củng cố</strong><span>Mốc ôn tập giúp nhìn lại nền tảng</span></div><span class="report-state">Ôn tập</span></div><div class="report-row"><span class="report-number">03</span><div><strong>Chặng tiếp theo</strong><span>Bước tiếp nối trong lộ trình YCT</span></div><span class="report-state">Tiếp theo</span></div></div><div><p class="eyebrow">TIẾN BỘ CỦA CON</p><h2>Phụ huynh nhìn thấy cả quá trình, không chỉ một kết quả.</h2><p class="lede">Tiến bộ của con được giải thích qua nội dung học, mốc ôn tập, hai buổi đánh giá và phản hồi trong quá trình học.</p>${link("Xem cách Bamboo ghi nhận tiến bộ", "/tien-bo-cua-con", "arrow-link")}</div></div>`;
}

function priceCards() {
  return `<div class="price-grid">${courses.map((course, index) => `<article class="price-card ${index === 0 ? "featured" : ""}"><div class="price-sprout" aria-hidden="true"><span></span><span></span><span></span></div><div class="price-card-top"><h3>YCT${course.level}</h3>${index === 0 ? `<span class="tag">Bắt đầu</span>` : ""}</div><p>${course.duration.totalSessions} buổi · lớp trực tuyến tối đa ${course.classSize.maxOnline} bạn</p><div class="price-value"><del>${formatPrice(course.pricing.listPrice)}</del><div class="price-discount">${formatPrice(discountedPrice(course))}</div></div>${link("Xem khóa học", levelPath(course.level), "button secondary small")}</article>`).join("")}</div>`;
}

function home() {
  return shell(`
    <section class="hero"><div class="container hero-grid"><div class="hero-copy"><p class="hero-badge">${icon("star", 14)} TIẾNG TRUNG CHO TRẺ 6-12 TUỔI</p><h1>Học là vui.<br><span>Vui là nhớ.</span></h1><p class="lede">Lộ trình YCT1-YCT6 rõ ràng để phụ huynh biết con đang học gì, trẻ được luyện đủ bốn kỹ năng và tiến bộ theo từng chặng.</p><div class="hero-actions">${htmlLink(`${icon("message", 17)}<span>Tìm lớp cho con</span>`, "/tim-lop-cho-con", "button primary")}${htmlLink(`<span>Khám phá khóa học</span>${icon("arrow", 15)}`, "/lo-trinh", "button secondary")}</div><div class="hero-benefits"><div>${icon("users", 19)}<span><strong>Lớp nhỏ</strong>6-8 bạn</span></div><div>${icon("book", 19)}<span><strong>Giáo trình</strong>YCT chuẩn</span></div><div>${icon("chart", 19)}<span><strong>Rõ tiến độ</strong>Từng chặng</span></div><div>${icon("graduation", 19)}<span><strong>Giáo viên</strong>Hồ sơ rõ</span></div></div><p class="hero-note"><span></span>Chương trình được phát triển bởi MXiao Chinese</p></div><div class="hero-visual"><img src="/assets/brand/cover.jpg" alt="Học sinh Bamboo Chinese học cùng giáo trình YCT" loading="eager"><div class="hero-photo-card"><strong>${icon("book", 17)} YCT1 → YCT6</strong><span>Một lộ trình liền mạch cho trẻ</span></div></div></div></section>
    <section class="section course-section"><div class="container"><div class="split-heading"><div><p class="eyebrow">LỘ TRÌNH PHÁT TRIỂN YCT1–YCT6</p><h2>Con lớn lên cùng<br>từng chặng tiếng Trung.</h2></div><p>Sáu cấp độ tạo thành một hành trình liên tục: từ những âm thanh đầu tiên đến khả năng giao tiếp chủ động và nền tảng vững vàng.</p></div>${developmentJourney()}</div></section>
    <section class="method-section"><div class="container"><div class="split-heading light"><div><p class="eyebrow">CÁCH BAMBOO DẠY</p><h2>Mỗi cấp độ cùng một nhịp học dễ theo dõi.</h2></div>${link("Xem phương pháp học", "/cach-bamboo-day", "text-link-light")}</div>${rhythmCards()}</div></section>
    <section class="section finder-section"><div class="container"><div class="section-heading"><p class="eyebrow">TÌM ĐIỂM BẮT ĐẦU</p><h2>Con nên bắt đầu ở YCT nào?</h2><p class="lede">Trả lời hai câu ngắn để nhận gợi ý ban đầu, sau đó Bamboo sẽ hỗ trợ xác nhận trước khi xếp lớp.</p></div>${finder()}</div></section>
    <section class="teacher-section"><div class="container"><div class="split-heading"><div><p class="eyebrow">ĐỘI NGŨ GIÁO VIÊN</p><h2>Giáo viên tận tâm,<br>chuyên môn vững vàng.</h2></div><p>Phụ huynh có thể tìm hiểu kinh nghiệm, chứng chỉ và thế mạnh của từng giáo viên trước khi chọn lớp cho con.</p></div>${teacherShowcase(6)}<div class="section-action">${htmlLink(`<span>Xem toàn bộ giáo viên</span>${icon("arrow", 14)}`, "/giao-vien", "button secondary")}</div></div></section>
    <section class="value-strip"><div class="container value-grid"><div>${icon("headphones", 22)}<span><strong>Nghe</strong>Làm quen âm thanh</span></div><div>${icon("message", 22)}<span><strong>Nói</strong>Tăng phản xạ</span></div><div>${icon("book", 22)}<span><strong>Đọc</strong>Hiểu nội dung</span></div><div>${icon("pen", 22)}<span><strong>Viết</strong>Nhớ mặt chữ</span></div></div></section>
    <section class="section compact"><div class="container"><div class="cta-banner"><p class="eyebrow">BẮT ĐẦU CÙNG BAMBOO</p><h2>Chưa chắc con nên học khóa nào?</h2><p>Chia sẻ độ tuổi và tình trạng học hiện tại; Bamboo sẽ cùng gia đình tìm điểm bắt đầu phù hợp.</p>${htmlLink(`${icon("message", 16)}<span>Tìm lớp cho con</span>`, "/tim-lop-cho-con", "button light")}</div></div></section>`);
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

function curriculumSessions(course) {
  return `<ol class="curriculum-list">${course.curriculum.map((session) => `<li class="session"><span class="session-number">Buổi ${session.session}</span><div class="session-title"><span lang="zh">${escapeHTML(session.titleZh)}</span><strong>${escapeHTML(session.titleVi)}</strong></div></li>`).join("")}</ol>`;
}

function coursePage(course) {
  const previous = courses.find((item) => item.level === course.level - 1);
  const next = courses.find((item) => item.level === course.level + 1);
  const entry = course.level === 1 ? "Chưa từng học tiếng Trung" : `Hoàn thành lộ trình YCT${course.level - 1}`;
  const outcome = course.level === 6 ? "Hoàn thiện nền tảng YCT" : `Sẵn sàng bước tiếp lên YCT${course.level + 1}`;
  const highlights = [
    `Học trọn vẹn ${course.duration.totalSessions} buổi theo đúng thứ tự`,
    `Phát triển bốn kỹ năng Nghe - Nói - Đọc - Viết`,
    `Giáo trình YCT${course.level} chuẩn, chủ đề gần gũi với trẻ`,
    `Lớp nhỏ tối đa ${course.classSize.maxOnline} bạn online, ${course.classSize.maxOffline} bạn trực tiếp`,
    "Ôn tập và đánh giá được sắp xếp trong chương trình",
    "Phụ huynh dễ theo dõi nội dung con đã học",
  ];
  return shell(`<div class="course-detail level-${course.level}">
    <section class="course-detail-hero"><div class="container"><div class="breadcrumb">${link("Trang chủ", "/")}<span>›</span>${link("Khóa học - Lộ trình", "/lo-trinh")}<span>›</span><span>YCT${course.level}</span></div><div class="course-detail-hero-grid"><div class="course-detail-hero-copy"><p class="eyebrow">LỘ TRÌNH TIẾNG TRUNG TRẺ EM</p><h1>Khóa học YCT${course.level}</h1><p class="lede">${course.duration.totalSessions} buổi giúp trẻ phát triển đồng đều Nghe - Nói - Đọc - Viết bằng những chủ đề gần gũi, phù hợp với độ tuổi.</p><div class="course-actions">${htmlLink(`${icon("message", 16)}<span>Tìm lớp cho con</span>`, "/tim-lop-cho-con", "button primary")}${link("Xem toàn bộ lộ trình", "/lo-trinh", "button secondary")}</div></div><div class="course-book-visual"><span class="book-standard">GIÁO TRÌNH CHUẨN</span><span class="book-level">YCT${course.level}</span><img src="${courseBook(course.level)}" alt="Giáo trình YCT${course.level}" loading="eager"></div></div></div></section>
    <section class="course-overview"><div class="container"><div class="course-section-title"><p class="eyebrow">TỔNG QUAN</p><h2>Thông tin khóa học</h2><p>Các thông tin phụ huynh cần xem trước khi chọn lớp: đầu vào, đầu ra, số buổi, sĩ số, học phí và nội dung từng buổi.</p></div><div class="course-detail-layout"><div class="course-main-column">
      <article class="course-panel course-info-panel"><h3>Đầu vào, đầu ra và nhịp học</h3><div class="course-stat-grid"><div><span class="course-stat-icon">${icon("flag", 18)}</span><small>ĐẦU VÀO</small><strong>${escapeHTML(entry)}</strong></div><div><span class="course-stat-icon">${icon("trophy", 18)}</span><small>ĐẦU RA</small><strong>${escapeHTML(outcome)}</strong></div><div><span class="course-stat-icon">${icon("calendar", 18)}</span><small>SỐ BUỔI</small><strong>${course.duration.totalSessions} buổi</strong></div><div><span class="course-stat-icon">${icon("users", 18)}</span><small>SĨ SỐ</small><strong>${course.classSize.maxOnline}-${course.classSize.maxOffline} bạn</strong></div></div><div class="course-skills"><p>BỐN KỸ NĂNG TRONG KHÓA HỌC</p><div><span>${icon("headphones", 14)} Nghe</span><span>${icon("message", 14)} Nói</span><span>${icon("book", 14)} Đọc</span><span>${icon("pen", 14)} Viết</span></div></div></article>
      <article class="course-price-card course-price-mobile"><p>HỌC PHÍ ƯU ĐÃI</p><del>${formatPrice(course.pricing.listPrice)}</del><strong>${formatPrice(discountedPrice(course))}</strong>${htmlLink(`<span>Nhận tư vấn khóa học</span>${icon("arrow", 14)}`, "/tim-lop-cho-con", "button light full")}</article>
      <article class="course-panel course-highlights"><h3>Điểm nổi bật</h3><div class="highlight-list">${highlights.map((item) => `<div>${icon("check", 14)}<span>${escapeHTML(item)}</span></div>`).join("")}</div></article>
      <article class="course-panel course-curriculum"><div class="course-panel-heading"><div><p class="eyebrow">NỘI DUNG YCT${course.level}</p><h3>Lộ trình buổi học</h3></div><span>${course.duration.totalSessions} BUỔI</span></div>${curriculumSessions(course)}</article>
    </div><aside class="course-side-column"><article class="course-price-card"><p>HỌC PHÍ ƯU ĐÃI</p><del>${formatPrice(course.pricing.listPrice)}</del><strong>${formatPrice(discountedPrice(course))}</strong>${htmlLink(`<span>Nhận tư vấn khóa học</span>${icon("arrow", 14)}`, "/tim-lop-cho-con", "button light full")}</article><article class="course-panel course-gifts"><p class="eyebrow">ĐI KÈM KHÓA HỌC</p><h3>Giáo trình & học cụ</h3><div class="gift-list"><div>${icon("check", 14)}<span>Giáo trình chuẩn YCT${course.level}</span></div><div>${icon("check", 14)}<span>Vở viết chữ Hán và dụng cụ học tập</span></div><div>${icon("check", 14)}<span>Tài liệu ôn tập theo chương trình</span></div><div>${icon("check", 14)}<span>Phản hồi học tập trong quá trình học</span></div></div></article><article class="course-panel course-commitment"><span class="commitment-icon">${icon("shield", 24)}</span><div><h3>Đồng hành rõ ràng</h3><p>Bamboo theo sát nội dung học và trao đổi cùng phụ huynh trong suốt khóa.</p></div></article></aside></div></div></section>
    <section class="course-method"><div class="container course-method-grid"><div><p class="eyebrow">CÁCH BAMBOO DẠY</p><h2>Học qua tương tác và thực hành.</h2><p class="lede">Mỗi buổi ${course.duration.minutesPerSession || 90} phút tạo cơ hội để trẻ nghe, nói, đọc và viết ngay trong lớp nhỏ.</p>${link("Xem phương pháp học", "/cach-bamboo-day", "button secondary")}</div><div class="method-chip-grid"><div>${icon("headphones", 22)}<span><strong>Nghe</strong>Nhận diện âm thanh</span></div><div>${icon("message", 22)}<span><strong>Nói</strong>Tăng phản xạ</span></div><div>${icon("book", 22)}<span><strong>Đọc</strong>Hiểu chủ đề</span></div><div>${icon("pen", 22)}<span><strong>Viết</strong>Nhớ mặt chữ</span></div></div></div></section>
    <section class="section course-faq-section"><div class="container"><div class="course-section-title"><p class="eyebrow">GIẢI ĐÁP</p><h2>Câu hỏi thường gặp về YCT${course.level}</h2></div><div class="course-faq-list"><details open><summary>Khóa YCT${course.level} phù hợp với ai?</summary><p>Phù hợp với trẻ 6-12 tuổi có đầu vào: ${escapeHTML(entry.toLowerCase())}.</p></details><details><summary>Khóa học có bao nhiêu buổi?</summary><p>Khóa YCT${course.level} gồm ${course.duration.totalSessions} buổi, mỗi buổi ${course.duration.minutesPerSession || 90} phút.</p></details><details><summary>Sĩ số lớp được tổ chức như thế nào?</summary><p>Lớp online tối đa ${course.classSize.maxOnline} bạn; lớp trực tiếp tối đa ${course.classSize.maxOffline} bạn để giáo viên có thời gian tương tác với từng trẻ.</p></details><details><summary>Con sẽ học bằng tài liệu gì?</summary><p>Trẻ học theo giáo trình chuẩn YCT${course.level}, đi cùng học cụ và tài liệu ôn tập phù hợp với chương trình.</p></details></div></div></section>
    <section class="course-teachers"><div class="container"><div class="split-heading"><div><p class="eyebrow">GIÁO VIÊN</p><h2>Đội ngũ đồng hành cùng con.</h2></div>${link("Xem toàn bộ giáo viên", "/giao-vien", "button secondary")}</div>${teacherShowcase(3)}</div></section>
    <section class="section course-lead"><div class="container"><div class="course-section-title"><p class="eyebrow">ĐĂNG KÝ TƯ VẤN</p><h2>Nhận tư vấn về YCT${course.level}</h2><p>Chia sẻ điểm bắt đầu của con để Bamboo hỗ trợ gia đình chọn lớp phù hợp.</p></div><div class="course-lead-grid"><div class="course-lead-copy"><span>${icon("leaf", 26)}</span><h3>Một cuộc trao đổi ngắn để chọn đúng điểm bắt đầu.</h3><p>Bamboo sẽ dựa trên độ tuổi, tình trạng học hiện tại và hình thức học mong muốn của gia đình.</p><div class="course-nav">${previous ? `<a class="course-nav-card" href="${levelPath(previous.level)}"><small>Khóa trước</small><strong>← YCT${previous.level}</strong></a>` : `<a class="course-nav-card" href="/lo-trinh"><small>Điểm bắt đầu</small><strong>Tổng quan lộ trình</strong></a>`}${next ? `<a class="course-nav-card next" href="${levelPath(next.level)}"><small>Khóa tiếp theo</small><strong>YCT${next.level} →</strong></a>` : `<a class="course-nav-card next" href="/lo-trinh"><small>Hoàn thành</small><strong>Xem toàn bộ lộ trình</strong></a>`}</div></div>${contactForm()}</div></div></section>
    <div class="course-floating-actions" aria-label="Liên hệ nhanh">${htmlLink(`${icon("calendar", 16)}<span>TÌM LỚP</span>`, "/tim-lop-cho-con")}${htmlLink(`${icon("message", 16)}<span>TƯ VẤN</span>`, "/lien-he")}</div>
  </div>`);
}

function editorialPage(kind) {
  if (kind === "teach") return shell(`${pageHero("CÁCH BAMBOO DẠY", "Học thế nào tại Bamboo?", "Một nhịp học rõ ràng cho trẻ và một cách theo dõi dễ hiểu cho phụ huynh.", "學")}<section class="section"><div class="container"><div class="section-heading"><p class="eyebrow">MỘT BUỔI HỌC</p><h2>Học qua tương tác, thực hành và lặp lại có chủ đích.</h2><p class="lede">Bamboo tổ chức nội dung trong lớp nhỏ, theo nhịp học, ôn tập và đánh giá của từng cấp độ.</p></div><div class="editorial-grid"><article class="editorial-card"><div class="editorial-icon">聽</div><h3>Nghe và nói</h3><p>Trẻ có thời gian tiếp nhận âm thanh và thực hành nói trong một lớp học có quy mô nhỏ.</p></article><article class="editorial-card"><div class="editorial-icon">讀</div><h3>Đọc và viết</h3><p>Trẻ luyện đọc hiểu và viết chữ qua từng chủ đề trong lộ trình YCT.</p></article><article class="editorial-card"><div class="editorial-icon">小</div><h3>Lớp nhỏ</h3><p>Tối đa 6 bạn ở lớp trực tuyến và 8 bạn ở lớp trực tiếp.</p></article></div></div></section><section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">NHỊP HỌC</p><h2>Học - Ôn tập - Đánh giá</h2></div>${rhythmCards()}</div></section><section class="section compact"><div class="container"><div class="cta-banner"><p class="eyebrow">BẮT ĐẦU TỪ ĐÂY</p><h2>Tìm lộ trình phù hợp để cùng con bước vào hành trình.</h2>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button light")}</div></div></section>`);
  if (kind === "progress") return shell(`${pageHero("TIẾN BỘ CỦA CON", "Tiến bộ của con", "Bamboo giúp phụ huynh đọc được quá trình học qua nội dung, mốc ôn tập, đánh giá và bước tiếp theo.", "進")}<section class="section"><div class="container">${progressPreview()}</div></section><section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">BỐN KỸ NĂNG</p><h2>Một bức tranh tiến bộ có nhiều mốc.</h2><p class="lede">Quá trình học được nhìn qua các mốc, không quy đổi thành điểm số hoặc xếp hạng.</p></div><div class="editorial-grid"><article class="editorial-card"><div class="number">01</div><h3>Nghe</h3><p>Những nội dung con đã tiếp nhận và đang củng cố.</p></article><article class="editorial-card"><div class="number">02</div><h3>Nói</h3><p>Cơ hội thực hành trong lớp và mốc đánh giá cuối khóa.</p></article><article class="editorial-card"><div class="number">03</div><h3>Đọc - Viết</h3><p>Các chặng nội dung đi cùng YCT.</p></article></div></div></section><section class="section compact"><div class="container"><div class="cta-banner"><p class="eyebrow">CẦN TƯ VẤN</p><h2>Trao đổi để hiểu bước tiếp theo của con.</h2>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button light")}</div></div></section>`);
  return shell(`${pageHero("VỀ BAMBOO", "Bamboo Chinese là gì?", "Chương trình tiếng Trung do MXiao Chinese phát triển riêng cho trẻ 6-12 tuổi.", "竹")}<section class="section"><div class="container about-grid"><div class="about-image"><img src="/assets/brand-visual-reference.png" alt="Không gian hình ảnh Bamboo Chinese" loading="lazy"></div><div class="about-copy"><p class="eyebrow">BAMBOO CHINESE × MXIAO CHINESE</p><h2>Chuyên môn vững vàng, trải nghiệm dành riêng cho trẻ.</h2><p>Bamboo đồng hành cùng trẻ và phụ huynh bằng lộ trình YCT rõ ràng, lớp học quy mô nhỏ và phương pháp phù hợp với lứa tuổi.</p><p>Hành trình bắt đầu từ những câu hỏi thật của gia đình: con đang ở đâu, sẽ học thế nào và phụ huynh có thể đồng hành ra sao.</p>${link("Xem lộ trình YCT", "/lo-trinh", "button primary")}</div></div></section><section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">KHÔNG GIAN BAMBOO</p><h2>Tươi sáng, ấm áp, có cấu trúc.</h2><p class="lede">Hình ảnh Bamboo lấy cảm hứng từ tre, lá, mây, đồi xanh và đường phát triển — đủ gần gũi với trẻ nhưng vẫn rõ ràng cho phụ huynh.</p></div></div></section>`);
}

function parentCorner() {
  const categories = ["Bắt đầu học tiếng Trung", "Hiểu về YCT", "Đồng hành cùng con", "Hiểu tiến bộ"];
  return shell(`${pageHero("GÓC PHỤ HUYNH", "Những điều phụ huynh muốn biết", "Các chủ đề để gia đình bắt đầu tìm hiểu trước khi chọn lộ trình cho con.", "家")}<section class="section"><div class="container"><div class="article-categories">${categories.map((category, index) => `<div class="category-card"><span>0${index + 1}</span><h3>${category}</h3></div>`).join("")}</div></div></section><section class="section tint"><div class="container"><div class="section-heading center"><p class="eyebrow">NỘI DUNG ĐỒNG HÀNH</p><h2>Đi từ câu hỏi của gia đình.</h2><p class="lede">Những chia sẻ ngắn gọn giúp phụ huynh hiểu YCT, chọn điểm bắt đầu và đồng hành cùng con trong quá trình học.</p></div><div class="cta-banner"><p class="eyebrow">ĐÃ SẴN SÀNG TÌM HIỂU?</p><h2>Khám phá lộ trình YCT1-YCT6.</h2>${link("Xem lộ trình", "/lo-trinh", "button light")}</div></div></section>`);
}

function articlePage() {
  return shell(`${pageHero("BÀI VIẾT", "Bài viết cho phụ huynh", "Những nội dung giúp gia đình hiểu cách bắt đầu và đồng hành cùng hành trình tiếng Trung của con.", "文")}<section class="section"><div class="container not-found"><div><p class="eyebrow">BAMBOO CHINESE</p><h2>Những câu hỏi đáng để bắt đầu.</h2><p class="lede" style="margin:18px auto 0">Khám phá lộ trình và cách Bamboo tổ chức việc học trước khi chọn bước tiếp theo cho con.</p>${link("Xem cách Bamboo dạy", "/cach-bamboo-day", "button primary")}</div></div></section>`);
}

function teachers(path) {
  const id = path.split("/").filter(Boolean)[1];
  if (id) {
    const teacher = teachersData.find((item) => item.id === id);
    if (!teacher) return shell(`${pageHero("GIÁO VIÊN", "Không tìm thấy hồ sơ", "Hãy quay lại danh sách để tiếp tục tìm hiểu đội ngũ giáo viên.", "師")}<section class="section compact"><div class="container section-action">${link("Về trang giáo viên", "/giao-vien", "button primary")}</div></section>`);
    return shell(`${pageHero("HỒ SƠ GIÁO VIÊN", teacher.name, teacher.role, "師")}<section class="section"><div class="container teacher-profile"><div class="teacher-profile-photo"><img src="${teacher.avatar}" alt="Giáo viên ${escapeHTML(teacher.name)}"></div><div class="teacher-profile-copy"><p class="eyebrow">KINH NGHIỆM & THẾ MẠNH</p><h2>${escapeHTML(teacher.experience)}</h2><p class="lede">${escapeHTML(teacher.shortBio)}</p><div class="teacher-badges large">${teacher.badges.map((badge) => `<span>${escapeHTML(badge)}</span>`).join("")}</div><h3>Thế mạnh giảng dạy</h3><ul class="strength-list">${teacher.strengths.map((strength) => `<li>${icon("check", 13)} ${escapeHTML(strength)}</li>`).join("")}</ul>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button primary")}</div></div></section><section class="section compact tint"><div class="container section-action">${link("← Xem toàn bộ giáo viên", "/giao-vien", "arrow-link")}</div></section>`);
  }
  return shell(`${pageHero("ĐỘI NGŨ GIÁO VIÊN", "Người đồng hành cùng con", "Đội ngũ giáo viên giàu kinh nghiệm, có chứng chỉ chuyên môn và thế mạnh giảng dạy đa dạng.", "師")}<section class="section"><div class="container"><div class="split-heading"><div><p class="eyebrow">HỒ SƠ GIÁO VIÊN</p><h2>Hiểu người sẽ đồng hành cùng con.</h2></div><p>Khám phá kinh nghiệm, phong cách và thế mạnh của từng giáo viên để gia đình an tâm lựa chọn.</p></div><div class="teacher-grid">${teachersData.map((teacher) => teacherCard(teacher)).join("")}</div></div></section><section class="section compact"><div class="container"><div class="cta-banner"><p class="eyebrow">CẦN GỢI Ý LỚP HỌC?</p><h2>Chia sẻ điểm bắt đầu của con.</h2>${link("Tìm lớp cho con", "/tim-lop-cho-con", "button light")}</div></div></section>`);
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
  window.history.pushState({}, "", destination.pathname);
  renderPage();
});

loadCourses().then(renderPage).catch(() => {
  document.querySelector("#app").innerHTML = shell(`<section class="not-found"><div><p class="eyebrow">BAMBOO CHINESE</p><h1>Chưa thể mở lộ trình.</h1><p class="lede" style="margin:18px auto 0">Vui lòng tải lại trang để thử lại.</p></div></section>`);
});
