window.addEventListener('DOMContentLoaded', function () {
  // 오늘 날짜 표시
  const today = new Date();
  document.getElementById('today-date').textContent =
    today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

  // 기상/취침 시간 select 옵션 생성
  function fillTimeSelects() {
    const ampmOpts = ['오전', '오후'];
    const hourOpts = Array.from({ length: 12 }, (_, i) => i + 1);
    const wakeAmpm = document.getElementById('wake-ampm');
    const sleepAmpm = document.getElementById('sleep-ampm');
    const wakeHour = document.getElementById('wake-hour');
    const sleepHour = document.getElementById('sleep-hour');
    [wakeAmpm, sleepAmpm].forEach(sel => {
      sel.innerHTML = '';
      ampmOpts.forEach(op => {
        const o = document.createElement('option');
        o.value = op;
        o.textContent = op;
        sel.appendChild(o);
      });
    });
    [wakeHour, sleepHour].forEach(sel => {
      sel.innerHTML = '';
      hourOpts.forEach(op => {
        const o = document.createElement('option');
        o.value = op;
        o.textContent = op + '시';
        sel.appendChild(o);
      });
    });
  }
  fillTimeSelects();

  // 할 일 추가
  document.getElementById('add-brain').onclick = function () {
    const val = document.getElementById('brain-input').value.trim();
    if (val) {
      const li = document.createElement('li');
      li.textContent = val;
      li.className = '';
      document.getElementById('brain-list').appendChild(li);
      document.getElementById('brain-input').value = '';
      attachTaskEvents(li);
    }
  };
  document.getElementById('add-core').onclick = function () {
    const val = document.getElementById('core-input').value.trim();
    if (val) {
      const li = document.createElement('li');
      li.textContent = val;
      li.className = 'core3';
      document.getElementById('core-list').appendChild(li);
      document.getElementById('core-input').value = '';
      attachTaskEvents(li);
    }
  };

  // 이벤트 함수로 기본동작 방지 및 타임라인 추가
  function attachTaskEvents(li) {
    li.addEventListener('mousedown', function (event) {
      event.preventDefault();
    });
    li.addEventListener('click', function (event) {
      event.preventDefault();
      addTaskToTimeline(li.textContent, li.className);
    });
    // 드래그 앤 드롭 로직도 필요시 구현
  }

  // 타임라인에 할 일 추가
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
    // 시간대 생성 (예: 30분 단위로)
    if (isNaN(start) || isNaN(end) || start === end) {
      ul.innerHTML = '<li>시간대를 올바르게 선택해 주세요!</li>';
      return;
    }
    let cur = start;
    while (true) {
      const slot = document.createElement('li');
      slot.className = 'timeline-slot';
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