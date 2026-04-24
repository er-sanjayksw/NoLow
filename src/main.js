import './style.css';

// --- State ---
let activities = JSON.parse(localStorage.getItem('nolow_activities')) || [];
let habits = JSON.parse(localStorage.getItem('nolow_habits')) || [
  { id: 'h1', text: 'Drink 2L Water' },
  { id: 'h2', text: 'Read 10 Pages' },
  { id: 'h3', text: 'Meditate 10 mins' }
];
let completions = JSON.parse(localStorage.getItem('nolow_completions')) || {};

// Helpers for Dates
const getTodayDateString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const todayStr = getTodayDateString();

if (!completions[todayStr]) {
  completions[todayStr] = [];
}

// --- DOM Elements ---
// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Boost Mood
const activityInput = document.getElementById('activity-input');
const addBtn = document.getElementById('add-btn');
const activitiesList = document.getElementById('activities-list');
const emptyState = document.getElementById('empty-state');
const feelingLowBtn = document.getElementById('feeling-low-btn');

// Habits
const habitInput = document.getElementById('habit-input');
const addHabitBtn = document.getElementById('add-habit-btn');
const habitsList = document.getElementById('habits-list');
const habitEmptyState = document.getElementById('habit-empty-state');
const dateDisplay = document.getElementById('current-date-display');

// Reports
const reportChart = document.getElementById('report-chart');

// Modal
const suggestionModal = document.getElementById('suggestion-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const suggestedActivityText = document.getElementById('suggested-activity-text');
const doitBtn = document.getElementById('do-it-btn');
const anotherBtn = document.getElementById('another-btn');

// --- Initialization ---
function init() {
  // Set date display
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);

  renderActivities();
  renderHabits();
  setupEventListeners();
  renderChart();
}

// --- Event Listeners ---
function setupEventListeners() {
  // Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.target));
  });

  // Boost Mood
  addBtn.addEventListener('click', handleAddActivity);
  activityInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAddActivity(); });
  feelingLowBtn.addEventListener('click', handleFeelingLow);

  // Habits
  addHabitBtn.addEventListener('click', handleAddHabit);
  habitInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleAddHabit(); });

  // Modal
  closeModalBtn.addEventListener('click', closeModal);
  doitBtn.addEventListener('click', handleDoIt);
  anotherBtn.addEventListener('click', handleFeelingLow);
  suggestionModal.addEventListener('click', (e) => { if (e.target === suggestionModal) closeModal(); });
}

function switchTab(targetId) {
  tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.target === targetId);
  });
  tabContents.forEach(content => {
    content.classList.toggle('active', content.id === targetId);
  });

  if (targetId === 'tab-reports') {
    renderChart();
  }
}

// --- BOOST MOOD LOGIC ---
function handleAddActivity() {
  const text = activityInput.value.trim();
  if (!text) return;
  activities.push({ id: Date.now().toString(), text });
  saveState();
  renderActivities();
  activityInput.value = '';
  activityInput.focus();
}

function handleDeleteActivity(id) {
  activities = activities.filter(a => a.id !== id);
  saveState();
  renderActivities();
}

function handleFeelingLow() {
  if (activities.length === 0) {
    alert("Please add some activities first!");
    switchTab('tab-boost');
    activityInput.focus();
    return;
  }
  const randomActivity = activities[Math.floor(Math.random() * activities.length)];
  suggestedActivityText.textContent = randomActivity.text;
  suggestionModal.classList.remove('hidden');
}

function handleDoIt() {
  closeModal();
  if (window.confetti) {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#8b5cf6', '#ec4899', '#3b82f6', '#ffffff'] });
  }
}

function closeModal() { suggestionModal.classList.add('hidden'); }

// --- HABITS LOGIC ---
function handleAddHabit() {
  const text = habitInput.value.trim();
  if (!text) return;
  habits.push({ id: 'h_' + Date.now(), text });
  saveState();
  renderHabits();
  renderChart(); // Update chart capacity
  habitInput.value = '';
  habitInput.focus();
}

function handleDeleteHabit(id) {
  habits = habits.filter(h => h.id !== id);
  saveState();
  renderHabits();
  renderChart();
}

function toggleHabitCompletion(id) {
  const index = completions[todayStr].indexOf(id);
  if (index > -1) {
    completions[todayStr].splice(index, 1);
  } else {
    completions[todayStr].push(id);
  }
  saveState();
  renderHabits();
}

// --- RENDERING ---
function renderActivities() {
  activitiesList.innerHTML = '';
  emptyState.style.display = activities.length === 0 ? 'block' : 'none';
  
  [...activities].reverse().forEach(activity => {
    const li = document.createElement('li');
    li.className = 'activity-item';
    li.innerHTML = `
      <span class="activity-text">${escapeHTML(activity.text)}</span>
      <button class="delete-btn" aria-label="Delete activity" data-id="${activity.id}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>`;
    li.querySelector('.delete-btn').addEventListener('click', () => handleDeleteActivity(activity.id));
    activitiesList.appendChild(li);
  });
}

function renderHabits() {
  habitsList.innerHTML = '';
  habitEmptyState.style.display = habits.length === 0 ? 'block' : 'none';
  
  habits.forEach(habit => {
    const isCompleted = completions[todayStr].includes(habit.id);
    const li = document.createElement('li');
    li.className = `activity-item habit-item ${isCompleted ? 'completed' : ''}`;
    
    li.innerHTML = `
      <div class="habit-left" style="cursor:pointer">
        <div class="custom-checkbox ${isCompleted ? 'checked' : ''}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
        <span class="activity-text">${escapeHTML(habit.text)}</span>
      </div>
      <button class="delete-btn" aria-label="Delete habit">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    `;
    
    li.querySelector('.habit-left').addEventListener('click', () => toggleHabitCompletion(habit.id));
    li.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      handleDeleteHabit(habit.id);
    });
    
    habitsList.appendChild(li);
  });
}

function renderChart() {
  reportChart.innerHTML = '';
  const totalHabits = habits.length;
  if (totalHabits === 0) {
    reportChart.innerHTML = '<div style="color:var(--text-secondary); width:100%; text-align:center;">No habits to track yet.</div>';
    return;
  }

  // Get last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      dateStr: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
      label: d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)
    });
  }

  days.forEach((day, index) => {
    const dayCompletions = completions[day.dateStr] ? completions[day.dateStr].length : 0;
    // ensure we don't exceed 100% if habits were deleted
    const validCompletions = Math.min(dayCompletions, totalHabits);
    const percentage = Math.round((validCompletions / totalHabits) * 100);

    const barWrapper = document.createElement('div');
    barWrapper.className = 'chart-bar-wrapper';
    
    const valueLabel = document.createElement('span');
    valueLabel.className = 'chart-value';
    valueLabel.textContent = `${percentage}%`;

    const bar = document.createElement('div');
    bar.className = 'chart-bar';
    // Use setTimeout to trigger CSS transition
    setTimeout(() => {
      bar.style.height = `${Math.max(percentage, 5)}%`; // min 5% for visibility
    }, 50 * index);

    const dayLabel = document.createElement('span');
    dayLabel.className = 'chart-label';
    dayLabel.textContent = index === 6 ? 'Td' : day.label;

    barWrapper.appendChild(valueLabel);
    barWrapper.appendChild(bar);
    barWrapper.appendChild(dayLabel);
    reportChart.appendChild(barWrapper);
  });
}

// --- STORAGE ---
function saveState() {
  localStorage.setItem('nolow_activities', JSON.stringify(activities));
  localStorage.setItem('nolow_habits', JSON.stringify(habits));
  localStorage.setItem('nolow_completions', JSON.stringify(completions));
}

// --- UTILS ---
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Run
init();
