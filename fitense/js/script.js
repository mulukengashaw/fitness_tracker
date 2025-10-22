// ...existing code...
const form = document.getElementById('entryForm');
const activityEl = document.getElementById('activity');
const minutesEl = document.getElementById('minutes');
const intensityEl = document.getElementById('intensity');
const dateEl = document.getElementById('date');
const entriesEl = document.getElementById('entries');
const totalMinutesEl = document.getElementById('totalMinutes');
const totalCaloriesEl = document.getElementById('totalCalories');

const STORAGE_KEY = 'fitenseEntries';

dateEl.value = new Date().toISOString().slice(0,10);

let entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

function intensityFactor(intensity){
  // simple calories per minute factor
  return intensity === 'low' ? 4 : intensity === 'moderate' ? 7 : 10;
}

function calcCalories(minutes, intensity){
  return Math.round(minutes * intensityFactor(intensity));
}

function save(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  render();
}

function addEntry(e){
  e.preventDefault();
  const minutes = Number(minutesEl.value) || 0;
  if(minutes <= 0) return;
  const entry = {
    id: Date.now(),
    activity: activityEl.value,
    minutes,
    intensity: intensityEl.value,
    date: dateEl.value || new Date().toISOString().slice(0,10),
    calories: calcCalories(minutes, intensityEl.value)
  };
  entries.unshift(entry);
  save();
  form.reset();
  dateEl.value = new Date().toISOString().slice(0,10);
  minutesEl.value = 30;
}

function deleteEntry(id){
  entries = entries.filter(e => e.id !== id);
  save();
}

function render(){
  entriesEl.innerHTML = '';
  let totalMin = 0, totalCal = 0;
  for(const e of entries){
    totalMin += e.minutes;
    totalCal += e.calories;
    const li = document.createElement('li');
    li.className = 'entry';
    li.innerHTML = `
      <div class="meta">
        <div>
          <strong>${e.activity}</strong>
          <div class="small">${e.date} • ${e.intensity}</div>
        </div>
        <div class="small" style="margin-left:12px">${e.minutes} min • ${e.calories} kcal</div>
      </div>
      <div class="actions">
        <button class="edit" data-id="${e.id}">Edit</button>
        <button class="delete" data-id="${e.id}">Delete</button>
      </div>
    `;
    entriesEl.appendChild(li);
  }
  totalMinutesEl.textContent = totalMin;
  totalCaloriesEl.textContent = totalCal;
}

entriesEl.addEventListener('click', (ev) => {
  const id = Number(ev.target.getAttribute('data-id'));
  if(!id) return;
  if(ev.target.classList.contains('delete')){
    deleteEntry(id);
  } else if(ev.target.classList.contains('edit')){
    // simple edit: load into form and remove original
    const item = entries.find(x => x.id === id);
    if(!item) return;
    activityEl.value = item.activity;
    minutesEl.value = item.minutes;
    intensityEl.value = item.intensity;
    dateEl.value = item.date;
    entries = entries.filter(x => x.id !== id);
    save();
  }
});

form.addEventListener('submit', addEntry);

render();
// ...existing code...