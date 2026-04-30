// JavaScript for tab switching
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });

    // Remove 'active' class from all nav buttons
    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.remove("active");
    });

    // Show the selected tab
    document.getElementById(tabName + "Tab").classList.add("active");

    // Add 'active' class to the clicked nav button
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
}

// Function to handle Create Session button visibility
function toggleCreateSessionButton(tabName) {
    const createSessionBtn = document.querySelector('.btn-primary');
    if (tabName !== 'home') {
        createSessionBtn.style.display = 'none'; // Hide button on non-Home tabs
    } else {
        createSessionBtn.style.display = 'block'; // Show button on Home tab
    }
}