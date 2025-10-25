// 날짜 표시
document.getElementById('today-date').textContent = new Date().toISOString().slice(0, 10);

// 오전/오후 시간대 셋업
const wakeHourSelect = document.getElementById('wake-hour');
const sleepHourSelect = document.getElementById('sleep-hour');
const wakeAmpmSelect = document.getElementById('wake-ampm');
const sleepAmpmSelect = document.getElementById('sleep-ampm');

// 오전/오후 1~12시 셋업
function setupHourSelect(select) {
  select.innerHTML = '';
  for (let i = 1; i <= 12; i++) {
    select.innerHTML += `<option value="${i}">${i}시</option>`;
  }
}
setupHourSelect(wakeHourSelect);
setupHourSelect(sleepHourSelect);
wakeHourSelect.value = "7";
wakeAmpmSelect.value = "오전";
sleepHourSelect.value = "10";
sleepAmpmSelect.value = "오후";

let brainDump = []; // {text, id}
let core3 = [];     // {text, id}
let timeline = [];  // {id, text, from, hour, ampm, completed}
let timelineHours = []; // [{hour, ampm}]

function saveData() {
  localStorage.setItem('tmapp_data', JSON.stringify({brainDump, core3, timeline, timelineHours}));
}
function loadData() {
  const data = JSON.parse(localStorage.getItem('tmapp_data') || "{}");
  brainDump = data.brainDump || [];
  core3 = data.core3 || [];
  timeline = data.timeline || [];
  timelineHours = data.timelineHours || [];
}
loadData();

// 업무 추가 기능 (Brain Dump)
document.getElementById('add-brain').onclick = () => {
  const input = document.getElementById('brain-input');
  const text = input.value.trim();
  if(text) {
    brainDump.push({text, id: Date.now()});
    input.value = '';
    renderBrainDump();
    saveData();
  }
};
document.getElementById('brain-input').addEventListener('keyup', e => {
  if(e.key === "Enter") document.getElementById('add-brain').click();
});

// 업무 추가 기능 (Core 3)
document.getElementById('add-core').onclick = () => {
  const input = document.getElementById('core-input');
  const text = input.value.trim();
  if(text && core3.length < 3) {
    core3.push({text, id: Date.now()});
    input.value = '';
    renderCore3();
    saveData();
  }
};
document.getElementById('core-input').addEventListener('keyup', e => {
  if(e.key === "Enter") document.getElementById('add-core').click();
});

// 오늘 비우기
document.getElementById('clear-day').onclick = () => {
  if(confirm("오늘 데이터를 모두 삭제할까요?")) {
    brainDump = []; core3 = []; timeline = []; timelineHours = [];
    saveData();
    renderAll();
  }
};

// 시간대 만들기
document.getElementById('set-times').onclick = () => {
  const wake = parseInt(wakeHourSelect.value);
  const wakeAmpm = wakeAmpmSelect.value;
  const sleep = parseInt(sleepHourSelect.value);
  const sleepAmpm = sleepAmpmSelect.value;
  timelineHours = [];
  let times = [];
  let start = (wakeAmpm === "오전" ? wake : wake + 12);
  let end = (sleepAmpm === "오전" ? sleep : sleep + 12);
  if (end < start) end += 24; // 다음날 새벽까지 가능
  for (let h = start; h <= end; h++) {
    let hour = h % 24;
    let ampm = hour === 0 ? "오전" : (hour < 12 ? "오전" : "오후");
    let displayHour = hour === 0 ? 12 : ((hour > 12) ? hour - 12 : hour);
    timelineHours.push({hour: displayHour, ampm: ampm, raw: hour});
  }
  // 기존 timeline에서 없는 시간대 업무 삭제
  timeline = timeline.filter(task => timelineHours.some(th => th.hour === task.hour && th.ampm === task.ampm));
  saveData();
  renderTimeline();
};

// PDF 저장
document.getElementById('save-pdf').onclick = () => {
  html2pdf().set({margin:0.5,filename:"시간관리.pdf"}).from(document.getElementById('app')).save();
};

// 렌더링 함수: Brain Dump
function renderBrainDump() {
  const ul = document.getElementById('brain-list');
  ul.innerHTML = '';
  brainDump.forEach(task => {
    const li = document.createElement('li');
    li.textContent = task.text;
    li.draggable = true;
    li.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', JSON.stringify({...task, from:'brain'}));
    });
    ul.appendChild(li);
  });
}

// 렌더링 함수: Core 3
function renderCore3() {
  const ul = document.getElementById('core-list');
  ul.innerHTML = '';
  core3.forEach(task => {
    const li = document.createElement('li');
    li.textContent = task.text;
    li.classList.add("core3");
    li.draggable = true;
    li.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', JSON.stringify({...task, from:'core3'}));
    });
    ul.appendChild(li);
  });
}

// 렌더링 함수: Timeline
function renderTimeline() {
  const ul = document.getElementById('timeline-list');
  ul.innerHTML = '';
  timelineHours.forEach(th => {
    const li = document.createElement('li');
    li.className = "timeline-slot";
    li.innerHTML = `<span>${th.ampm} ${th.hour}시</span>`;
    li.ondragover = e => {
      e.preventDefault();
      li.classList.add("dragover");
    };
    li.ondragleave = () => li.classList.remove("dragover");
    li.ondrop = e => {
      li.classList.remove("dragover");
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      timeline.push({id:data.id, text:data.text, from:data.from, hour:th.hour, ampm:th.ampm, completed:false});
      if(data.from === "brain") {
        brainDump = brainDump.filter(t => t.id !== data.id);
        renderBrainDump();
      } else if(data.from === "core3") {
        core3 = core3.filter(t => t.id !== data.id);
        renderCore3();
      }
      saveData();
      renderTimeline();
    };
    // 해당 시간대에 배치된 업무 렌더링
    timeline.filter(task => task.hour===th.hour && task.ampm===th.ampm).forEach(task => {
      const taskDiv = document.createElement('div');
      taskDiv.className = "timeline-task" + (task.from === "core3" ? " core3" : "") + (task.completed ? " completed" : "");
      taskDiv.innerHTML = `
        <span>${task.text}</span>
        <button class="complete-btn">${task.completed?"취소":"완료"}</button>
        <button class="delete-btn">삭제</button>
      `;
      // 완료 버튼
      taskDiv.querySelector('.complete-btn').onclick = () => {
        task.completed = !task.completed;
        saveData();
        renderTimeline();
      };
      // 삭제 버튼
      taskDiv.querySelector('.delete-btn').onclick = () => {
        timeline = timeline.filter(t => !(t.id === task.id && t.hour === th.hour && t.ampm === th.ampm));
        // 원래 위치 복귀
        if(task.from === "brain") {
          brainDump.push({text:task.text, id:task.id});
          renderBrainDump();
        } else if(task.from === "core3") {
          core3.push({text:task.text, id:task.id});
          renderCore3();
        }
        saveData();
        renderTimeline();
      };
      // 더블클릭 복귀
      taskDiv.ondblclick = () => {
        timeline = timeline.filter(t => !(t.id === task.id && t.hour === th.hour && t.ampm === th.ampm));
        if(task.from === "brain") {
          brainDump.push({text:task.text, id:task.id});
          renderBrainDump();
        } else if(task.from === "core3") {
          core3.push({text:task.text, id:task.id});
          renderCore3();
        }
        saveData();
        renderTimeline();
      };
      li.appendChild(taskDiv);
    });
    ul.appendChild(li);
  });
}

function renderAll() {
  renderBrainDump();
  renderCore3();
  renderTimeline();
}
renderAll();