/**
 * Meridian Task Engine
 * Handles CRUD operations, Filtering, Sorting, and State Management.
 */

// Global State Variables
let currentFilter = 'pending'; // FIX: Default view hides completed tasks immediately
let currentSort = 'date-desc'; // Default sort is newest first

$(document).ready(function () {
    // 1. Initialize default UI states
    $(".filter-btn").removeClass("active");
    $(`.filter-btn[data-filter="pending"]`).addClass("active");
    
    // Initial Render
    renderTasks();

    // 2. Handle Form Submission (Create Task)
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
        
        // Force view back to pending to see the new task
        currentFilter = 'pending';
        $(".filter-btn").removeClass("active");
        $(`.filter-btn[data-filter="pending"]`).addClass("active");
        
        renderTasks();
    });

    // 3. Filter Buttons Click Event
    $(".filter-btn").on("click", function () {
        $(".filter-btn").removeClass("active");
        $(this).addClass("active");
        currentFilter = $(this).data("filter");
        renderTasks();
    });

    // 4. Sort Dropdown Change Event
    $("#sort-tasks").on("change", function () {
        currentSort = $(this).val();
        renderTasks();
    });
});

/**
 * Core Rendering Function (Includes Filter & Sort logic)
 */
function renderTasks() {
    let tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    const $container = $("#task-list-body");
    $container.empty();

    // APPLY FILTER LOGIC
    if (currentFilter === 'pending') {
        tasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        tasks = tasks.filter(t => t.completed);
    }

    // APPLY SORT LOGIC
    tasks.sort((a, b) => {
        if (currentSort === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (currentSort === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (currentSort === 'name-asc') return a.name.localeCompare(b.name);
        return 0;
    });

    // Empty State Check
    if (tasks.length === 0) {
        $container.append(`<tr><td colspan="4" class="text-center text-muted py-4">No tasks found in this view.</td></tr>`);
        return;
    }

    // Generate Rows
    tasks.forEach(task => {
        const priorityClass = `priority-${task.priority.toLowerCase()}`;
        const completedClass = task.completed ? "task-completed" : "";
        const checkIcon = task.completed ? "bi-check-circle-fill text-success" : "bi-circle";

        const row = `
            <tr class="${completedClass}">
                <td class="ps-4">
                    <div class="fw-bold">${task.name}</div>
                    <small class="text-muted">${task.desc}</small>
                </td>
                <td>${task.date}</td>
                <td><span class="priority-badge ${priorityClass}">${task.priority}</span></td>
                <td class="text-end pe-4">
                    <button onclick="toggleComplete(${task.id})" class="btn btn-sm btn-outline-secondary me-1" title="Toggle Complete">
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

/**
 * Mark as Completed (Updates state and removes from pending view)
 */
function toggleComplete(id) {
    let tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = !task.completed;
            logActivity(task.completed ? "Task Completed" : "Task Reopened", task.name);
        }
        return task;
    });
    localStorage.setItem("meridian_tasks", JSON.stringify(tasks));
    renderTasks(); 
}

/**
 * Edit Task (Loads into form and quietly deletes the old version)
 */
function editTask(id) {
    const tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    const taskToEdit = tasks.find(t => t.id === id);

    if (taskToEdit) {
        $("#task-name").val(taskToEdit.name);
        $("#task-desc").val(taskToEdit.desc);
        $("#task-date").val(taskToEdit.date);
        $("#task-priority").val(taskToEdit.priority);

        // Delete without logging so the user can just "Save" it again
        deleteTask(id, true); 
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Delete Task (Removes from storage completely)
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
 * Helper: Save a new task
 */
function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    tasks.push(task);
    localStorage.setItem("meridian_tasks", JSON.stringify(tasks));
    logActivity("New Task Added", task.name);
}

/**
 * Helper: Log activity for the Home Page timeline
 */
function logActivity(action, taskName) {
    const logs = JSON.parse(localStorage.getItem("meridian_activity")) || [];
    logs.unshift({ action, taskName, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    
    // Keep only the 6 most recent activities to prevent overflow
    localStorage.setItem("meridian_activity", JSON.stringify(logs.slice(0, 6))); 
}