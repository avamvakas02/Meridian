/**
 * Meridian Task Engine
 * Handles CRUD operations, Sorting, and Dashboard Stats.
 */

let currentSort = 'date-desc'; // Default sort

$(document).ready(function () {
    // 1. Initial Render
    renderTasks();

    // 2. Handle Form Submission
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

    // 3. Sort Dropdown Change Event
    $("#sort-tasks").on("change", function () {
        currentSort = $(this).val();
        renderTasks();
    });
});

/**
 * Core Rendering Function
 */
function renderTasks() {
    let tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    const $container = $("#task-list-body");
    $container.empty();

    // FILTER LOGIC: Always hide completed tasks from the active workspace
    tasks = tasks.filter(t => !t.completed);

    // SORT LOGIC
    tasks.sort((a, b) => {
        if (currentSort === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (currentSort === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (currentSort === 'name-asc') return a.name.localeCompare(b.name);
        return 0;
    });

    // Render Data
    if (tasks.length === 0) {
        $container.append(`<tr><td colspan="4" class="text-center text-muted py-4">No pending tasks. Great job!</td></tr>`);
    } else {
        tasks.forEach(task => {
            const priorityClass = `priority-${task.priority.toLowerCase()}`;
            const checkIcon = "bi-circle"; // Tasks in this view are always pending

            const row = `
                <tr>
                    <td class="ps-4">
                        <div class="fw-bold">${task.name}</div>
                        <small class="text-muted">${task.desc}</small>
                    </td>
                    <td>${task.date}</td>
                    <td><span class="priority-badge ${priorityClass}">${task.priority}</span></td>
                    <td class="text-end pe-4">
                        <button onclick="toggleComplete(${task.id})" class="btn btn-sm btn-outline-success me-1" title="Mark Complete">
                            <i class="bi bi-check-lg"></i>
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

    // Update the numbers at the top of the page
    updateStatistics();
}

/**
 * Statistics Dashboard Updater
 */
function updateStatistics() {
    const tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    $("#stat-total").text(total);
    $("#stat-pending").text(pending);
    $("#stat-completed").text(completed);
}

/**
 * Toggle Completion State (Marks as true and hides from active view)
 */
function toggleComplete(id) {
    let tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = true; // Hardcoded to true since we don't bring them back
            logActivity("Task Completed", task.name);
        }
        return task;
    });
    localStorage.setItem("meridian_tasks", JSON.stringify(tasks));
    renderTasks(); 
}

/**
 * Load Task into Form for Editing
 */
function editTask(id) {
    const tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    const taskToEdit = tasks.find(t => t.id === id);

    if (taskToEdit) {
        $("#task-name").val(taskToEdit.name);
        $("#task-desc").val(taskToEdit.desc);
        $("#task-date").val(taskToEdit.date);
        $("#task-priority").val(taskToEdit.priority);

        deleteTask(id, true); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Delete Task completely
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
 * Save Task to Local Storage
 */
function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    tasks.push(task);
    localStorage.setItem("meridian_tasks", JSON.stringify(tasks));
    logActivity("New Task Added", task.name);
}

/**
 * Log activity for the Home Page
 */
function logActivity(action, taskName) {
    const logs = JSON.parse(localStorage.getItem("meridian_activity")) || [];
    logs.unshift({ action, taskName, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    localStorage.setItem("meridian_activity", JSON.stringify(logs.slice(0, 6))); 
}