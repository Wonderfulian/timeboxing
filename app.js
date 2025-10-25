window.addEventListener('DOMContentLoaded', function () {
  // 오늘 날짜 표시
  const today = new Date();
  document.getElementById('today-date').textContent =
    today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

  // 시간 옵션 생성 (1~12시, 오전/오후)
  function fillHourSelect(sel, defaultValue) {
    sel.innerHTML = '';
    for (let h = 1; h <= 12; h++) {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = h + '시';
      if (defaultValue === h) opt.selected = true;
      sel.appendChild(opt);
    }
  }
  fillHourSelect(document.getElementById('wake-hour'), 7); // 기본 기상 7시
  fillHourSelect(document.getElementById('sleep-hour'), 11); // 기본 취침 11시

  // 할 일 추가
  function addTaskToList(listId, inputId, className) {
    const val = document.getElementById(inputId).value.trim();
    if (val) {
      const li = document.createElement('li');
      li.textContent = val;
      li.className = className || '';
      li.draggable = true;
      document.getElementById(listId).appendChild(li);
      document.getElementById(inputId).value = '';
      attachTaskEvents(li);
    }
  }
  document.getElementById('add-brain').onclick = function () {
    addTaskToList('brain-list', 'brain-input', '');
  };
  document.getElementById('add-core').onclick = function () {
    addTaskToList('core-list', 'core-input', 'core3');
  };

  // 드래그 앤 드롭 이벤트 연결
  function attachTaskEvents(li) {
    li.addEventListener('mousedown', function (event) {
      event.preventDefault();
    });
    li.addEventListener('click', function (event) {
      event.preventDefault();
      addTaskToTimeline(li.textContent, li.className);
    });
    li.addEventListener('dragstart', function (event) {
      event.dataTransfer.setData('text/plain', JSON.stringify({
        text: li.textContent,
        className: li.className
      }));
    });
  }

  // 타임라인 슬롯 드롭 이벤트 연결
  function attachSlotEvents(slot) {
    slot.addEventListener('dragover', function (event) {
      event.preventDefault();
      slot.classList.add('dragover');
    });
    slot.addEventListener('dragleave', function (event) {
      slot.classList.remove('dragover');
    });
    slot.addEventListener('drop', function (event) {
      slot.classList.remove('dragover');
      const data = event.dataTransfer.getData('text/plain');
      if (data) {
        const obj = JSON.parse(data);
        addTaskToSlot(slot, obj.text, obj.className);
      }
    });
  }

  // 타임라인에 할 일 추가(클릭 시, 맨 밑에 추가)
  function addTaskToTimeline(text, className) {
    const ul = document.getElementById('timeline-list');
    const li = document.createElement('li');
    li.className = 'timeline-task ' + (className || '');
    li.innerHTML = `<span>${text}</span>
      <button class="complete-btn">완료</button>
      <button class="delete-btn">삭제</button>`;
    ul.appendChild(li);

    li.querySelector('.complete-btn').onclick = function () {
      li.classList.toggle('completed');
    };
    li.querySelector('.delete-btn').onclick = function () {
      ul.removeChild(li);
    };
  }

  // 타임라인 슬롯에 할 일 추가(드래그 시, 해당 시간에 추가)
  function addTaskToSlot(slot, text, className) {
    const task = document.createElement('div');
    task.className = 'timeline-task ' + (className || '');
    task.innerHTML = `<span>${text}</span>
      <button class="complete-btn">완료</button>
      <button class="delete-btn">삭제</button>`;
    slot.appendChild(task);

    task.querySelector('.complete-btn').onclick = function () {
      task.classList.toggle('completed');
    };
    task.querySelector('.delete-btn').onclick = function () {
      slot.removeChild(task);
    };
  }

  // 시간대 만들기
  document.getElementById('set-times').onclick = function () {
    const wakeAmpm = document.getElementById('wake-ampm').value;
    const wakeHour = parseInt(document.getElementById('wake-hour').value, 10);
    const sleepAmpm = document.getElementById('sleep-ampm').value;
    const sleepHour = parseInt(document.getElementById('sleep-hour').value, 10);

    // 오전/오후 → 24시간 변환
    function to24(ampm, hour) {
      if (ampm === '오전') {
        return hour === 12 ? 0 : hour;
      }
      return hour === 12 ? 12 : hour + 12;
    }
    const start = to24(wakeAmpm, wakeHour);
    const end = to24(sleepAmpm, sleepHour);

    const ul = document.getElementById('timeline-list');
    ul.innerHTML = '';
    if (isNaN(start) || isNaN(end) || start === end) {
      ul.innerHTML = '<li>시간대를 올바르게 선택해 주세요!</li>';
      return;
    }
    let cur = start;
    while (true) {
      const slot = document.createElement('li');
      slot.className = 'timeline-slot';
      attachSlotEvents(slot);
      const h = cur % 24;
      const ampm = h < 12 ? '오전' : '오후';
      const dispH = h === 0 ? 12 : (h > 12 ? h - 12 : h);
      slot.innerHTML = `<strong>${ampm} ${dispH}:00</strong>`;
      ul.appendChild(slot);
      if (cur === end) break;
      cur = (cur + 1) % 24;
      if (cur === start) break; // 무한루프 방지
    }
  };

  // PDF 저장 기능
  document.getElementById('save-pdf').onclick = function () {
    const element = document.getElementById('timeline-list');
    html2pdf().set({ margin: 0.5, filename: 'timeline.pdf' }).from(element).save();
  };
});