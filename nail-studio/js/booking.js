/* ============================================================
   booking.js — 預約表單頁（booking.html）腳本
   ============================================================ */


/* ── 1. Tab 切換（線上預約 / 預約查詢 / 查看可預約時間）──── */
(function () {
  const tabBtns  = document.querySelectorAll('.booking-tab-btn');
  const tabPanels = {
    form:         document.getElementById('tab-form'),
    query:        document.getElementById('tab-query'),
    availability: document.getElementById('tab-availability')
  };

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      // 更新按鈕狀態
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // 切換面板
      Object.entries(tabPanels).forEach(([key, panel]) => {
        if (panel) panel.classList.toggle('active', key === target);
      });

      // 捲回頁頂（含 header 高度）
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();


/* ── 2. 服務選擇卡（單選）────────────────────────────────── */
(function () {
  const cards = document.querySelectorAll('.service-select-card');
  if (!cards.length) return;

  // 讀取 URL 參數預選服務
  const params = new URLSearchParams(window.location.search);
  const preSelect = params.get('service');

  cards.forEach(card => {
    // 若 URL 帶有服務名稱，自動選取
    if (preSelect && card.dataset.service === preSelect) {
      card.classList.add('selected');
      updateSummary(card);
    }

    card.addEventListener('click', () => {
      // 取消其他選取
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      updateSummary(card);
    });
  });

  function updateSummary(card) {
    const serviceEl  = document.getElementById('sum-service');
    const priceEl    = document.getElementById('sum-price');
    const durationEl = document.getElementById('sum-duration');

    if (serviceEl)  serviceEl.textContent  = card.dataset.service  || '—';
    if (priceEl)    priceEl.textContent    = card.dataset.price    || '—';
    if (durationEl) durationEl.textContent = card.dataset.duration || '—';
  }
})();


/* ── 3. 日期 / 時段同步到摘要欄 ──────────────────────────── */
(function () {
  const dateInput = document.getElementById('f-date');
  const timeInput = document.getElementById('f-time');
  const sumDate   = document.getElementById('sum-date');
  const sumTime   = document.getElementById('sum-time');

  // 日期最小值設為今天
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    dateInput.addEventListener('change', () => {
      if (sumDate) {
        sumDate.textContent = dateInput.value
          ? formatDate(dateInput.value)
          : '尚未選擇';
      }
    });
  }

  if (timeInput) {
    timeInput.addEventListener('change', () => {
      if (sumTime) {
        sumTime.textContent = timeInput.value || '尚未選擇';
      }
    });
  }

  function formatDate(str) {
    const d = new Date(str + 'T00:00:00');
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} (${days[d.getDay()]})`;
  }
})();


/* ── 4. 表單送出（假資料模擬成功）──────────────────────────── */
(function () {
  const form          = document.getElementById('booking-form');
  const layout        = document.getElementById('booking-form-layout');
  const successBlock  = document.getElementById('booking-success');
  const successDetail = document.getElementById('success-detail');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // ── 基本驗證 ──
    const name    = document.getElementById('f-name')?.value.trim();
    const phone   = document.getElementById('f-phone')?.value.trim();
    const lineName = document.getElementById('f-line')?.value.trim();
    const date    = document.getElementById('f-date')?.value;
    const time    = document.getElementById('f-time')?.value;
    const note    = document.getElementById('f-note')?.value.trim();
    const selectedCard = document.querySelector('.service-select-card.selected');

    // 簡單欄位檢查
    if (!name || !phone || !lineName || !date || !time) {
      alert('請填寫所有必填欄位（姓名、手機、LINE名稱、日期、時段）');
      return;
    }

    if (!selectedCard) {
      alert('請選擇服務項目');
      return;
    }

    // ── 組成預約資料 ──
    const bookingData = {
      name,
      phone,
      line_name:   lineName,
      service:     selectedCard.dataset.service,
      price:       selectedCard.dataset.price,
      duration:    selectedCard.dataset.duration,
      date,
      time,
      note:        note || '（無備註）'
    };

    /* ────────────────────────────────────────────────────────
       【串接標示 A】Google Sheet 送出點
       將以下假模擬替換為真實 fetch：

       fetch('YOUR_APPS_SCRIPT_URL', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(bookingData)
       });

       Apps Script 端接收後寫入 Google Sheet，
       並可選擇觸發 LINE Notify 或 LINE Messaging API 通知。
       詳見 README.md #串接說明
    ──────────────────────────────────────────────────────── */

    // 目前：假資料模擬成功
    showSuccess(bookingData);
  });

  function showSuccess(data) {
    // 格式化日期
    const d = new Date(data.date + 'T00:00:00');
    const days = ['日','一','二','三','四','五','六'];
    const dateStr = `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} (${days[d.getDay()]})`;

    // 建立成功明細 HTML
    const rows = [
      { key: '姓名',     val: data.name },
      { key: '手機',     val: data.phone },
      { key: 'LINE 名稱', val: data.line_name },
      { key: '服務項目', val: data.service },
      { key: '價格區間', val: data.price },
      { key: '所需時間', val: data.duration },
      { key: '預約日期', val: dateStr },
      { key: '預約時段', val: data.time },
      { key: '備註',     val: data.note }
    ];

    if (successDetail) {
      successDetail.innerHTML = rows.map(r => `
        <div class="success-detail-row">
          <span class="success-detail-key">${r.key}</span>
          <span class="success-detail-val">${r.val}</span>
        </div>
      `).join('');
    }

    // 隱藏表單、顯示成功區塊
    if (layout)       layout.style.display       = 'none';
    if (successBlock) successBlock.classList.add('active');

    // 滾回頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
})();


/* ── 5. Modal：離開確認 ─────────────────────────────────────── */
/* 點擊 Header Logo 時若表單有填寫內容，彈出確認 Modal
   【修改區域】顏色在 booking.css 的 #exit-modal 區塊調整        */
(function () {
  const backBtn    = document.getElementById('back-to-home');
  const modal      = document.getElementById('exit-modal');
  const stayBtn    = document.getElementById('modal-stay');
  const leaveBtn   = document.getElementById('modal-leave');
  const form       = document.getElementById('booking-form');

  if (!backBtn || !modal) return;

  let targetHref = 'index.html';

  function hasFormContent() {
    if (!form) return false;
    const inputs = form.querySelectorAll('input, textarea, select');
    for (const el of inputs) {
      if (el.value && el.value !== '') return true;
    }
    // 服務卡已選取也算有內容
    if (document.querySelector('.service-select-card.selected')) return true;
    return false;
  }

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  backBtn.addEventListener('click', function (e) {
    if (hasFormContent()) {
      e.preventDefault();
      targetHref = this.getAttribute('href') || 'index.html';
      openModal();
    }
    // 若表單空白，直接跳轉（不攔截）
  });

  // 繼續填寫：關閉 Modal
  stayBtn?.addEventListener('click', closeModal);

  // 確認離開：前往首頁
  leaveBtn?.addEventListener('click', () => {
    closeModal();
    window.location.href = targetHref;
  });

  // 點遮罩關閉
  modal.addEventListener('click', e => {
    if (e.target === modal) closeModal();
  });

  // ESC 關閉
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
})();


/* ── 6. 靜態週曆（可預約時間 Tab）──────────────────────────── */
/* 【串接標示 B】未來替換為 Google Calendar API 資料
   串接方式詳見 README.md #Google Calendar 串接              */
(function () {
  const calGrid        = document.getElementById('cal-grid');
  const monthLabel     = document.getElementById('cal-month-label');
  const prevBtn        = document.getElementById('cal-prev');
  const nextBtn        = document.getElementById('cal-next');
  const timeSlotsWrap  = document.getElementById('time-slots-wrap');
  const timeSlotsTitle = document.getElementById('time-slots-title');
  const timeSlotsGrid  = document.getElementById('time-slots-grid');

  if (!calGrid) return;

  // 假資料：標記哪些日期「有空」（相對今天的 offset）
  const AVAILABLE_OFFSETS = [1, 2, 4, 5, 8, 9, 11, 14, 15, 16];
  const FULL_OFFSETS       = [3, 6, 10, 12, 13];

  // 時段假資料
  const ALL_SLOTS = ['10:00','10:30','11:00','11:30','12:00','12:30',
                     '13:00','14:00','14:30','15:00','15:30','16:00',
                     '16:30','17:00','17:30','18:00'];
  const FULL_SLOTS_SAMPLE  = ['10:00','11:30','14:30','16:30'];

  let displayDate = new Date();
  displayDate.setDate(1);

  function renderCalendar() {
    const year  = displayDate.getFullYear();
    const month = displayDate.getMonth();
    monthLabel.textContent = `${year} 年 ${month + 1} 月`;

    // 移除舊日期格（保留星期標題）
    const oldDays = calGrid.querySelectorAll('.calendar-day, .empty-cell');
    oldDays.forEach(el => el.remove());

    const firstDay  = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const today     = new Date();
    const todayStr  = today.toDateString();

    // 空格補齊
    for (let i = 0; i < firstDay; i++) {
      const blank = document.createElement('div');
      blank.className = 'empty-cell';
      calGrid.appendChild(blank);
    }

    for (let d = 1; d <= totalDays; d++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'calendar-day';

      const thisDate = new Date(year, month, d);
      const diffDays = Math.round((thisDate - today) / 86400000);

      const dot = document.createElement('div');
      dot.className = 'dot';

      if (thisDate.toDateString() === todayStr) {
        dayEl.classList.add('today');
      }

      if (AVAILABLE_OFFSETS.includes(diffDays)) {
        dayEl.classList.add('available');
        dayEl.appendChild(document.createTextNode(d));
        dayEl.appendChild(dot);
        dayEl.addEventListener('click', () => showSlots(thisDate, false));
      } else if (FULL_OFFSETS.includes(diffDays)) {
        dayEl.classList.add('full');
        dayEl.appendChild(document.createTextNode(d));
        dayEl.appendChild(dot);
        dayEl.addEventListener('click', () => showSlots(thisDate, true));
      } else if (thisDate < today && thisDate.toDateString() !== todayStr) {
        dayEl.classList.add('disabled');
        dayEl.appendChild(document.createTextNode(d));
      } else {
        dayEl.appendChild(document.createTextNode(d));
        dayEl.addEventListener('click', () => showSlots(thisDate, true));
      }

      calGrid.appendChild(dayEl);
    }
  }

  function showSlots(date, isFull) {
    const days = ['日','一','二','三','四','五','六'];
    const label = `${date.getFullYear()}.${String(date.getMonth()+1).padStart(2,'0')}.${String(date.getDate()).padStart(2,'0')} (${days[date.getDay()]}) 可預約時段`;
    if (timeSlotsTitle) timeSlotsTitle.textContent = label;

    if (timeSlotsGrid) {
      timeSlotsGrid.innerHTML = '';
      ALL_SLOTS.forEach(slot => {
        const el = document.createElement('div');
        el.className = 'time-slot';
        el.textContent = slot;

        if (!isFull || !FULL_SLOTS_SAMPLE.includes(slot)) {
          el.classList.add('available');
        } else {
          el.classList.add('full');
          el.title = '此時段已額滿';
        }
        timeSlotsGrid.appendChild(el);
      });
    }

    if (timeSlotsWrap) timeSlotsWrap.style.display = 'block';
  }

  prevBtn?.addEventListener('click', () => {
    displayDate.setMonth(displayDate.getMonth() - 1);
    renderCalendar();
  });

  nextBtn?.addEventListener('click', () => {
    displayDate.setMonth(displayDate.getMonth() + 1);
    renderCalendar();
  });

  renderCalendar();
})();


/* ── 7. 預約查詢（假資料模擬）─────────────────────────────── */
/* 【串接標示 C】未來替換為後端查詢 API
   串接方式詳見 README.md #預約查詢串接                        */
(function () {
  const queryBtn    = document.getElementById('query-btn');
  const phoneInput  = document.getElementById('q-phone');
  const resultBlock = document.getElementById('query-result');

  if (!queryBtn) return;

  // 假資料範本
  const FAKE_RECORDS = {
    '0912345678': {
      name:    '王小美',
      service: '漸層美甲',
      date:    '2026.06.10 (三)',
      time:    '14:00',
      status:  '待確認'
    },
    '0987654321': {
      name:    '林小花',
      service: '法式美甲',
      date:    '2026.06.12 (五)',
      time:    '11:00',
      status:  '已確認'
    }
  };

  queryBtn.addEventListener('click', () => {
    const phone = phoneInput?.value.trim().replace(/-/g, '');

    if (!phone) {
      alert('請輸入手機號碼');
      return;
    }

    /* ────────────────────────────────────────────────────────
       【串接標示 C】預約查詢點
       替換以下假資料為真實 API 呼叫：

       fetch(`YOUR_APPS_SCRIPT_URL?action=query&phone=${phone}`)
         .then(r => r.json())
         .then(data => renderQueryResult(data));
    ──────────────────────────────────────────────────────── */

    const record = FAKE_RECORDS[phone];

    if (record) {
      renderQueryResult(record);
    } else {
      // 找不到
      if (resultBlock) {
        resultBlock.classList.add('active');
        resultBlock.innerHTML = `
          <p style="text-align:center;color:var(--color-text-muted);font-size:0.88rem;padding:16px 0">
            查無相關預約資料，請確認手機號碼是否正確。
          </p>`;
      }
    }
  });

  function renderQueryResult(record) {
    if (!resultBlock) return;

    const statusClass = record.status === '已確認'
      ? 'status-badge--confirmed'
      : 'status-badge--pending';

    resultBlock.classList.add('active');
    resultBlock.innerHTML = `
      <p class="query-result-title">查詢結果</p>
      <div class="query-result-row">
        <span class="query-result-key">姓名</span>
        <span class="query-result-val">${record.name}</span>
      </div>
      <div class="query-result-row">
        <span class="query-result-key">服務項目</span>
        <span class="query-result-val">${record.service}</span>
      </div>
      <div class="query-result-row">
        <span class="query-result-key">預約日期</span>
        <span class="query-result-val">${record.date}</span>
      </div>
      <div class="query-result-row">
        <span class="query-result-key">時段</span>
        <span class="query-result-val">${record.time}</span>
      </div>
      <div class="query-result-row">
        <span class="query-result-key">狀態</span>
        <span class="query-result-val">
          <span class="status-badge ${statusClass}">${record.status}</span>
        </span>
      </div>
    `;
  }
})();
