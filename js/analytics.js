/**
 * Meridian Analytics Engine
 * Processes localStorage data and renders Chart.js visualizations.
 */

$(document).ready(function () {
    // Wait a brief moment to ensure Chart.js is fully loaded
    setTimeout(initAnalytics, 100);
});

function initAnalytics() {
    const tasks = JSON.parse(localStorage.getItem("meridian_tasks")) || [];
    
    // If no tasks exist, show empty state
    if (tasks.length === 0) {
        showEmptyState();
        return;
    }

    renderSummaryCards(tasks);
    renderCharts(tasks);
}

function renderSummaryCards(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const completionRate = Math.round((completed / total) * 100) || 0;

    const summaryHTML = `
        <div class="col-md-4">
            <div class="summary-card card shadow-sm border-0 rounded-4 p-4 text-center h-100">
                <p class="text-muted text-uppercase small fw-bold mb-2">Total Output</p>
                <h2 class="text-primary fw-bold mb-0">${total}</h2>
                <span class="small text-muted">Total tasks created</span>
            </div>
        </div>
        <div class="col-md-4">
            <div class="summary-card card shadow-sm border-0 rounded-4 p-4 text-center h-100">
                <p class="text-muted text-uppercase small fw-bold mb-2">Completion Rate</p>
                <h2 class="text-success fw-bold mb-0">${completionRate}%</h2>
                <span class="small text-muted">Of total workload</span>
            </div>
        </div>
        <div class="col-md-4">
            <div class="summary-card card shadow-sm border-0 rounded-4 p-4 text-center h-100">
                <p class="text-muted text-uppercase small fw-bold mb-2">Tasks Remaining</p>
                <h2 class="text-warning fw-bold mb-0">${total - completed}</h2>
                <span class="small text-muted">Pending action items</span>
            </div>
        </div>
    `;
    
    $("#analytics-summary").html(summaryHTML);
}

function renderCharts(tasks) {
    // 1. Prepare Data for Status Chart (Doughnut)
    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = tasks.length - completedCount;

    const ctxStatus = document.getElementById('statusChart').getContext('2d');
    new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending'],
            datasets: [{
                data: [completedCount, pendingCount],
                backgroundColor: ['#198754', '#ffc107'], // Success Green, Warning Yellow
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    // 2. Prepare Data for Priority Chart (Bar)
    const highCount = tasks.filter(t => t.priority === 'High' && !t.completed).length;
    const mediumCount = tasks.filter(t => t.priority === 'Medium' && !t.completed).length;
    const lowCount = tasks.filter(t => t.priority === 'Low' && !t.completed).length;

    const ctxPriority = document.getElementById('priorityChart').getContext('2d');
    new Chart(ctxPriority, {
        type: 'bar',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                label: 'Pending Tasks',
                data: [highCount, mediumCount, lowCount],
                backgroundColor: ['#dc3545', '#fd7e14', '#20c997'], // Red, Orange, Teal
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1 } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

function showEmptyState() {
    $("#analytics-summary").html(`
        <div class="col-12 text-center py-5">
            <i class="bi bi-bar-chart text-muted" style="font-size: 4rem;"></i>
            <h3 class="mt-3">No Data Available</h3>
            <p class="text-muted">Start adding and completing tasks to see your analytics dashboard populate.</p>
            <a href="tasks.html" class="btn btn-primary mt-2 rounded-pill px-4">Go to Tasks</a>
        </div>
    `);
}