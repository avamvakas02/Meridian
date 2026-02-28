/**
 * Meridian Task Engine
 * Handles CRUD operations and UI synchronization.
 */

$(document).ready(function () {
    renderTasks();

    // Handle Form Submission (Create)
    $("#task-form").on("submit", function (e) {
        e.preventDefault();
        const newTask = {
            id: Date.now(),
            name: $("#task-name").val(),
            desc: $("#task-desc").val(),
            date: $("#task-date").val(),
            priority: $("#task-priority").val(),
            completed: false
        };
        saveTask(newTask);
        this.reset();
        renderTasks();
    });
});

/**
 * 1. MARK AS COMPLETED (Requirement 1)
 * Toggles the completion state and updates the UI
 */
function toggleComplete(id) {
    let tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = !task.completed;
            // FIXED: Log activity for the home page when a task is finished
            logActivity(task.completed ? "Task Completed" : "Task Reopened", task.name);
        }
        return task;
    });
    localStorage.setItem("meridian_tasks", JSON.stringify(tasks));
    renderTasks();
}

/**
 * 2. EDIT TASK (Requirement 2)
 * Pulls data back into the form for modification
 */
function editTask(id) {
    const tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    const taskToEdit = tasks.find(t => t.id === id);

    if (taskToEdit) {
        // Fill the form with existing data
        $("#task-name").val(taskToEdit.name);
        $("#task-desc").val(taskToEdit.desc);
        $("#task-date").val(taskToEdit.date);
        $("#task-priority").val(taskToEdit.priority);

        // Delete the old version so the "Create" button acts as "Save"
        deleteTask(id, true); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * 3. DELETE TASK (Requirement 3)
 * Removes the task from storage and makes it disappear from UI
 */
function deleteTask(id, isQuiet = false) {
    let tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    const taskToDelete = tasks.find(t => t.id === id);
    
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem("meridian_tasks", JSON.stringify(tasks));
    
    if (!isQuiet && taskToDelete) {
        logActivity("Task Deleted", taskToDelete.name);
    }
    
    renderTasks();
}

/**
 * Core Rendering Function
 * Generates the HTML table rows dynamically
 */
function renderTasks() {
    const tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    const $container = $("#task-list-body");
    $container.empty();

    tasks.forEach(task => {
        const priorityClass = `priority-${task.priority.toLowerCase()}`;
        const completedClass = task.completed ? "task-completed" : "";
        const checkIcon = task.completed ? "bi-check-circle-fill" : "bi-circle";

        const row = `
            <tr class="${completedClass}">
                <td class="ps-4">
                    <div class="fw-bold">${task.name}</div>
                    <small class="text-muted">${task.desc}</small>
                </td>
                <td>${task.date}</td>
                <td><span class="priority-badge ${priorityClass}">${task.priority}</span></td>
                <td class="text-end pe-4">
                    <button onclick="toggleComplete(${task.id})" class="btn btn-sm btn-outline-success me-1" title="Complete">
                        <i class="bi ${checkIcon}"></i>
                    </button>
                    <button onclick="editTask(${task.id})" class="btn btn-sm btn-outline-primary me-1" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="deleteTask(${task.id})" class="btn btn-sm btn-outline-danger" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
        $container.append(row);
    });
}

// Helper: Save task to local storage
function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    tasks.push(task);
    localStorage.setItem("meridian_tasks", JSON.stringify(tasks));
    logActivity("New Task Added", task.name);
}

// Helper: Log activity for index.html
function logActivity(action, taskName) {
    const logs = JSON.parse(localStorage.getItem("meridian_activity")) || [];
    logs.unshift({ action, taskName, time: new Date().toLocaleTimeString() });
    localStorage.setItem("meridian_activity", JSON.stringify(logs.slice(0, 5))); // Keep last 5
}