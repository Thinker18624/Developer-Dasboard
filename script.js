// DOM Elements
const currentTimeEl = document.getElementById('current-time');
const themeToggleBtn = document.getElementById('theme-toggle');
const githubUsernameInput = document.getElementById('github-username');
const refreshGithubBtn = document.getElementById('refresh-github');
const repoCountEl = document.getElementById('repo-count');
const starCountEl = document.getElementById('star-count');
const forkCountEl = document.getElementById('fork-count');
const githubChartCtx = document.getElementById('github-chart').getContext('2d');
const weatherLocationInput = document.getElementById('weather-location');
const refreshWeatherBtn = document.getElementById('refresh-weather');
const weatherIconEl = document.getElementById('weather-icon');
const weatherTempEl = document.getElementById('weather-temp');
const weatherDescEl = document.getElementById('weather-desc');
const weatherLocationNameEl = document.getElementById('weather-location-name');
const weatherDetailsEl = document.getElementById('weather-details');
const pomodoroTimerEl = document.getElementById('pomodoro-timer');
const pomodoroStartBtn = document.getElementById('pomodoro-start');
const pomodoroResetBtn = document.getElementById('pomodoro-reset');
const workCountEl = document.getElementById('work-count');
const breakCountEl = document.getElementById('break-count');
const pomodoroProgressEl = document.getElementById('pomodoro-progress');
const timezoneSelect = document.getElementById('timezone-select');
const addTimezoneBtn = document.getElementById('add-timezone');
const timezoneListEl = document.getElementById('timezone-list');
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo');
const todoListEl = document.getElementById('todo-list');
const clearCompletedBtn = document.getElementById('clear-completed');
const quickNotesEl = document.getElementById('quick-notes');
const saveNotesBtn = document.getElementById('save-notes');

// State
let isDarkMode = true;
let pomodoroInterval;
let isPomodoroRunning = false;
let isWorkTime = true;
let workCount = 0;
let breakCount = 0;
let timeLeft = 25 * 60; // 25 minutes in seconds
let githubChart;
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let notes = localStorage.getItem('quick-notes') || '';
let timezones = JSON.parse(localStorage.getItem('timezones')) || [
    { zone: 'America/New_York', label: 'New York' },
    { zone: 'Europe/London', label: 'London' }
];

// Initialize
updateCurrentTime();
setInterval(updateCurrentTime, 1000);
loadGithubData('octocat');
loadWeatherData('London');
renderTodoList();
renderTimezoneList();
quickNotesEl.value = notes;

// Event Listeners
themeToggleBtn.addEventListener('click', toggleTheme);
refreshGithubBtn.addEventListener('click', () => loadGithubData(githubUsernameInput.value || 'octocat'));
refreshWeatherBtn.addEventListener('click', () => loadWeatherData(weatherLocationInput.value || 'London'));
pomodoroStartBtn.addEventListener('click', togglePomodoro);
pomodoroResetBtn.addEventListener('click', resetPomodoro);
addTimezoneBtn.addEventListener('click', addTimezone);
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
});
clearCompletedBtn.addEventListener('click', clearCompletedTodos);
saveNotesBtn.addEventListener('click', saveNotes);

// Functions
function updateCurrentTime() {
    const now = new Date();
    currentTimeEl.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    // Update all timezone clocks
    updateTimezoneClocks();
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    if (isDarkMode) {
        document.body.classList.add('gradient-bg');
        document.body.classList.remove('bg-gray-100', 'text-gray-800');
        themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.remove('gradient-bg');
        document.body.classList.add('bg-gray-100', 'text-gray-800');
        themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

async function loadGithubData(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        const userData = await response.json();
        
        repoCountEl.textContent = userData.public_repos || '0';
        starCountEl.textContent = '...'; // Stars require additional API call
        forkCountEl.textContent = '...'; // Forks require additional API call
        
        // Update chart
        updateGithubChart(userData);
        
        // Get star and fork counts (simplified for demo)
        starCountEl.textContent = Math.floor(userData.public_repos * 1.5) || '0';
        forkCountEl.textContent = Math.floor(userData.public_repos * 0.8) || '0';
        
    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        repoCountEl.textContent = 'Error';
        starCountEl.textContent = 'Error';
        forkCountEl.textContent = 'Error';
    }
}

function updateGithubChart(userData) {
    if (githubChart) {
        githubChart.destroy();
    }
    
    // Mock data for the chart
    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Commits',
            data: [12, 19, 8, 15, 22, 17],
            backgroundColor: 'rgba(56, 182, 255, 0.2)',
            borderColor: 'rgba(56, 182, 255, 1)',
            borderWidth: 1,
            tension: 0.4,
            fill: true
        }]
    };
    
    githubChart = new Chart(githubChartCtx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

async function loadWeatherData(location) {
    try {
        // Mock weather data (in a real app, use a weather API)
        const mockWeather = {
            location: location,
            temp: Math.floor(Math.random() * 15) + 15, // 15-30°C
            desc: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
            wind: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
            icon: ['sun', 'cloud', 'cloud-rain', 'cloud-sun'][Math.floor(Math.random() * 4)]
        };
        
        weatherTempEl.textContent = `${mockWeather.temp}°`;
        weatherDescEl.textContent = mockWeather.desc;
        weatherLocationNameEl.textContent = mockWeather.location;
        weatherDetailsEl.innerHTML = `Humidity: ${mockWeather.humidity}%<br>Wind: ${mockWeather.wind} km/h`;
        
        // Set icon
        const iconMap = {
            'sun': 'fa-sun',
            'cloud': 'fa-cloud',
            'cloud-rain': 'fa-cloud-rain',
            'cloud-sun': 'fa-cloud-sun'
        };
        weatherIconEl.innerHTML = `<i class="fas ${iconMap[mockWeather.icon]}"></i>`;
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherTempEl.textContent = '--°';
        weatherDescEl.textContent = 'Error loading data';
    }
}

function togglePomodoro() {
    if (isPomodoroRunning) {
        clearInterval(pomodoroInterval);
        isPomodoroRunning = false;
        pomodoroStartBtn.textContent = 'Start';
        pomodoroTimerEl.classList.remove('pomodoro-active');
    } else {
        isPomodoroRunning = true;
        pomodoroStartBtn.textContent = 'Pause';
        pomodoroTimerEl.classList.add('pomodoro-active');
        
        pomodoroInterval = setInterval(() => {
            timeLeft--;
            updatePomodoroDisplay();
            
            if (timeLeft <= 0) {
                clearInterval(pomodoroInterval);
                isPomodoroRunning = false;
                
                // Play sound (in a real app)
                const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
                audio.play();
                
                if (isWorkTime) {
                    workCount++;
                    workCountEl.textContent = workCount;
                    isWorkTime = false;
                    timeLeft = 5 * 60; // 5 minute break
                } else {
                    breakCount++;
                    breakCountEl.textContent = breakCount;
                    isWorkTime = true;
                    timeLeft = 25 * 60; // 25 minute work
                }
                
                pomodoroStartBtn.textContent = 'Start';
                updatePomodoroDisplay();
                pomodoroTimerEl.classList.remove('pomodoro-active');
            }
        }, 1000);
    }
}

function resetPomodoro() {
    clearInterval(pomodoroInterval);
    isPomodoroRunning = false;
    isWorkTime = true;
    timeLeft = 25 * 60;
    pomodoroStartBtn.textContent = 'Start';
    updatePomodoroDisplay();
    pomodoroTimerEl.classList.remove('pomodoro-active');
}

function updatePomodoroDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    pomodoroTimerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update progress bar
    const totalTime = isWorkTime ? 25 * 60 : 5 * 60;
    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    pomodoroProgressEl.style.width = `${progress}%`;
}

function addTimezone() {
    const selectedZone = timezoneSelect.value;
    const zoneLabel = timezoneSelect.options[timezoneSelect.selectedIndex].text;
    
    // Check if already exists
    if (!timezones.some(tz => tz.zone === selectedZone)) {
        timezones.push({ zone: selectedZone, label: zoneLabel });
        localStorage.setItem('timezones', JSON.stringify(timezones));
        renderTimezoneList();
    }
}

function renderTimezoneList() {
    timezoneListEl.innerHTML = '';
    
    timezones.forEach(tz => {
        const timezoneEl = document.createElement('div');
        timezoneEl.className = 'flex justify-between items-center bg-white/5 p-3 rounded-lg';
        timezoneEl.innerHTML = `
            <div>
                <div class="font-medium">${tz.label}</div>
                <div class="text-xs text-blue-200">${tz.zone.split('/')[1].replace('_', ' ')}</div>
            </div>
            <div class="timezone-clock font-mono text-lg" data-zone="${tz.zone}">00:00:00</div>
            <button class="delete-timezone p-1 hover:text-red-400" data-zone="${tz.zone}">
                <i class="fas fa-times"></i>
            </button>
        `;
        timezoneListEl.appendChild(timezoneEl);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-timezone').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const zoneToRemove = e.target.closest('button').dataset.zone;
            timezones = timezones.filter(tz => tz.zone !== zoneToRemove);
            localStorage.setItem('timezones', JSON.stringify(timezones));
            renderTimezoneList();
        });
    });
    
    // Update all clocks immediately
    updateTimezoneClocks();
}

function updateTimezoneClocks() {
    document.querySelectorAll('.timezone-clock').forEach(clockEl => {
        const zone = clockEl.dataset.zone;
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', {
            timeZone: zone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        clockEl.textContent = timeStr;
    });
}

function addTodo() {
    const text = todoInput.value.trim();
    if (text) {
        todos.push({ text, completed: false });
        localStorage.setItem('todos', JSON.stringify(todos));
        todoInput.value = '';
        renderTodoList();
    }
}

function renderTodoList() {
    todoListEl.innerHTML = '';
    
    todos.forEach((todo, index) => {
        const todoEl = document.createElement('div');
        todoEl.className = `flex items-center p-3 rounded-lg hover:bg-white/5 ${todo.completed ? 'task-completed' : ''}`;
        todoEl.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                   class="mr-3 h-5 w-5 rounded border-white/30 bg-white/10 focus:ring-blue-300">
            <span class="flex-grow">${todo.text}</span>
            <button class="delete-todo p-1 hover:text-red-400">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        
        const checkbox = todoEl.querySelector('input');
        checkbox.addEventListener('change', () => {
            todos[index].completed = checkbox.checked;
            localStorage.setItem('todos', JSON.stringify(todos));
            renderTodoList();
        });
        
        const deleteBtn = todoEl.querySelector('button');
        deleteBtn.addEventListener('click', () => {
            todos.splice(index, 1);
            localStorage.setItem('todos', JSON.stringify(todos));
            renderTodoList();
        });
        
        todoListEl.appendChild(todoEl);
    });
}

function clearCompletedTodos() {
    todos = todos.filter(todo => !todo.completed);
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodoList();
}

function saveNotes() {
    notes = quickNotesEl.value;
    localStorage.setItem('quick-notes', notes);
    
    // Show confirmation
    const originalText = saveNotesBtn.textContent;
    saveNotesBtn.textContent = 'Saved!';
    setTimeout(() => {
        saveNotesBtn.textContent = originalText;
    }, 2000);
}