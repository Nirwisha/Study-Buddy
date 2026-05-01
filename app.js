const students = [
    {
        id: 1,
        name: "Maya Chen",
        major: "Biochemistry",
        avatar: "MC",
        courses: ["BIOCHEM201", "CHEM101"],
        courseNames: ["BIOCHEM 201", "CHEM 101"],
        availability: "Thu Afternoon, Fri Evening",
        qualities: ["Patient", "Organized"],
        bio: "Reviewing enzyme kinetics and likes working through examples."
    },
    {
        id: 2,
        name: "Jordan Lee",
        major: "Computer Science",
        avatar: "JL",
        courses: ["CS101", "MATH201"],
        courseNames: ["CS 101", "MATH 201"],
        availability: "Mon Evening, Wed Afternoon",
        qualities: ["Productive", "Organized"],
        bio: "Prefers focused sessions with a clear goal and practice problems."
    },
    {
        id: 3,
        name: "Sam Rivera",
        major: "Physics",
        avatar: "SR",
        courses: ["PHYS101", "MATH201"],
        courseNames: ["PHYS 101", "MATH 201"],
        availability: "Tue Afternoon, Thu Evening",
        qualities: ["Patient", "Productive"],
        bio: "Good at explaining formulas and checking steps carefully."
    },
    {
        id: 4,
        name: "Ari Patel",
        major: "Chemistry",
        avatar: "AP",
        courses: ["CHEM101", "BIOCHEM201"],
        courseNames: ["CHEM 101", "BIOCHEM 201"],
        availability: "Wed Evening, Sat Afternoon",
        qualities: ["Organized", "Patient"],
        bio: "Likes making study guides and comparing notes before exams."
    }
];

let filteredStudents = [...students];
let cardIndex = 0;
let userCourses = [];
let createdSessions = [];
let joinedSessions = [];
let sentInvites = [];
let receivedInvites = [];
let conversations = [];
let activeConversationId = null;
let savedProfile = JSON.parse(localStorage.getItem("savedProfile")) || {};

function $(id) {
    return document.getElementById(id);
}

function showTab(tabName) {
    document.querySelectorAll(".tab-content").forEach(tab => {
        tab.classList.remove("active");
    });

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.remove("active");
    });

    $(tabName + "Tab").classList.add("active");
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
}

function filterBuddies() {
    const course = $("courseFilter").value;
    filteredStudents = course
        ? students.filter(student => student.courses.includes(course))
        : [...students];

    cardIndex = 0;
    renderBuddies();
}

function renderBuddies() {
    const holder = $("studentProfiles");
    $("buddyFilterCount").textContent = filteredStudents.length;

    if (filteredStudents.length === 0) {
        holder.innerHTML = `
            <div class="empty-state">
                <h3>No buddies found</h3>
                <p>Try choosing a different course.</p>
            </div>
        `;
        $("swipeCounter").textContent = "0 / 0";
        return;
    }

    const student = filteredStudents[cardIndex];
    holder.innerHTML = `
        <article class="buddy-card">
            <div class="buddy-avatar">${student.avatar}</div>
            <h3>${student.name}</h3>
            <p class="buddy-major">${student.major}</p>
            <div class="buddy-tags">
                ${student.courseNames.map(course => `<span>${course}</span>`).join("")}
            </div>
            <p><strong>Available:</strong> ${student.availability}</p>
            <p><strong>Study style:</strong> ${student.qualities.join(", ")}</p>
            <p class="buddy-bio">${student.bio}</p>
            <div class="buddy-actions">
                <button class="btn btn-secondary" onclick="viewBuddy(${student.id})">
                    View Profile
                </button>
                <button class="btn btn-primary" onclick="inviteBuddy(${student.id})">
                    Invite Buddy
                </button>
            </div>
        </article>
    `;
    $("swipeCounter").textContent = `${cardIndex + 1} / ${filteredStudents.length}`;
}

function nextCard() {
    if (filteredStudents.length === 0) return;
    cardIndex = (cardIndex + 1) % filteredStudents.length;
    renderBuddies();
}

function prevCard() {
    if (filteredStudents.length === 0) return;
    cardIndex = (cardIndex - 1 + filteredStudents.length) % filteredStudents.length;
    renderBuddies();
}

function viewBuddy(studentId) {
    const student = students.find(item => item.id === studentId);
    $("profileViewContent").innerHTML = `
        <div class="buddy-profile-view">
            <div class="buddy-avatar large">${student.avatar}</div>
            <h2>${student.name}</h2>
            <p>${student.major}</p>
            <p><strong>Courses:</strong> ${student.courseNames.join(", ")}</p>
            <p><strong>Availability:</strong> ${student.availability}</p>
            <p><strong>Qualities:</strong> ${student.qualities.join(", ")}</p>
            <p>${student.bio}</p>
            <button class="btn btn-primary" onclick="inviteBuddy(${student.id})">
                Invite Buddy
            </button>
        </div>
    `;
    $("profileViewModal").classList.add("show");
}

function closeProfileViewModal() {
    $("profileViewModal").classList.remove("show");
}

function inviteBuddy(studentId, sessionTitle = "Study Buddy Match") {
    const student = students.find(item => item.id === studentId);

    const invite = {
        id: Date.now(),
        studentId,
        name: student.name,
        status: "Accepted",
        title: sessionTitle
    };

    // Only sent invites should increase
    sentInvites.unshift(invite);

    // Add dummy message from invited buddy
    addAutoMessage(student, sessionTitle);

    updateAllViews();
    closeProfileViewModal();

    showToast(`${student.name} accepted your invite and messaged you.`);
}

function addAutoMessage(student, context) {
    let convo = conversations.find(item => item.studentId === student.id);

    if (!convo) {
        convo = {
            id: Date.now() + student.id,
            studentId: student.id,
            name: student.name,
            avatar: student.avatar,
            messages: []
        };
        conversations.unshift(convo);
    }

    convo.messages.push({
        from: "them",
        text: `Hey! I accepted your invite for ${context}. Want to review together?`
    });
}

function openCreateSessionModal() {
    fillInviteSelect();
    $("createSessionModal").classList.add("show");
}

function closeCreateSessionModal() {
    $("createSessionModal").classList.remove("show");
    $("createSessionForm").reset();
}

function fillInviteSelect() {
    if ($("sessionInviteBuddy")) return;

    const goalGroup = $("sessionGoal").closest(".form-group");
    goalGroup.insertAdjacentHTML("afterend", `
        <div class="form-group">
            <label class="form-label">Invite a Buddy</label>
            <select id="sessionInviteBuddy" class="form-input">
                <option value="">No invite</option>
                ${students.map(student => `
                    <option value="${student.id}">${student.name}</option>
                `).join("")}
            </select>
        </div>
    `);
}

function handleCreateSession(event) {
    event.preventDefault();

    const session = {
        id: Date.now(),
        date: $("sessionDate").value,
        time: $("sessionTime").value,
        location: $("sessionLocation").value,
        type: $("sessionType").value,
        goal: $("sessionGoal").value
    };

    createdSessions.unshift(session);

    const buddyId = Number($("sessionInviteBuddy")?.value || 0);
    if (buddyId) {
        const student = students.find(item => item.id === buddyId);
        inviteBuddy(buddyId, session.goal);
        joinedSessions.unshift({ ...session, with: student.name });
    } else {
        showToast("Study session created.");
    }

    closeCreateSessionModal();
    updateAllViews();
    showTab("sessions");
}

function showSessionType(type) {
    document.querySelectorAll(".session-tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.type === type);
    });
    $("createdSessionsList").classList.toggle("active", type === "created");
    $("joinedSessionsList").classList.toggle("active", type === "joined");
}

function showInviteType(type) {
    document.querySelectorAll(".invite-tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.type === type);
    });
    $("receivedInvitesList").classList.toggle("active", type === "received");
    $("sentInvitesList").classList.toggle("active", type === "sent");
}

function renderSessions() {
    $("createdSessionsContent").innerHTML = createdSessions.length
        ? createdSessions.map(sessionCard).join("")
        : `<div class="empty-state"><p>No sessions created yet</p></div>`;

    $("joinedSessionsContent").innerHTML = joinedSessions.length
        ? joinedSessions.map(session => sessionCard(session, session.with)).join("")
        : `<div class="empty-state"><p>No joined sessions yet</p></div>`;

    $("upcomingSessions").innerHTML = createdSessions.length
        ? createdSessions.slice(0, 3).map(sessionCard).join("")
        : `
            <div class="empty-state">
                <p>No upcoming sessions scheduled</p>
                <button class="btn btn-primary" onclick="showTab('sessions')">
                    Create a Session
                </button>
            </div>
        `;
}

function sessionCard(session, buddyName = "") {
    return `
        <div class="info-card">
            <h3>${session.type}</h3>
            <p><strong>Goal:</strong> ${session.goal}</p>
            <p><strong>When:</strong> ${formatDate(session.date)} at ${formatTime(session.time)}</p>
            <p><strong>Where:</strong> ${session.location}</p>
            ${buddyName ? `<p><strong>With:</strong> ${buddyName}</p>` : ""}
        </div>
    `;
}

function renderInvites() {
    $("sentInviteCount").textContent = sentInvites.length;
    $("receivedInviteCount").textContent = receivedInvites.length;
    $("inviteCount").textContent = receivedInvites.length;

    $("sentInvitesContent").innerHTML = sentInvites.length
        ? sentInvites.map(inviteCard).join("")
        : `<div class="empty-state"><p>No sent invites yet</p></div>`;

    $("receivedInvitesContent").innerHTML = receivedInvites.length
        ? receivedInvites.map(inviteCard).join("")
        : `<div class="empty-state"><p>No received invites yet</p></div>`;
}

function inviteCard(invite) {
    return `
        <div class="info-card">
            <h3>${invite.title}</h3>
            <p><strong>Buddy:</strong> ${invite.name}</p>
            <p><strong>Status:</strong> <span class="status-good">${invite.status}</span></p>
        </div>
    `;
}

function renderConversations() {
    $("conversationsList").innerHTML = conversations.length
        ? conversations.map(convo => `
            <button class="conversation-btn" onclick="openConversation(${convo.id})">
                <span class="chat-avatar small">${convo.avatar}</span>
                <span>${convo.name}</span>
            </button>
        `).join("")
        : `
            <div class="empty-state">
                <p class="help-text">Connect with buddies to start chatting</p>
            </div>
        `;

    if (activeConversationId) renderMessages();
}

function openConversation(convoId) {
    activeConversationId = convoId;
    renderMessages();
}

function renderMessages() {
    const convo = conversations.find(item => item.id === activeConversationId);
    if (!convo) return;

    $("chatHeader").style.display = "block";
    $("chatInput").style.display = "flex";
    $("chatPartnerAvatar").textContent = convo.avatar;
    $("chatPartnerName").textContent = convo.name;

    $("chatMessages").innerHTML = convo.messages.map(message => `
        <div class="message ${message.from}">${message.text}</div>
    `).join("");
}

function sendMessage() {
    const input = $("messageInput");
    const text = input.value.trim();
    const convo = conversations.find(item => item.id === activeConversationId);

    if (!text || !convo) return;

    convo.messages.push({ from: "me", text });
    input.value = "";
    renderMessages();
}

function handleMessageKeyPress(event) {
    if (event.key === "Enter") sendMessage();
}

function openAddCourseRow() {
    $("addCourseForm").style.display = "block";
}

function closeAddCourseRow() {
    $("addCourseForm").style.display = "none";
    $("newCourseName").value = "";
    $("newCourseProfessor").value = "";
}

function saveCourseEntry() {
    const name = $("newCourseName").value.trim();
    const professor = $("newCourseProfessor").value.trim();

    if (!name) {
        showToast("Please enter a course name.");
        return;
    }

    userCourses.push({ name, professor });
    renderCourses();
    closeAddCourseRow();
}

function renderCourses() {
    $("courseEntries").innerHTML = userCourses.length
        ? userCourses.map(course => `
            <div class="course-entry">
                <strong>${course.name}</strong>
                <span>${course.professor || "Professor not listed"}</span>
            </div>
        `).join("")
        : `<p class="help-text">No courses added yet</p>`;
}

function setupProfileForm() {
    restoreProfileForm();

    $("profileForm").addEventListener("submit", event => {
        event.preventDefault();

        const form = $("profileForm");
        const inputs = form.querySelectorAll("input, select, textarea");

        inputs.forEach(input => {
            if (input.id) {
                savedProfile[input.id] = input.value;
            }
        });

        localStorage.setItem("savedProfile", JSON.stringify(savedProfile));

        const name = $("profileName").value.trim() || "Student";
        $("userName").textContent = name.split(" ")[0];

        showToast("Profile saved.");
    });
}

function restoreProfileForm() {
    Object.keys(savedProfile).forEach(id => {
        const input = $(id);
        if (input) input.value = savedProfile[id];
    });

    if (savedProfile.profileName) {
        $("userName").textContent = savedProfile.profileName.split(" ")[0];
    }
}

function updateAllViews() {
    renderSessions();
    renderInvites();
    renderConversations();
}

function formatDate(dateText) {
    if (!dateText) return "TBD";
    return new Date(dateText + "T00:00").toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function formatTime(timeText) {
    if (!timeText) return "TBD";
    const [hour, minute] = timeText.split(":");
    const date = new Date();
    date.setHours(Number(hour), Number(minute));
    return date.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit"
    });
}

function showToast(message) {
    let toast = $("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast";
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2800);
}

document.addEventListener("DOMContentLoaded", () => {
    renderBuddies();
    renderCourses();
    updateAllViews();
    setupProfileForm();
});
