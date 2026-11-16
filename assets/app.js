/* Static GitHub Pages blog. Edit the JSON files in the repository root to update content. */
(() => {
  const page = document.documentElement.dataset.page || "home";
  const base = new URL(document.documentElement.dataset.base || "./", location.href);
  const root = document.getElementById("app");
  const url = (path) => new URL(path, base).href;

  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };

  function safeHref(value) {
    const raw = String(value || "").trim();
    if (!raw) return null;
    if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(raw)) return raw;
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) return `mailto:${raw}`;
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    try {
      const parsed = new URL(candidate);
      return /^(https?:)$/.test(parsed.protocol) && parsed.hostname.includes(".") ? parsed.href : null;
    } catch { return null; }
  }

  function appendLinkedText(target, value) {
    const text = String(value || "");
    const pattern = /!\[([^\]\r\n]+)\]/g;
    let last = 0;
    for (const match of text.matchAll(pattern)) {
      target.append(document.createTextNode(text.slice(last, match.index)));
      const href = safeHref(match[1]);
      if (href) {
        const link = el("a", "inline-link", match[1]);
        link.href = href;
        if (!href.startsWith("mailto:")) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
        }
        target.append(link);
      } else {
        target.append(document.createTextNode(match[0]));
      }
      last = match.index + match[0].length;
    }
    target.append(document.createTextNode(text.slice(last)));
  }

  async function loadJson(file) {
    const response = await fetch(url(file), { cache: "no-cache" });
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    return response.json();
  }

  function shell() {
    const nav = [
      ["home", "HOME", ""],
      ["projects", "PROJECTS", "projects/"],
      ["contact", "CONTACT", "contact/"]
    ];
    root.innerHTML = `
      <div class="ambient ambient-one" aria-hidden="true"></div>
      <div class="ambient ambient-two" aria-hidden="true"></div>
      <div class="site-shell">
        <header class="site-header">
          <a class="brand" href="${url("")}" aria-label="QwQ 홈"><span class="brand-mark">Q<span class="brand-dot">.</span></span><span class="brand-copy">QwQ<span class="brand-sub">/ SECURITY NOTES</span></span></a>
          <nav class="nav" aria-label="주 메뉴"></nav>
          <span class="header-status"><span class="status-light"></span> ONLINE</span>
        </header>
        <main id="main-content"></main>
        <footer class="site-footer"><span>© <span id="year"></span> QwQ</span><span>LEARNING SECURITY, ONE NOTE AT A TIME <span class="footer-star">✦</span></span></footer>
      </div>`;
    const navNode = root.querySelector(".nav");
    for (const [key, label, path] of nav) {
      const a = el("a", key === page ? "nav-link active" : "nav-link", label);
      a.href = url(path);
      if (key === page) a.setAttribute("aria-current", "page");
      navNode.append(a);
    }
    root.querySelector("#year").textContent = new Date().getFullYear();
    return root.querySelector("#main-content");
  }

  function errorNotice(message) {
    const box = el("p", "error-notice", message);
    box.setAttribute("role", "alert");
    return box;
  }

  function dateRange(start, end) {
    return end ? `${start || ""} ~ ${end}` : String(start || "날짜 미입력");
  }

  async function home(main) {
    main.classList.add("home-main");
    main.innerHTML = `
      <section class="home-panel" aria-labelledby="home-title">
        <div class="home-portrait profile-frame">
          <div class="profile-corner top-left" aria-hidden="true"></div><div class="profile-corner bottom-right" aria-hidden="true"></div>
          <img class="profile-image" src="${url("profile.png")}" alt="QwQ 프로필 사진">
        </div>
        <div class="home-content">
          <header class="home-heading"><p class="small-label">SECURITY STUDENT / QwQ</p><h1 id="home-title">QwQ<span class="accent">.</span></h1><p>정보보안을 공부하는 학생</p></header>
          <section class="home-description" aria-label="자기소개"><span class="small-label">ABOUT ME</span><div id="description" class="description"></div></section>
          <section class="home-history" aria-labelledby="timeline-title">
            <div class="home-history-heading"><div><span class="small-label">HISTORY</span><h2 id="timeline-title">이력<span class="accent">.</span></h2></div><div id="timeline-pager" class="timeline-pager" aria-label="이력 페이지"></div></div>
            <div id="timeline" class="timeline"></div>
          </section>
        </div>
      </section>`;

    const profile = main.querySelector(".profile-image");
    profile.addEventListener("error", () => {
      profile.style.display = "none";
      const fallback = el("div", "profile-fallback", "Q");
      profile.parentElement.append(fallback);
    });

    const [descResult, summaryResult] = await Promise.allSettled([loadJson("desc.json"), loadJson("summary.json")]);
    const description = main.querySelector("#description");
    if (descResult.status === "fulfilled") {
      const value = descResult.value;
      const content = typeof value === "string" ? value : String(value?.desc || "");
      appendLinkedText(description, content);
    } else description.append(errorNotice("자기소개를 불러오지 못했습니다. desc.json을 확인해 주세요."));

    const timeline = main.querySelector("#timeline");
    if (summaryResult.status === "fulfilled" && Array.isArray(summaryResult.value)) {
      const items = summaryResult.value;
      const pager = main.querySelector("#timeline-pager");
      let currentPage = 0;
      function renderTimeline() {
        const pageSize = window.innerWidth <= 650 ? 2 : window.innerHeight < 700 ? 3 : 4;
        const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
        currentPage = Math.min(currentPage, totalPages - 1);
        timeline.replaceChildren();
        pager.replaceChildren();
        if (!items.length) {
          timeline.append(el("p", "home-empty", "등록된 이력이 없습니다."));
          return;
        }
        items.slice(currentPage * pageSize, (currentPage + 1) * pageSize).forEach((item, offset) => {
          const row = el("article", "timeline-row");
          row.append(el("span", "timeline-index", String(currentPage * pageSize + offset + 1).padStart(2, "0")));
          row.append(el("time", "timeline-date", dateRange(item.start, item.end)));
          const desc = el("p", "timeline-desc");
          appendLinkedText(desc, item.desc);
          row.append(desc);
          timeline.append(row);
        });
        if (totalPages > 1) {
          const previous = el("button", "pager-button", "←");
          previous.type = "button";
          previous.setAttribute("aria-label", "이전 이력 페이지");
          previous.disabled = currentPage === 0;
          previous.addEventListener("click", () => { currentPage--; renderTimeline(); });
          const indicator = el("span", "pager-indicator", `${String(currentPage + 1).padStart(2, "0")} / ${String(totalPages).padStart(2, "0")}`);
          const next = el("button", "pager-button", "→");
          next.type = "button";
          next.setAttribute("aria-label", "다음 이력 페이지");
          next.disabled = currentPage === totalPages - 1;
          next.addEventListener("click", () => { currentPage++; renderTimeline(); });
          pager.append(previous, indicator, next);
        }
      }
      renderTimeline();
      window.addEventListener("resize", renderTimeline);
    } else timeline.append(errorNotice("이력을 불러오지 못했습니다. summary.json을 확인해 주세요."));
  }

  function projectCard(name, project) {
    const card = el("article", "project-card");
    const trigger = el("div", "project-trigger");
    trigger.setAttribute("role", "button");
    trigger.tabIndex = 0;
    trigger.setAttribute("aria-expanded", "false");
    const detailId = `project-detail-${Math.random().toString(36).slice(2)}`;
    trigger.setAttribute("aria-controls", detailId);
    const top = el("div", "project-top");
    top.append(el("time", "project-date", dateRange(project.start, project.end)));
    top.append(el("span", "project-arrow", "↗"));
    const title = el("h2", "project-title", name);
    const text = String(project.desc || "");
    const [firstLine, ...rest] = text.split(/\r?\n/);
    const preview = el("p", "project-preview");
    appendLinkedText(preview, firstLine);
    const tags = el("div", "project-tags");
    const cleanTags = Array.isArray(project.tags) ? [...new Set(project.tags.filter((tag) => typeof tag === "string" && tag.trim()).map((tag) => tag.trim()))] : [];
    cleanTags.forEach((tag) => tags.append(el("span", "tag", `#${tag}`)));
    trigger.append(top, title, preview, tags);
    const detail = el("div", "project-detail");
    detail.id = detailId;
    detail.hidden = true;
    if (rest.length) {
      detail.append(el("span", "small-label", "MORE ABOUT THIS PROJECT"));
      const body = el("p", "project-detail-text");
      appendLinkedText(body, rest.join("\n"));
      detail.append(body);
    } else detail.append(el("p", "project-detail-text", "추가 설명이 없습니다."));
    const toggle = () => {
      const open = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", String(!open));
      detail.hidden = open;
    };
    trigger.addEventListener("click", (event) => {
      if (!event.target.closest("a")) toggle();
    });
    trigger.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && !event.target.closest("a")) {
        event.preventDefault();
        toggle();
      }
    });
    card.append(trigger, detail);
    return { card, tags: cleanTags };
  }

  async function projects(main) {
    main.innerHTML = `
      <section class="page-intro"><div class="page-intro-glow" aria-hidden="true"></div><p class="eyebrow"><span class="eyebrow-line"></span> THE WORK <span class="eyebrow-index">002 / 003</span></p><h1>Projects<span class="accent">.</span></h1><p>공부하며 진행한 프로젝트를 정리합니다.</p><span class="page-intro-mark" aria-hidden="true">P/</span></section>
      <section class="section projects-section" aria-label="프로젝트 목록">
        <div class="project-toolbar"><div><span class="small-label">ARCHIVE / SELECTED WORK</span><p class="toolbar-title"><strong id="project-count">0</strong>개의 프로젝트</p></div><div class="filter-wrap"><button id="filter-button" class="filter-button" type="button" aria-expanded="false" aria-controls="filter-panel">태그 필터 <span id="filter-count"></span><span aria-hidden="true" class="filter-chevron">⌄</span></button><div id="filter-panel" class="filter-panel" hidden><label class="filter-search-label" for="tag-search">태그 검색</label><input id="tag-search" type="search" placeholder="태그 찾기" autocomplete="off"><div id="tag-options" class="tag-options"></div><p class="filter-help">여러 태그를 선택하면 하나라도 포함된 프로젝트가 표시됩니다.</p></div></div></div>
        <div id="active-filters" class="active-filters" aria-live="polite"></div><div id="project-list" class="project-list"></div><p id="no-results" class="empty-note" hidden>선택한 태그에 해당하는 프로젝트가 없습니다.</p>
      </section>`;
    let data;
    try { data = await loadJson("projects.json"); }
    catch { main.querySelector("#project-list").append(errorNotice("프로젝트를 불러오지 못했습니다. projects.json을 확인해 주세요.")); return; }
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      main.querySelector("#project-list").append(errorNotice("projects.json은 프로젝트 이름을 키로 갖는 객체여야 합니다."));
      return;
    }
    const entries = Object.entries(data);
    const list = main.querySelector("#project-list");
    const cards = entries.map(([name, project]) => projectCard(name, project || {}));
    cards.forEach(({ card }) => list.append(card));
    if (!cards.length) list.append(el("p", "empty-note", "등록된 프로젝트가 없습니다."));

    const uniqueTags = [...new Set(cards.flatMap(({ tags }) => tags))].sort((a, b) => a.localeCompare(b, "ko"));
    const selected = new Set();
    const filterButton = main.querySelector("#filter-button");
    const filterPanel = main.querySelector("#filter-panel");
    const tagSearch = main.querySelector("#tag-search");
    const tagOptions = main.querySelector("#tag-options");
    const filters = main.querySelector("#active-filters");
    function update() {
      let visible = 0;
      cards.forEach(({ card, tags }) => {
        const show = !selected.size || tags.some((tag) => selected.has(tag));
        card.hidden = !show;
        if (show) visible++;
      });
      main.querySelector("#project-count").textContent = visible;
      main.querySelector("#no-results").hidden = visible !== 0 || cards.length === 0;
      main.querySelector("#filter-count").textContent = selected.size ? `(${selected.size})` : "";
      filters.replaceChildren();
      selected.forEach((tag) => {
        const chip = el("button", "filter-chip", `${tag} ×`);
        chip.type = "button";
        chip.setAttribute("aria-label", `${tag} 필터 해제`);
        chip.addEventListener("click", () => { selected.delete(tag); updateOptions(); update(); });
        filters.append(chip);
      });
    }
    function updateOptions() {
      const term = tagSearch.value.trim().toLocaleLowerCase();
      tagOptions.replaceChildren();
      uniqueTags.filter((tag) => tag.toLocaleLowerCase().includes(term)).forEach((tag) => {
        const label = el("label", "tag-option");
        const checkbox = el("input");
        checkbox.type = "checkbox";
        checkbox.value = tag;
        checkbox.checked = selected.has(tag);
        checkbox.addEventListener("change", () => {
          checkbox.checked ? selected.add(tag) : selected.delete(tag);
          update();
        });
        label.append(checkbox, el("span", "", tag));
        tagOptions.append(label);
      });
      if (!tagOptions.childElementCount) tagOptions.append(el("p", "filter-empty", "일치하는 태그가 없습니다."));
    }
    filterButton.addEventListener("click", () => {
      const open = filterButton.getAttribute("aria-expanded") === "true";
      filterButton.setAttribute("aria-expanded", String(!open));
      filterPanel.hidden = open;
      if (!open) tagSearch.focus();
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".filter-wrap")) { filterPanel.hidden = true; filterButton.setAttribute("aria-expanded", "false"); }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !filterPanel.hidden) { filterPanel.hidden = true; filterButton.setAttribute("aria-expanded", "false"); filterButton.focus(); }
    });
    tagSearch.addEventListener("input", updateOptions);
    updateOptions();
    update();
  }

  async function contact(main) {
    main.innerHTML = `
      <section class="page-intro"><div class="page-intro-glow" aria-hidden="true"></div><p class="eyebrow"><span class="eyebrow-line"></span> SAY HELLO <span class="eyebrow-index">003 / 003</span></p><h1>Contact<span class="accent">.</span></h1><p>질문이나 피드백이 있다면 편하게 연락해 주세요.</p><span class="page-intro-mark" aria-hidden="true">C/</span></section>
      <section class="section contact-section"><div class="section-heading"><span class="section-number">CONNECT / ONLINE</span><h2>연락처<span class="accent">.</span></h2><p>FIND ME ON THE WEB</p></div><div id="contact-list" class="contact-list"></div></section>`;
    let data;
    try { data = await loadJson("contact.json"); }
    catch { main.querySelector("#contact-list").append(errorNotice("연락처를 불러오지 못했습니다. contact.json을 확인해 주세요.")); return; }
    const labels = { instagram: "Instagram", github: "GitHub", gmail: "Gmail", boj: "BOJ", ctftime: "CTFtime" };
    const hints = { instagram: "SOCIAL", github: "CODE", gmail: "EMAIL", boj: "ALGORITHM", ctftime: "SECURITY" };
    const entries = Object.entries(data || {});
    const list = main.querySelector("#contact-list");
    if (!entries.length) list.append(el("p", "empty-note", "등록된 연락처가 없습니다."));
    entries.forEach(([key, value]) => {
      const item = value || {};
      const href = safeHref(item.link);
      const card = el(href ? "a" : "div", href ? "contact-card" : "contact-card disabled");
      if (href) {
        card.href = href;
        if (!href.startsWith("mailto:")) { card.target = "_blank"; card.rel = "noopener noreferrer"; }
      }
      const iconWrap = el("span", "contact-icon");
      const icon = String(item.icon || "");
      if (icon && (/^https?:\/\//i.test(icon) || !/^[a-z]+:/i.test(icon))) {
        const image = el("img");
        image.src = /^https?:\/\//i.test(icon) ? icon : url(icon.replace(/^\/+/, ""));
        image.alt = "";
        image.addEventListener("error", () => { image.remove(); iconWrap.append(el("span", "contact-initial", key.slice(0, 2).toUpperCase())); });
        iconWrap.append(image);
      } else iconWrap.append(el("span", "contact-initial", key.slice(0, 2).toUpperCase()));
      const text = el("span", "contact-text");
      text.append(el("span", "contact-hint", hints[key.toLowerCase()] || "LINK"), el("strong", "", labels[key.toLowerCase()] || key));
      card.append(iconWrap, text, el("span", "contact-action", href ? "↗" : "—"));
      if (!href) card.title = "contact.json에 링크를 입력하면 활성화됩니다.";
      list.append(card);
    });
  }

  const main = shell();
  if (page === "projects") projects(main);
  else if (page === "contact") contact(main);
  else home(main);
})();
