const createTaskBtn = document.querySelector(".btn-add");
const formBox = document.querySelector(".form")
const form = document.querySelector("#task-form");
const closeBtn = document.querySelector("#cut");

//clearAll
const clearAllBtn = document.querySelector("#clear-all-btn");

//Search Bar
const taskSearch = document.querySelector("#task-search");

//theme
const themeBtn = document.querySelector("#theme-toggle-btn");
const savedTheme = localStorage.getItem("app-theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);

//form
const taskContainer = document.querySelector("#task-container");
const taskTitleInput = document.querySelector('#task-title');
const taskCategorySelect = document.querySelector('#task-category');

//storag
const taskList = JSON.parse(localStorage.getItem("tasks")) || [];

// edit
let editingCardElement = null;

const formHeading = document.querySelector("#heading");
const submitBtn = document.querySelector(".subBtn");

//logics

themeBtn.addEventListener("click", () => {
    // Read what theme is currently active on the <html> element right now
    const currentTheme = document.documentElement.getAttribute("data-theme");
    
    // Determine the opposite theme state
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    
    // Update the HTML data attribute instantly (this forces your CSS variables to swap!)
    document.documentElement.setAttribute("data-theme", newTheme);
    
    // Save the new preference to Local Storage so the browser remembers it on refresh
    localStorage.setItem("app-theme", newTheme);
});

const ui = (taskName, action, status = "pending") => {
    taskContainer.innerHTML += `
    <div class="task-folder-card" data-status="${status}">
        <h1 class="task-title-text">${taskName}</h1>
        <p class="action-select">${action}</p>
        <div class="folder-actions">
            <button class="edit-btn">Edit</button>
            <button class="complete-btn">Completed</button>
            <button class="delete-btn">Delete</button>
        </div>
    </div>`;
};

const updateSidebar = () => {
    const totalTasks = taskList.length;
    const completedTasks = taskList.filter(task => task.status === "completed").length;
    const pendingTasks = totalTasks - completedTasks;

    document.querySelector("#total-count").textContent = totalTasks;
    document.querySelector("#pending-count").textContent = pendingTasks;
    document.querySelector("#completed-count").textContent = completedTasks;
};

taskList.forEach(task => {
    ui(task.taskName, task.action, task.status || "pending");
});
updateSidebar();

createTaskBtn.addEventListener("click", () => {
    form.reset();
    editingCardElement = null;

    formHeading.textContent = "Add Task";
    submitBtn.textContent = "Add";

    formBox.style.display = 'flex';
});


closeBtn.addEventListener("click", () => {
    formBox.style.display = 'none';
    
    form.reset();
    
    editingCardElement = null;
});


form.addEventListener("submit", (event) => {
    event.preventDefault();

    let taskName = taskTitleInput.value;
    let action = taskCategorySelect.value;

    if(taskName.trim() === ''){
        alert("Don't fill with spaces");
        return;
    };

    if (editingCardElement === null) {
        // MODE A: CREATE
        let obj = { 
            taskName, 
            action, 
            status: "pending"
        };
        taskList.push(obj);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        ui(taskName, action, "pending");

        updateSidebar();
    } else {
        // MODE B: UPDATE 
        updateTask(taskName, action);
    }
    
    form.reset();
    formBox.style.display = 'none';
});

let editTask = (elem) => {
    const card = elem.closest(".task-folder-card");
    
    const currentName = card.querySelector(".task-title-text").textContent;
    const currentAction = card.querySelector(".action-select").textContent;

    taskTitleInput.value = currentName;
    taskCategorySelect.value = currentAction;

    editingCardElement = card;

    formHeading.textContent = "Edit Task Properties";
    submitBtn.textContent = "Save Changes";

    formBox.style.display = 'flex';
};

let updateTask = (newName, newAction) => {
    editingCardElement.querySelector(".task-title-text").textContent = newName;
    editingCardElement.querySelector(".action-select").textContent = newAction;

    const allCards = Array.from(taskContainer.querySelectorAll(".task-folder-card"));
    const targetIndex = allCards.indexOf(editingCardElement);

    if (targetIndex !== -1) {
        taskList[targetIndex].taskName = newName;
        taskList[targetIndex].action = newAction;
        localStorage.setItem("tasks", JSON.stringify(taskList));
    }
};

let deleteTask = (elem) => {
    const card = elem.closest(".task-folder-card");

    const allCards = Array.from(taskContainer.querySelectorAll(".task-folder-card"));
    const targetIndex = allCards.indexOf(card);

    if (targetIndex !== -1) {
        taskList.splice(targetIndex, 1);
        
        localStorage.setItem("tasks", JSON.stringify(taskList));
    }

    card.remove();

    updateSidebar();
};

let completeTask = (elem) => {
    const card = elem.closest(".task-folder-card");
    
    const currentStatus = card.dataset.status;
    const newStatus = currentStatus === "completed" ? "pending" : "completed";

    card.dataset.status = newStatus;

    const allCards = Array.from(taskContainer.querySelectorAll(".task-folder-card"));
    const targetIndex = allCards.indexOf(card);

    if (targetIndex !== -1) {
        taskList[targetIndex].status = newStatus;
        localStorage.setItem("tasks", JSON.stringify(taskList));
    }

    updateSidebar();
};

taskContainer.addEventListener("click", (event) => {
    const card = event.target.closest(".task-folder-card");
    if (!card) return;

    const isCompleted = card.dataset.status === "completed";

    // 1. Edit Route
    if (event.target.classList.contains("edit-btn")) {
        if (isCompleted) {
            alert("This task is completed and locked! You cannot edit it.");
            return; 
        }
        editTask(event.target);
    }
    
    // 2. Delete Route
    if (event.target.classList.contains("delete-btn")) {
        if (isCompleted) {
            alert("This task is completed and locked! You cannot delete it.");
            return;
        }
        if (confirm("Are you sure you want to delete this folder?")) {
            deleteTask(event.target);
        }
    }

    if (event.target.classList.contains("complete-btn")) {
        completeTask(event.target);
    }
});

taskSearch.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase().trim();

    const allCards = taskContainer.querySelectorAll(".task-folder-card");

    allCards.forEach((card) => {
        const taskTitle = card.querySelector(".task-title-text").textContent.toLowerCase();

        if (taskTitle.includes(query)) {
            card.style.display = ""; // Resets back to its normal layout style (flex or block)
        } else {
            card.style.display = "none"; // Vanishes the card from the screen entirely
        }
    });
});


const sidebarTabs = document.querySelectorAll(".sidebar-section ul li");

sidebarTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        
        sidebarTabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const targetFilter = tab.dataset.filter;

        const allCards = taskContainer.querySelectorAll(".task-folder-card");

        allCards.forEach((card) => {
            const cardStatus = card.dataset.status; 

            if (targetFilter === "all" || cardStatus === targetFilter) {
                card.style.display = ""; 
            } else {
                card.style.display = "none"; 
            }
        });
    });
});

clearAllBtn.addEventListener("click", () => {
    const doubleCheck = confirm("🚨 WARNING: This will permanently delete ALL tasks from your dashboard and storage. Are you absolutely sure?");

    if (doubleCheck) {
        taskList.length = 0;

        localStorage.removeItem("tasks");

        taskContainer.innerHTML = "";

        updateSidebar();
    }
});

// --- DIAGNOSTIC MODAL INTERACTIVE CONTROLLER ---
const toggleSystemBtn = document.querySelector("#toggle-system-btn"); // Your existing button
const systemModal = document.querySelector("#system-modal");
const closeSystemModal = document.querySelector("#close-system-modal");

// Click existing button to open the popup
toggleSystemBtn.addEventListener("click", () => {
    systemModal.style.display = "flex";
});

// Close when hitting the 'X' icon
closeSystemModal.addEventListener("click", () => {
    systemModal.style.display = "none";
});

// Close when clicking outside on the background overlay grid
window.addEventListener("click", (e) => {
    if (e.target === systemModal) {
        systemModal.style.display = "none";
    }
});

// --- SANDBOX PROPAGATION LOGGER ATTACHMENTS ---
const gp = document.querySelector("#grandparent");
const pr = document.querySelector("#parent");
const ch = document.querySelector("#child-btn");

// Capturing Layer Traces (True)
gp.addEventListener("click", () => console.log("%c[CAPTURE] Grandparent Node", "color: #ffaa00; font-weight: bold;"), true);
pr.addEventListener("click", () => console.log("%c[CAPTURE] Parent Node", "color: #0067b8; font-weight: bold;"), true);
ch.addEventListener("click", () => console.log("%c[CAPTURE] Child Target", "color: #fff; background:#222;"), true);

// Bubbling Layer Traces (False)
gp.addEventListener("click", () => console.log("%c[BUBBLE] Grandparent Node", "color: #ffaa00;"), false);
pr.addEventListener("click", () => console.log("%c[BUBBLE] Parent Node", "color: #0067b8;"), false);
ch.addEventListener("click", () => console.log("%c[BUBBLE] Child Target Finished", "color: #00cc66; font-weight: bold;"), false);