/**
 * Meridian Task Engine
 * Handles CRUD operations, Sorting, and Dashboard Stats.
 */

// Keeps track of which sort option (date or name) is 
// currently selected for the tasks table
let currentSort = 'date-desc'; // Default sort

// When the Tasks page is loaded, 1.set up the first render
// 2. handle the form submit handler and the sort dropdown
// 3. sort dropdown change event
$(document).ready(function () {
    //Initial Render
    renderTasks();

    // 2. Handle Form Submission
    $("#task-form").on("submit", function (e) {
        e.preventDefault();
        // Create a simple task object that it will be stored in localStorage
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

    // 3. when the sort dropdown changes, remember the choice and re-render the list
    $("#sort-tasks").on("change", function () {
        currentSort = $(this).val();
        renderTasks();
    });
});

// Core function that reads tasks from localStorage, 
// applies filtering + sorting and then rebuilds the table body
function renderTasks() {
    // Load all saved tasks; if there is nothing yet, use an empty array
    let tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    const $container = $("#task-list-body");
    $container.empty();

    // Show only tasks that are still pending; completed ones are hidden from this main view
    tasks = tasks.filter(t => !t.completed);

    // Apply the selected sort rule: by date (oldest/newest) or by name (A–Z)
    tasks.sort((a, b) => {
        if (currentSort === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (currentSort === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (currentSort === 'name-asc') return a.name.localeCompare(b.name);
        return 0;
    });

    // If there are no pending tasks, show a friendly empty-state message instead of rows
    if (tasks.length === 0) {
        $container.append(`<tr><td colspan="4" class="text-center text-muted py-4">No pending tasks. Great job!</td></tr>`);
    } else {
        tasks.forEach(task => {
            // Decide which CSS class to use based on the priority (Low / Medium / High)
            const priorityClass = `priority-${task.priority.toLowerCase()}`;
            const checkIcon = "bi-circle"; // Tasks in this view are always pending

            // Build one table row with the task info and the action buttons
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

    // Build one table row with the task info and the action buttons
    updateStatistics();
}


// Calculates total, completed and pending tasks 
// and updates the three statistic cards in tasks.html
function updateStatistics() {
    const tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    $("#stat-total").text(total);
    $("#stat-pending").text(pending);
    $("#stat-completed").text(completed);
}


// Mark a task as completed, log the action, 

function toggleComplete(id) {
    let tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    // Find the task with this id and switch its completed flag to true
    tasks = tasks.map(task => {
        if (task.id === id) {
            task.completed = true; // Hardcoded to true since we don't bring them back
            logActivity("Task Completed", task.name);
            // show a small alert to the user and then refresh the list
            alert(`Your task has been completed!`);
        }
        return task;
    });
    localStorage.setItem("meridian_tasks", JSON.stringify(tasks));
    renderTasks(); 
}

// Load an existing task back into the form so 
// the user can change it (simple edit by delete + re-add pattern)
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


        // Remove the old version of the task quietly; 
        // when the user submits again it will be saved as updated
function deleteTask(id, isQuiet = false) {
    let tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    const taskToDelete = tasks.find(t => t.id === id);
    
    tasks = tasks.filter(task => task.id !== id);
    localStorage.setItem("meridian_tasks", JSON.stringify(tasks));
    
    if (!isQuiet && taskToDelete) {
        logActivity("Task Deleted", taskToDelete.name);
        // show a small alert to the user and then refresh the list
        alert(`Your task has been deleted!`);
    }
    
    renderTasks();
}


// Push a new task into the localStorage array and record 
// a "New Task Added" entry in the home activity feed
function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    tasks.push(task);
    localStorage.setItem("meridian_tasks", JSON.stringify(tasks));
    logActivity("New Task Added", task.name);
}


// Reusable helper that writes a short log entry (with action, task name and time) 
// into localStorage for the home page timeline
function logActivity(action, taskName) {
    const logs = JSON.parse(localStorage.getItem("meridian_activity")) || [];
    // Add the newest log item to the front of the array so recent actions appear first
    logs.unshift({ action, taskName, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
    // Keep only the latest 6 activity entries so the list does not grow forever
    localStorage.setItem("meridian_activity", JSON.stringify(logs.slice(0, 6))); 
}