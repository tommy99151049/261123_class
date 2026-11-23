/* =========================================
   청첩장 스크립트
   ========================================= */

// 결혼식 일시 (여기만 바꾸면 캘린더·카운트다운이 함께 바뀝니다)
const WEDDING_DATE = new Date(2027, 4, 15, 13, 0, 0); // 월은 0부터 시작 (4 = 5월)

// 갤러리 이미지: 실제 사진 경로로 교체하세요 (예: "images/photo1.jpg")
// 지금은 사진 대신 부드러운 그라데이션을 보여줍니다.
const GALLERY_IMAGES = [
  "linear-gradient(135deg, #f3dcd2, #e7c9bb)",
  "linear-gradient(135deg, #e6d3c4, #d8c0ae)",
  "linear-gradient(135deg, #efe2d6, #dccbbd)",
  "linear-gradient(135deg, #e9d7d0, #d6b9ad)",
  "linear-gradient(135deg, #f1e6da, #e0cfc0)",
  "linear-gradient(135deg, #e4d4cb, #cdb4a7)",
  "linear-gradient(135deg, #f0dfd8, #e2c5b8)",
  "linear-gradient(135deg, #ebe0d3, #d9c8b6)",
  "linear-gradient(135deg, #f2e1d9, #dfc2b5)",
];

const toBackground = (src) =>
  src.startsWith("linear-gradient") ? src : `url("${src}")`;

/* ---------- 토스트 ---------- */
const toastEl = document.getElementById("toast");
let toastTimer;
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add("is-show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-show"), 2000);
}

/* ---------- 클립보드 복사 ---------- */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // file:// 등 clipboard API가 막힌 환경용 대체 방식
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  showToast("복사되었습니다");
}

document.querySelectorAll("[data-copy]").forEach((btn) => {
  btn.addEventListener("click", () => copyText(btn.dataset.copy));
});

/* ---------- 스크롤 등장 애니메이션 ---------- */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

/* ---------- 갤러리 + 라이트박스 ---------- */
const galleryEl = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
let currentIndex = 0;

GALLERY_IMAGES.forEach((src, i) => {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "gallery__item";
  item.style.background = toBackground(src);
  item.style.backgroundSize = "cover";
  item.setAttribute("aria-label", `사진 ${i + 1} 크게 보기`);
  item.addEventListener("click", () => openLightbox(i));
  galleryEl.appendChild(item);
});

function showImage(index) {
  currentIndex = (index + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
  lightboxImg.style.background = toBackground(GALLERY_IMAGES[currentIndex]);
  lightboxImg.style.backgroundSize = "cover";
  lightboxImg.style.backgroundPosition = "center";
}
function openLightbox(index) {
  showImage(index);
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = "";
}
lightbox.querySelector(".lightbox__prev").addEventListener("click", () => showImage(currentIndex - 1));
lightbox.querySelector(".lightbox__next").addEventListener("click", () => showImage(currentIndex + 1));
lightbox.querySelector(".lightbox__close").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

// 모바일 스와이프
let touchStartX = 0;
lightbox.addEventListener("touchstart", (e) => (touchStartX = e.touches[0].clientX), { passive: true });
lightbox.addEventListener("touchend", (e) => {
  const diff = e.changedTouches[0].clientX - touchStartX;
  if (Math.abs(diff) > 50) showImage(currentIndex + (diff < 0 ? 1 : -1));
});

/* ---------- 캘린더 ---------- */
function renderCalendar() {
  const year = WEDDING_DATE.getFullYear();
  const month = WEDDING_DATE.getMonth();
  const weddingDay = WEDDING_DATE.getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();

  const grid = document.createElement("div");
  grid.className = "cal-grid";

  ["일", "월", "화", "수", "목", "금", "토"].forEach((d, i) => {
    const cell = document.createElement("div");
    cell.className = "dow" + (i === 0 ? " sun" : "");
    cell.textContent = d;
    grid.appendChild(cell);
  });

  for (let i = 0; i < firstDow; i++) grid.appendChild(document.createElement("div"));

  for (let d = 1; d <= lastDate; d++) {
    const cell = document.createElement("div");
    const dow = (firstDow + d - 1) % 7;
    cell.className = "day";
    if (dow === 0) cell.classList.add("sun");
    if (d === weddingDay) cell.classList.add("is-wedding");
    cell.textContent = d;
    grid.appendChild(cell);
  }

  document.getElementById("calendar").appendChild(grid);
}
renderCalendar();

/* ---------- D-day 카운트다운 ---------- */
const countdownEl = document.getElementById("countdown");
const ddayMsg = document.getElementById("dday-msg");
const units = {
  days: countdownEl.querySelector('[data-unit="days"]'),
  hours: countdownEl.querySelector('[data-unit="hours"]'),
  minutes: countdownEl.querySelector('[data-unit="minutes"]'),
  seconds: countdownEl.querySelector('[data-unit="seconds"]'),
};

function updateCountdown() {
  const diff = WEDDING_DATE - new Date();

  if (diff <= 0) {
    Object.values(units).forEach((el) => (el.textContent = "0"));
    ddayMsg.innerHTML = "민준 ♥ 서연의 결혼식이 <em>진행되었습니다</em>. 감사합니다!";
    return false;
  }

  const sec = Math.floor(diff / 1000);
  units.days.textContent = Math.floor(sec / 86400);
  units.hours.textContent = Math.floor((sec % 86400) / 3600);
  units.minutes.textContent = Math.floor((sec % 3600) / 60);
  units.seconds.textContent = sec % 60;

  const dday = Math.ceil(diff / 86400000);
  ddayMsg.innerHTML = `민준 ♥ 서연의 결혼식이 <em>${dday}일</em> 남았습니다.`;
  return true;
}
if (updateCountdown()) {
  const timer = setInterval(() => {
    if (!updateCountdown()) clearInterval(timer);
  }, 1000);
}

/* ---------- 계좌 아코디언 ---------- */
document.querySelectorAll(".accordion__head").forEach((head) => {
  head.addEventListener("click", () => {
    const body = head.nextElementSibling;
    const open = head.getAttribute("aria-expanded") === "true";
    head.setAttribute("aria-expanded", String(!open));
    body.style.maxHeight = open ? "0" : body.scrollHeight + "px";
  });
});

/* ---------- 연락하기 모달 ---------- */
document.querySelectorAll("[data-open]").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById(btn.dataset.open).hidden = false;
    document.body.style.overflow = "hidden";
  });
});
document.querySelectorAll(".modal [data-close]").forEach((el) => {
  el.addEventListener("click", () => {
    el.closest(".modal").hidden = true;
    document.body.style.overflow = "";
  });
});

// ESC 키로 닫기
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal").forEach((m) => (m.hidden = true));
    closeLightbox();
  }
  if (!lightbox.hidden) {
    if (e.key === "ArrowLeft") showImage(currentIndex - 1);
    if (e.key === "ArrowRight") showImage(currentIndex + 1);
  }
});

/* ---------- 방명록 (브라우저 localStorage에 저장) ---------- */
const GB_KEY = "wedding-guestbook";
const gbForm = document.getElementById("guestbook-form");
const gbList = document.getElementById("guestbook-list");

function loadGuestbook() {
  try {
    return JSON.parse(localStorage.getItem(GB_KEY)) || [];
  } catch {
    return [];
  }
}
function saveGuestbook(entries) {
  try {
    localStorage.setItem(GB_KEY, JSON.stringify(entries));
  } catch {
    /* 저장 불가 환경은 무시 */
  }
}
function renderGuestbook() {
  const entries = loadGuestbook();
  gbList.innerHTML = "";

  if (entries.length === 0) {
    const empty = document.createElement("li");
    empty.className = "guestbook__empty";
    empty.textContent = "첫 번째 축하 메시지를 남겨주세요 :)";
    gbList.appendChild(empty);
    return;
  }

  entries.forEach((entry) => {
    const li = document.createElement("li");
    const head = document.createElement("div");
    head.className = "gb-head";
    const name = document.createElement("span");
    name.className = "gb-name";
    name.textContent = entry.name;
    const date = document.createElement("span");
    date.textContent = entry.date;
    head.append(name, date);

    const msg = document.createElement("p");
    msg.className = "gb-msg";
    msg.textContent = entry.message; // textContent로 XSS 방지

    li.append(head, msg);
    gbList.appendChild(li);
  });
}

gbForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = gbForm.name.value.trim();
  const message = gbForm.message.value.trim();
  if (!name || !message) return;

  const now = new Date();
  const entries = loadGuestbook();
  entries.unshift({
    name,
    message,
    date: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`,
  });
  saveGuestbook(entries);
  gbForm.reset();
  renderGuestbook();
  showToast("축하 메시지가 등록되었습니다");
});
renderGuestbook();

/* ---------- 링크 공유 ---------- */
document.getElementById("share-btn").addEventListener("click", async () => {
  const shareData = {
    title: document.title,
    text: "저희 결혼식에 초대합니다.",
    url: location.href,
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
    } catch {
      /* 사용자가 공유를 취소한 경우 */
    }
  } else {
    copyText(location.href);
  }
});
