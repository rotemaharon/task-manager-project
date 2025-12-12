// הפניות לאלמנטים
const taskDescInput = document.getElementById("task-desc");
const taskDateInput = document.getElementById("task-due-date");
const addTaskBtn = document.getElementById("add-task-btn");
const taskList = document.getElementById("task-list");
const showAllBtn = document.getElementById("show-all-btn");
const showCompletedBtn = document.getElementById("show-completed-btn");
const showActiveBtn = document.getElementById("show-active-btn");
const sortByDateBtn = document.getElementById("sort-by-date-btn");

let tasks = [];
let currentFilter = "all";

function saveTasks(tasksToSave) {
  localStorage.setItem("tasks", JSON.stringify(tasksToSave));
}

function getTasks() {
  const storedTasks = localStorage.getItem("tasks");
  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
  } else {
    tasks = [];
  }
}

function filterTasks(tasksToFilter, filterType) {
  if (filterType === "completed") {
    return tasksToFilter.filter((task) => task.completed);
  } else if (filterType === "active") {
    return tasksToFilter.filter((task) => !task.completed);
  }
  return tasksToFilter;
}

function sortTasks(tasksToSort) {
  tasksToSort.sort((a, b) => {
    const dateA = a.dueDate || "9999-12-31";
    const dateB = b.dueDate || "9999-12-31";
    return new Date(dateA) - new Date(dateB);
  });
}

function addTask() {
  const text = taskDescInput.value.trim();
  const dueDate = taskDateInput.value;

  if (text === "") {
    alert("Please enter a task.");
    return;
  }

  const newTask = {
    id: Date.now(),
    text,
    dueDate,
    completed: false,
  };

  tasks.push(newTask);
  saveTasks(tasks); // שליחת tasks כפרמטר
  renderTasks();

  taskDescInput.value = "";
  taskDateInput.value = "";
}

function renderTasks() {
  taskList.innerHTML = "";
  // שליחת currentFilter כפרמטר
  const filteredTasks = filterTasks(tasks, currentFilter);

  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    if (task.completed) {
      li.classList.add("completed");
    }

    li.innerHTML = `
      <span>
        <div class="task-title">${task.text}</div>
        <div class="task-date">Due Date: ${
          task.dueDate || "Not specified"
        }</div>
      </span>
      <div class="task-buttons">
        <button class="complete" data-id="${task.id}">Complete</button>
        <button class="delete" data-id="${task.id}">Delete</button>
      </div>
    `;

    const completeBtn = li.querySelector(".complete");
    const deleteBtn = li.querySelector(".delete");

    completeBtn.addEventListener("click", () => {
      const taskId = parseInt(completeBtn.dataset.id);
      const taskToToggle = tasks.find((t) => t.id === taskId);
      if (taskToToggle) {
        taskToToggle.completed = !taskToToggle.completed;
        saveTasks(tasks); // שליחת tasks כפרמטר
        renderTasks();
      }
    });

    deleteBtn.addEventListener("click", () => {
      const taskId = parseInt(deleteBtn.dataset.id);
      tasks = tasks.filter((t) => t.id !== taskId);
      saveTasks(tasks); // שליחת tasks כפרמטר
      renderTasks();
    });

    taskList.appendChild(li);
  });
}

// חיבור כפתור הוספה לפונקציה החדשה
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

// חיבור כפתור המיון לפונקציה החדשה
sortByDateBtn.addEventListener("click", () => {
  sortTasks(tasks);
  saveTasks(tasks); // שליחת tasks כפרמטר
  renderTasks();
});

async function fetchInitialTasks() {
  try {
    const response = await fetch(
      "https://jsonplaceholder.typicode.com/todos?_limit=5"
    );
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const apiTasks = await response.json();
    const newTasks = apiTasks.map((item) => ({
      id: item.id,
      text: item.title,
      dueDate: "",
      completed: item.completed,
    }));

    tasks = tasks.concat(newTasks);
    saveTasks(tasks); // שליחת tasks כפרמטר
    renderTasks();
  } catch (error) {
    console.error(error);
    alert("Could not load tasks.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getTasks();
  if (tasks.length === 0) {
    fetchInitialTasks();
  } else {
    renderTasks();
  }
  updateFilterButtons("show-all-btn");
});
