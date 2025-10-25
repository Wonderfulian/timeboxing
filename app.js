// 예시: 기본동작 방지 및 타임라인 배치 로직
window.addEventListener('DOMContentLoaded', function () {
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

  // PDF 저장 기능
  document.getElementById('save-pdf').onclick = function () {
    const element = document.getElementById('timeline-list');
    html2pdf().set({ margin: 0.5, filename: 'timeline.pdf' }).from(element).save();
  };

  // 시간대 만들기 예시 (시간 셀렉터 동작)
  document.getElementById('set-times').onclick = function () {
    // 예: 타임라인에 시간대별로 슬롯 만들기
    const ul = document.getElementById('timeline-list');
    ul.innerHTML = '';
    for (let h = 7; h <= 22; h++) {
      const slot = document.createElement('li');
      slot.className = 'timeline-slot';
      slot.innerHTML = `<strong>${h}:00</strong>`;
      ul.appendChild(slot);
    }
  };

  // 오늘 날짜 표시
  const today = new Date();
  document.getElementById('today-date').textContent =
    today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
});