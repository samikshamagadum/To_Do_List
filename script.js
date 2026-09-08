const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const taskCount = document.getElementById("taskCount");
const clearCompleted = document.getElementById("clearCompleted");
const filterBtns = document.querySelectorAll(".filter-btn");

const sampleTasks = [
  { id: 1, text: "Complete the portfolio website", completed: true },
  { id: 2, text: "Learn JavaScript ES6 features", completed: true },
  { id: 3, text: "Build a To-Do List app", completed: false },
  { id: 4, text: "Practice CSS Grid and Flexbox", completed: false },
  { id: 5, text: "Read documentation for React", completed: false },
  { id: 6, text: "Push projects to GitHub", completed: false },
  { id: 7, text: "Prepare resume for internship", completed: false },
];

let tasks =
  JSON.parse(localStorage.getItem("tasks")) === null ||
  JSON.parse(localStorage.getItem("tasks")).length === 0
    ? [...sampleTasks]
    : JSON.parse(localStorage.getItem("tasks"));
let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function createConfetti(x, y) {
  const colors = ["#e94560", "#4a6cf7", "#ffc107", "#28a745", "#ff6b6b"];
  for (let i = 0; i < 12; i++) {
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = x + "px";
    confetti.style.top = y + "px";
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.setProperty("--tx", (Math.random() - 0.5) * 100 + "px");
    confetti.style.setProperty("--ty", (Math.random() - 0.5) * 80 - 30 + "px");
    confetti.style.setProperty("--r", Math.random() * 360 + "deg");
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 700);
  }
}

function createRipple(el) {
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  el.style.position = "relative";
  el.style.overflow = "hidden";
  el.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

function showToast(message, type) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

function createTaskElement(task, index) {
  const li = document.createElement("li");
  li.className = `task-item${task.completed ? " completed" : ""}`;
  li.dataset.id = task.id;
  li.style.animationDelay = index * 0.05 + "s";

  li.innerHTML = `
    <div class="task-checkbox"></div>
    <span class="task-text">${escapeHTML(task.text)}</span>
    <div class="task-actions">
      <button class="btn-edit" title="Edit">&#9998;</button>
      <button class="btn-delete" title="Delete">&#10005;</button>
    </div>
  `;

  const checkbox = li.querySelector(".task-checkbox");
  const taskText = li.querySelector(".task-text");
  const btnEdit = li.querySelector(".btn-edit");
  const btnDelete = li.querySelector(".btn-delete");

  checkbox.addEventListener("click", (e) => {
    toggleTask(task.id);
    if (!task.completed) {
      const rect = checkbox.getBoundingClientRect();
      createConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
      showToast("Task completed!", "success");
    }
  });

  btnDelete.addEventListener("click", () => {
    li.style.animation = "slideOut 0.3s ease-in forwards";
    setTimeout(() => {
      deleteTask(task.id);
      showToast("Task deleted", "error");
    }, 300);
  });

  btnEdit.addEventListener("click", () => editTask(task.id, taskText));

  return li;
}

function addTask() {
  const text = taskInput.value.trim();
  if (!text) {
    taskInput.classList.add("shake");
    setTimeout(() => taskInput.classList.remove("shake"), 500);
    return;
  }

  const newTask = {
    id: Date.now(),
    text: text,
    completed: false,
  };

  tasks.unshift(newTask);
  taskInput.value = "";
  saveTasks();
  renderTasks();
  showToast("Task added!", "success");
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function editTask(id, textEl) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  textEl.contentEditable = true;
  textEl.focus();

  const range = document.createRange();
  range.selectNodeContents(textEl);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

  function save() {
    textEl.contentEditable = false;
    const newText = textEl.textContent.trim();
    if (newText && newText !== task.text) {
      task.text = newText;
      saveTasks();
      showToast("Task updated!", "info");
    } else {
      textEl.textContent = task.text;
    }
    textEl.removeEventListener("blur", save);
    textEl.removeEventListener("keydown", handleKey);
  }

  function handleKey(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      textEl.blur();
    }
    if (e.key === "Escape") {
      textEl.textContent = task.text;
      textEl.blur();
    }
  }

  textEl.addEventListener("blur", save);
  textEl.addEventListener("keydown", handleKey);
}

function renderTasks() {
  taskList.innerHTML = "";

  const filtered = tasks.filter((task) => {
    if (currentFilter === "pending") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true;
  });

  filtered.forEach((task, index) => {
    taskList.appendChild(createTaskElement(task, index));
  });

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const pending = total - completed;
  taskCount.textContent = `${pending} pending / ${total} total`;

  emptyState.classList.toggle("show", filtered.length === 0);
}

addBtn.addEventListener("click", () => {
  createRipple(addBtn);
  addTask();
});

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

clearCompleted.addEventListener("click", () => {
  const count = tasks.filter((t) => t.completed).length;
  if (count === 0) return;
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  renderTasks();
  showToast(`Cleared ${count} completed task${count > 1 ? "s" : ""}`, "info");
});

renderTasks();