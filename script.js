// --- DOM Elements ---
const taskDescInput = document.getElementById("task-desc");
const taskDateInput = document.getElementById("task-due-date");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const showAllBtn = document.getElementById("show-all-btn");
const showCompletedBtn = document.getElementById("show-completed-btn");
const showActiveBtn = document.getElementById("show-active-btn");
const sortByDateBtn = document.getElementById("sort-by-date-btn");

// Global Variables
let tasks = [];
let currentFilter = "all";

// --- Utility Functions ---

/**
 * Escapes HTML characters to prevent XSS (Cross-Site Scripting) attacks.
 * PRO TIP for LinkedIn: Shows you care about security!
 */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
  }[tag] || tag));
}

/**
 * Saves the tasks array to localStorage.
 * Matches Spec: saveTasks(tasks)
 */
function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

/**
 * Loads tasks from localStorage or initializes an empty array.
 */
function getTasks() {
  const storedTasks = localStorage.getItem("tasks");
  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
  } else {
    tasks = [];
  }
}

/**
 * Filters tasks based on the given filter string.
 * Matches Spec: filterTasks(tasks, filter)
 */
function filterTasks(tasks, filter) {
  switch (filter) {
    case "completed":
      return tasks.filter((task) => task.completed);
    case "active":
      return tasks.filter((task) => !task.completed);
    case "all":
    default:
      return tasks;
  }
}

/**
 * Sorts tasks by due date and RETURNS the sorted array.
 * Matches Spec: sortTasks(tasks) - Returns sorted array.
 */
function sortTasks(tasks) {
  return tasks.sort((a, b) => {
    const dateA = a.dueDate || "9999-12-31";
    const dateB = b.dueDate || "9999-12-31";
    return new Date(dateA) - new Date(dateB);
  });
}

// --- Core Functionality ---

/**
 * Adds a new task from user input.
 */
function addTask() {
  const text = taskDescInput.value.trim();
  const dueDate = taskDateInput.value;

  if (text === "") {
    alert("Please enter a task description.");
    return;
  }

  const newTask = {
    id: Date.now(),
    text,
    dueDate,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks(tasks);
  renderTasks();

  // Clear inputs
  taskDescInput.value = "";
  taskDateInput.value = "";
}

/**
 * Renders the task list to the DOM based on current filters.
 */
function renderTasks() {
  taskList.innerHTML = "";
  const filteredTasks = filterTasks(tasks, currentFilter);

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    
    if (task.completed) {
      li.classList.add("completed");
    }

    // Using escapeHTML for task.text to ensure security
    li.innerHTML = `
      <span>
        <div class="task-title">${escapeHTML(task.text)}</div>
        <div class="task-date">Due Date: ${task.dueDate || "Not specified"}</div>
      </span>
      <div class="task-buttons">
        <button class="complete" data-id="${task.id}">Complete</button>
        <button class="delete" data-id="${task.id}">Delete</button>
      </div>
    `;

    // Matches Spec: Add event listeners during creation and use event.target.dataset.id
    const completeBtn = li.querySelector(".complete");
    const deleteBtn = li.querySelector(".delete");

    completeBtn.addEventListener("click", (event) => {
      const taskId = parseInt(event.target.dataset.id);
      const taskToToggle = tasks.find((t) => t.id === taskId);
      if (taskToToggle) {
        taskToToggle.completed = !taskToToggle.completed;
        saveTasks(tasks);
        renderTasks();
      }
    });

    deleteBtn.addEventListener("click", (event) => {
      const taskId = parseInt(event.target.dataset.id);
      tasks = tasks.filter((t) => t.id !== taskId);
      saveTasks(tasks);
      renderTasks();
    });

    taskList.appendChild(li);
  });
}

// --- API Integration ---

/**
 * Fetches initial tasks from an external API if localStorage is empty.
 */
async function fetchInitialTasks() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos?_limit=5");
    
    // Matches Spec: Ensure status is 200 before proceeding
    if (response.status !== 200) {
      throw new Error("Failed to fetch data from API. Status: " + response.status);
    }
    
    const apiTasks = await response.json();
    
    // Convert API data structure to match our app structure
    const newTasks = apiTasks.map((item) => ({
      id: item.id,
      text: item.title,
      dueDate: "", 
      completed: item.completed,
    }));

    tasks = tasks.concat(newTasks);
    saveTasks(tasks);
    renderTasks();
  } catch (error) {
    console.error("API Error:", error);
    alert("Could not load initial tasks. Please try again later.");
  }
}

// --- Event Listeners ---

addTaskBtn.addEventListener("click", addTask);

function updateFilterButtons(selectedBtnId) {
  const buttons = [showAllBtn, showCompletedBtn, showActiveBtn];
  buttons.forEach((btn) => btn.classList.remove("active"));
  document.getElementById(selectedBtnId).classList.add("active");
}

showAllBtn.addEventListener("click", () => {
  currentFilter = "all";
  updateFilterButtons("show-all-btn");
  renderTasks();
});

showCompletedBtn.addEventListener("click", () => {
  currentFilter = "completed";
  updateFilterButtons("show-completed-btn");
  renderTasks();
});

showActiveBtn.addEventListener("click", () => {
  currentFilter = "active";
  updateFilterButtons("show-active-btn");
  renderTasks();
});

sortByDateBtn.addEventListener("click", () => {
  // Re-assign tasks to the sorted array returned by sortTasks
  tasks = sortTasks(tasks);
  saveTasks(tasks);
  renderTasks();
});

// --- Initialization ---

document.addEventListener("DOMContentLoaded", () => {
  getTasks();
  if (tasks.length === 0) {
    fetchInitialTasks();
  } else {
    renderTasks();
  }
  updateFilterButtons("show-all-btn");
});
