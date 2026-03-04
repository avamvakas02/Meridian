### PROJECT REPORT: MERIDIAN TASK MANAGEMENT SYSTEM

**Course**: ITC 4214 – Internet Programming  
**Student**: Aristeidis Panagiotis Vamvakas  

---

### 1. Task Allocation System – Overview

Meridian is a browser-based task manager** that runs fully on the client side. It uses HTML, CSS, JavaScript, jQuery, Bootstrap, `localStorage`, and Chart.js. All data (tasks and activity logs) is saved in the user’s browser, so the app works without a backend server.  

- **Storage model**  
  - `meridian_tasks` (in `localStorage`): an array of task objects with fields:  
    - `id`, `name`, `desc`, `date`, `priority`, `completed`.  
    - Created and managed mainly in `js/tasks.js`.  
  - `meridian_activity` (in `localStorage`): an array of recent actions with:  
    - `action`, `taskName`, `time`.  
    - Written in `js/tasks.js` and read/rendered in `js/main.js`.  

- **Main pages and scripts**  
  - `index.html` (Home): Latest Activity feed + quote.  
    - Scripts: `js/main.js`, `js/api.js`.  
  - `tasks.html` (Tasks): add/edit/complete/delete/sort tasks.  
    - Script: `js/tasks.js`.  
  - `analytics.html` (Analytics): charts and summary cards.  
    - Script: `js/analytics.js`.  
  - `about-us.html` (Personal page): project mission + developer info.  
    - Script: `js/main.js`.  
  - `contact-us.html` (Contact): front-end contact form.  
    - Script: `js/contact-us.js`.  

- **Data flow** 
  - **Model**: `localStorage` keys `meridian_tasks` and `meridian_activity`.  
  - **Controller**:  
    - `js/tasks.js` – task CRUD, filtering, sorting, statistics, logging.  
    - `js/main.js` – shared layout, theme, activity feed.  
    - `js/analytics.js` – analytics calculations and charts.  
  - **View**: HTML is rebuilt with jQuery (mainly in `js/tasks.js`, `js/main.js`, and `js/analytics.js`) without page reloads.  

---

### 2. Coding Decisions – Tasks Page (`tasks.html` + `js/tasks.js`)

The Tasks page focuses on showing only important work, with simple sorting and always-correct statistics.  

- **2.1 Hiding completed tasks**  
  - In `js/tasks.js`, the main function `renderTasks()` loads all tasks from `localStorage` and then filters them with:  
    ```javascript
    tasks = tasks.filter(t => !t.completed);
    ```  
  - The table shows only tasks that are not completed. Completed tasks remain in `localStorage`, so `js/analytics.js` can still count them.  

- **2.2 Sorting by date or name**  
  - In `js/tasks.js`, a global variable `currentSort` stores the selected option from the dropdown `#sort-tasks`.  
  - The change handler on `#sort-tasks` updates `currentSort` and calls `renderTasks()` again.  
  - Inside `renderTasks()`, the array is sorted with `tasks.sort(...)`:  
    - Date sorting uses `new Date(a.date)` and `new Date(b.date)` for correct chronological order.  
    - Name sorting uses `a.name.localeCompare(b.name)` for alphabetical order.  

- **2.3 Live statistics cards**  
  - The function `updateStatistics()` in `js/tasks.js` reads `meridian_tasks` from `localStorage`, calculates total/completed/pending, and updates the elements `#stat-total`, `#stat-pending`, and `#stat-completed`.  
  - `renderTasks()` calls `updateStatistics()` at the end so the cards update after every change.  

- **2.4 CRUD actions and logging**  
  - **Add** – `saveTask(task)` in `js/tasks.js` pushes the new task into `meridian_tasks`, saves it back to `localStorage`, and calls `logActivity("New Task Added", task.name)`.  
  - **Complete** – `toggleComplete(id)` in `js/tasks.js` sets `completed = true`, logs `"Task Completed"`, shows an alert, and calls `renderTasks()`.  
  - **Edit** – `editTask(id)` in `js/tasks.js` loads the task into the form, calls `deleteTask(id, true)` to remove the old version, and lets the user submit an updated task.  
  - **Delete** – `deleteTask(id, isQuiet = false)` in `js/tasks.js` filters out the task, saves the list, optionally logs `"Task Deleted"`, and re-renders with `renderTasks()`.  
  - **Logging helper** – `logActivity(action, taskName)` in `js/tasks.js` reads `meridian_activity`, adds a new entry at the front with `logs.unshift(...)`, trims to 6 items, and writes back to `localStorage`.  

**Key script (`js/tasks.js`)**

```javascript
let currentSort = 'date-desc';

function renderTasks() {
  let tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
  const $container = $("#task-list-body");
  $container.empty();

  // Show only pending (not completed) tasks
  tasks = tasks.filter(t => !t.completed);

  // Apply selected sort rule
  tasks.sort((a, b) => {
    if (currentSort === 'date-asc') return new Date(a.date) - new Date(b.date);
    if (currentSort === 'date-desc') return new Date(b.date) - new Date(a.date);
    if (currentSort === 'name-asc') return a.name.localeCompare(b.name);
    return 0;
  });

  // Render table rows
  if (tasks.length === 0) {
    $container.append('<tr><td colspan="4" class="text-center text-muted py-4">No pending tasks. Great job!</td></tr>');
  } else {
    tasks.forEach(task => {
      const priorityClass = `priority-${task.priority.toLowerCase()}`;
      const row = `
        <tr>
          <td class="ps-4">
            <div class="fw-bold">${task.name}</div>
            <small class="text-muted">${task.desc}</small>
          </td>
          <td>${task.date}</td>
          <td><span class="priority-badge ${priorityClass}">${task.priority}</span></td>
          <td class="text-end pe-4">
            <button onclick="toggleComplete(${task.id})" class="btn btn-sm btn-outline-success me-1">
              <i class="bi bi-check-lg"></i>
            </button>
            <button onclick="editTask(${task.id})" class="btn btn-sm btn-outline-primary me-1">
              <i class="bi bi-pencil"></i>
            </button>
            <button onclick="deleteTask(${task.id})" class="btn btn-sm btn-outline-danger">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>`;
      $container.append(row);
    });
  }

  updateStatistics();
}

function updateStatistics() {
  const tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  $("#stat-total").text(total);
  $("#stat-pending").text(pending);
  $("#stat-completed").text(completed);
}

function logActivity(action, taskName) {
  const logs = JSON.parse(localStorage.getItem("meridian_activity")) || [];
  logs.unshift({
    action,
    taskName,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  localStorage.setItem("meridian_activity", JSON.stringify(logs.slice(0, 6)));
}
```

---

### 3. Coding Decisions – Latest Activity (Home Page)

The Latest Activity section turns `meridian_activity` into a readable timeline.  

- **3.1 Shared header/footer and page setup** (`js/main.js`)  
  - `loadComponent(placeholder, file, callback)` in `js/main.js` uses `$(placeholder).load(file, ...)` to insert `components/header.html` and `components/footer.html` into each page.  
  - After the header is loaded, `initNavigation()` in `js/main.js` runs:  
    - Marks the correct nav link as `active` based on the current file name.  
    - Attaches the click handler for the dark-mode button `#theme-toggle`, and uses `updateThemeIcon(isDark)` plus `applySavedTheme()` (same file) to read and write `meridian-theme` in `localStorage`.  

- **3.2 Logging and rendering activity**  
  - Logging actions (add/complete/delete) is done by `logActivity()` in `js/tasks.js`.  
  - Displaying the log is done by `renderActivityFeed()` in `js/main.js`:  
    - Called in `$(document).ready(...)` when `#activity-list` exists.  
    - Reads `meridian_activity` from `localStorage`.  
    - If empty, shows a message like “System log is empty.”  
    - Otherwise, loops through each log and builds `<li>` items with icons and colors based on `log.action`.  

- **3.3 Clear Log button and safety check**  
  - In `js/main.js`, if `#activity-list` exists, the Clear Log button `#clear-activity` gets a click handler that calls `localStorage.removeItem("meridian_activity")` and then `renderActivityFeed()`.  
  - The condition `if ($("#activity-list").length > 0)` ensures this only runs on pages that actually have the activity list.  

**Key script (`js/main.js` – activity feed and theme)**

```javascript
$(document).ready(function () {
  loadComponent("#header-placeholder", "components/header.html", initNavigation);
  loadComponent("#footer-placeholder", "components/footer.html");

  applySavedTheme();

  if ($("#activity-list").length > 0) {
    renderActivityFeed();

    $("#clear-activity").on("click", function() {
      localStorage.removeItem("meridian_activity");
      renderActivityFeed();
    });
  }
});

function renderActivityFeed() {
  const logs = JSON.parse(localStorage.getItem("meridian_activity")) || [];
  const $list = $("#activity-list");
  $list.empty();

  if (logs.length === 0) {
    $list.append(`
      <li class="text-muted py-2">
        <i class="bi bi-info-circle me-2 text-primary"></i> System log is empty.
      </li>
    `);
    return;
  }

  logs.forEach(log => {
    let icon = "bi-arrow-right-short";
    let color = "text-secondary";

    if (log.action.includes("Added")) { icon = "bi-plus-lg"; color = "text-primary"; }
    else if (log.action.includes("Completed")) { icon = "bi-check2-all"; color = "text-success"; }
    else if (log.action.includes("Deleted")) { icon = "bi-trash"; color = "text-danger"; }

    const logItem = `
      <li class="activity-item d-flex align-items-start mb-3">
        <div class="me-3 mt-1 ${color}">
          <i class="bi ${icon} fs-5"></i>
        </div>
        <div>
          <div class="fw-bold">${log.action}</div>
          <div class="small text-muted">"${log.taskName}" • <span class="fst-italic">${log.time}</span></div>
        </div>
      </li>`;
    $list.append(logItem);
  });
}
```

---

### 4. Coding Decisions – About Us Page (`about-us.html` + `js/main.js`)
 

- **4.1 Layout and responsive design**  
  - `about-us.html` uses Bootstrap’s `container`, `row`, and `col-lg-*` classes to set up a profile card on one side and text about mission/values on the other.  
  - “Under the Hood” and the final call-to-action also use Bootstrap utilities for padding and alignment.  
  - The header and footer come from `loadComponent()` and `initNavigation()` in `js/main.js`.  

- **4.2 Accessibility choices**  
  - Uses `<main>` and `<section>` elements with proper headings.  
  - All profile and carousel images in `about-us.html` include `alt` text.  
  - Dark mode and theme handling come from `applySavedTheme()`, `updateThemeIcon(isDark)`, and the `#theme-toggle` handler in `js/main.js`.  

- **4.3 About Us carousel**  
  - A Bootstrap carousel in `about-us.html` shows three images with captions about focus, secure architecture, and clarity.  
  - The carousel is powered by the Bootstrap JS bundle loaded in the page; no extra custom JS is needed beyond `js/main.js` for shared layout.  

---

### 5. Additional Functionality

1. Testimonials cards where added to ensure the authenticity of the website 

### 6. GitHub Repository

The project is hosted on GitHub.  

- **Repository URL**: https://github.com/avamvakas02/Meridian.git  



### 7. Reflections on the Work

- **Main challenges**  
  - Avoiding repeated navigation code across pages → solved by `loadComponent()` in `js/main.js` with shared `header.html` and `footer.html`.  
  - Keeping the Home activity feed in sync with the Tasks page → solved using `localStorage` (`meridian_activity`) plus `logActivity()` in `js/tasks.js` and `renderActivityFeed()` in `js/main.js`.  
  - Managing JSON in `localStorage` reliably → solved by centralizing reads/writes inside helper functions like `saveTask()`, `deleteTask()`, `toggleComplete()`, and `updateStatistics()` (all in `js/tasks.js`).  
  - Setting up analytics → handled by `initAnalytics()`, `renderSummaryCards(tasks)`, `renderCharts(tasks)`, and `showEmptyState()` in `js/analytics.js`.  

- **What I learned**  
  - Structuring a small, multi-page front-end app sharing scripts like `js/main.js`.  
  - Using `localStorage` as a simple persistent store and keeping the UI synchronized with functions in `js/tasks.js` and `js/analytics.js`.  
  Combining Bootstrap and jQuery to build responsive and interactive pages.  
   

- **Future improvements**  
  - Add categories/labels to tasks and filter them in `renderTasks()` in `js/tasks.js`.  
  - Add visual warnings for tasks near their due date on `tasks.html`.  
  - Export task data and activity logs to JSON/CSV via new helper functions in `js/tasks.js`.  
  - Move to a real backend with user accounts, while still keeping the structure of `js/tasks.js` and `js/analytics.js` as a front-end layer.  

---

### 8. References 

- **MDN Web Docs – Web Storage (`localStorage`)**  
  - `https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage`  

- **MDN Web Docs – Array methods (`filter`, `map`, `sort`)**  
  - `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array`  

- **MDN Web Docs – `Date` object**  
  - `https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date`  

- **MDN Web Docs – DOM manipulation and events**  
  - `https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model`  

- **jQuery Documentation** (used in `js/main.js` and `js/tasks.js`)  
  - `https://api.jquery.com/`  

- **Bootstrap 5 Documentation** (layout, grid, cards, carousel, utilities)  
  - `https://getbootstrap.com/docs/5.3/getting-started/introduction/`  

- **Bootstrap Icons**  
  - `https://icons.getbootstrap.com/`  

- **Chart.js Documentation** (used in `js/analytics.js`)  
  - `https://www.chartjs.org/docs/latest/`  


- **AI and tooling**  
  - ChatGPT (OpenAI) – brainstorming, structure, code generation, and debugging:  
    - `https://chat.openai.com/`  


