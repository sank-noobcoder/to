document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const authContainer = document.getElementById('auth-container');
    const mainContainer = document.querySelector('.container');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const authMessage = document.getElementById('auth-message');
    const logoutBtn = document.getElementById('logout-btn');
    
    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image');
    const todosContainer = document.querySelector('.todos-container');
    const progressBar = document.getElementById('progress');
    const progressNumber = document.getElementById('numbers');
     let currentUserId = localStorage.getItem('currentUserId');

    // Check authentication state
    const checkAuthState = () => {
        const user = localStorage.getItem('currentUser');
        if (user) {
            authContainer.style.display = 'none';
            mainContainer.style.display = 'block';
            loadTasks();
        } else {
            authContainer.style.display = 'flex';
            mainContainer.style.display = 'none';
        }
    };
    
    

    // Authentication functions
    const handleLogin = () => {
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!email || !password) {
            showAuthMessage('Please enter both email and password', 'error');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        
        if (user) {
            localStorage.setItem('currentUser', email);
            checkAuthState();
            showAuthMessage('Login successful!', 'success');
        } else {
            showAuthMessage('Invalid email or password', 'error');
        }
    };

    const handleSignup = () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        if (!email || !password) {
            showAuthMessage('Please enter both email and password', 'error');
            return;
        }
        
        if (password.length < 6) {
            showAuthMessage('Password must be at least 6 characters', 'error');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        if (users.some(u => u.email === email)) {
            showAuthMessage('Email already exists', 'error');
            return;
        }
        
        users.push({ email, password });
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', email);
        checkAuthState();
        showAuthMessage('Account created successfully!', 'success');
        

    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        checkAuthState();
        emailInput.value = '';
        passwordInput.value = '';
    };

    const showAuthMessage = (message, type) => {
        authMessage.textContent = message;
        authMessage.className = type;
        setTimeout(() => {
            authMessage.textContent = '';
            authMessage.className = '';
        }, 3000);
    };

    // Task management functions
    const toggleEmptyState = () => {
        emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
        todosContainer.style.width = taskList.children.length > 0 ? '100%' : '50%';
    };

    const updateProgress = () => {
        const totalTasks = taskList.children.length;
        const completedTasks = document.querySelectorAll('#task-list .checkbox:checked').length;
        
        const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        progressBar.style.width = `${progressPercentage}%`;
        progressNumber.textContent = `${completedTasks}/${totalTasks}`;

        if (totalTasks > 0 && completedTasks === totalTasks) {
            triggerConfetti();
        }
    };

    const saveTasks = () => {
        const user = localStorage.getItem('currentUser');
        if (!user) return;
        
        const tasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            const text = li.querySelector('span')?.textContent || '';
            const completed = li.querySelector('.checkbox')?.checked || false;
            tasks.push({ text, completed });
        });
        
        localStorage.setItem(`tasks_${user}`, JSON.stringify(tasks));
    };

    const loadTasks = () => {
        const user = localStorage.getItem('currentUser');
        if (!user) return;
        
        const tasks = JSON.parse(localStorage.getItem(`tasks_${user}`)) || [];
        taskList.innerHTML = '';
        tasks.forEach(task => createTaskElement(task.text, task.completed));
        toggleEmptyState();
        updateProgress();
    };

    const createTaskElement = (taskText, isCompleted = false) => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('checkbox');
        checkbox.checked = isCompleted;
        checkbox.addEventListener('change', function() {
            li.classList.toggle('completed', this.checked);
            updateProgress();
            saveTasks();
        });

        const taskSpan = document.createElement('span');
        taskSpan.textContent = taskText;

        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('task-actions');

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', () => editTask(li, taskSpan));

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => {
            li.remove();
            toggleEmptyState();
            updateProgress();
            saveTasks();
        });

        buttonsDiv.appendChild(editBtn);
        buttonsDiv.appendChild(deleteBtn);
        li.appendChild(checkbox);
        li.appendChild(taskSpan);
        li.appendChild(buttonsDiv);

        if (isCompleted) li.classList.add('completed');
        taskList.appendChild(li);
    };

    const addTask = (event) => {
        event.preventDefault();
        const taskText = taskInput.value.trim();
        if (!taskText) return;

        createTaskElement(taskText);
        taskInput.value = '';
        toggleEmptyState();
        updateProgress();
        saveTasks();
    };

    const editTask = (li, taskSpan) => {
        const currentText = taskSpan.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input');
        
        li.replaceChild(input, taskSpan);
        input.focus();
        
        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText) {
                taskSpan.textContent = newText;
                li.replaceChild(taskSpan, input);
                saveTasks();
            } else {
                li.remove();
                toggleEmptyState();
                updateProgress();
                saveTasks();
            }
        };
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
        
        input.addEventListener('blur', saveEdit);
    };

    const triggerConfetti = () => {
        const count = 200;
        const defaults = {
            origin: { y: 0.7 },
            zIndex: 1051
        };

        confetti({
            ...defaults,
            particleCount: Math.floor(count * 0.25),
            spread: 26,
            startVelocity: 55
        });

        confetti({
            ...defaults,
            particleCount: Math.floor(count * 0.2),
            spread: 60
        });

        confetti({
            ...defaults,
            particleCount: Math.floor(count * 0.35),
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        confetti({
            ...defaults,
            particleCount: Math.floor(count * 0.1),
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        confetti({
            ...defaults,
            particleCount: Math.floor(count * 0.1),
            spread: 120,
            startVelocity: 45
        });
    };

    // Event listeners
    loginBtn.addEventListener('click', handleLogin);
    signupBtn.addEventListener('click', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);
    
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask(e);
    });

    // Initialize
    checkAuthState();
});


document.addEventListener('DOMContentLoaded', () => {
    const API = 'http://localhost:5000/api';

    const authContainer = document.getElementById('auth-container');
    const mainContainer = document.querySelector('.container');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const authMessage = document.getElementById('auth-message');
    const logoutBtn = document.getElementById('logout-btn');

    const taskInput = document.getElementById('task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskList = document.getElementById('task-list');
    const emptyImage = document.querySelector('.empty-image');
    const todosContainer = document.querySelector('.todos-container');
    const progressBar = document.getElementById('progress');
    const progressNumber = document.getElementById('numbers');

    let currentUserId = localStorage.getItem('currentUserId');

    const checkAuthState = () => {
        currentUserId = localStorage.getItem('currentUserId');
        if (currentUserId) {
            authContainer.style.display = 'none';
            mainContainer.style.display = 'block';
            loadTasks();
        } else {
            authContainer.style.display = 'flex';
            mainContainer.style.display = 'none';
        }
    };

    const showAuthMessage = (message, type) => {
        authMessage.textContent = message;
        authMessage.className = type;
        setTimeout(() => {
            authMessage.textContent = '';
            authMessage.className = '';
        }, 3000);
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleLogin = async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        if (!email || !password) return showAuthMessage('Enter email and password', 'error');

        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('currentUserId', data.userId);
                checkAuthState();
            } else {
                showAuthMessage(data?.error || 'Login failed', 'error');
            }
        } catch (err) {
            console.error(err);
            showAuthMessage('Login failed', 'error');
        }
    };

    const handleSignup = async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            return showAuthMessage('Enter valid email and password', 'error');
        }

        if (!isValidEmail(email)) {
            return showAuthMessage('Invalid email format', 'error');
        }

        if (password.length < 6) {
            return showAuthMessage('Password must be at least 6 characters', 'error');
        }

        try {
            const res = await fetch(`${API}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('currentUserId', data.userId);
                checkAuthState();
            } else {
                showAuthMessage(data?.error || 'Signup failed', 'error');
            }
        } catch (err) {
            console.error(err);
            showAuthMessage('Signup failed', 'error');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUserId');
        checkAuthState();
    };

    const loadTasks = async () => {
        const res = await fetch(`${API}/tasks/${currentUserId}`);
        const tasks = await res.json();
        taskList.innerHTML = '';
        tasks.forEach(t => createTaskElement(t._id, t.text, t.completed));
        toggleEmptyState();
        updateProgress();
    };

    const saveTask = async (text, completed = false) => {
        const res = await fetch(`${API}/tasks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, completed, userId: currentUserId })
        });
        const task = await res.json();
        createTaskElement(task._id, task.text, task.completed);
        toggleEmptyState();
        updateProgress();
    };

    const updateTask = async (id, updated) => {
        await fetch(`${API}/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updated)
        });
    };

    const deleteTask = async (id, li) => {
        await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
        li.remove();
        toggleEmptyState();
        updateProgress();
    };

    const createTaskElement = (id, text, completed) => {
        const li = document.createElement('li');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.classList.add('checkbox');
        checkbox.checked = completed;
        checkbox.addEventListener('change', () => {
            li.classList.toggle('completed', checkbox.checked);
            updateTask(id, { completed: checkbox.checked });
            updateProgress();
        });

        const taskSpan = document.createElement('span');
        taskSpan.textContent = text;

        const buttonsDiv = document.createElement('div');
        buttonsDiv.classList.add('task-actions');

        const editBtn = document.createElement('button');
        editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', () => editTask(id, li, taskSpan));

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        deleteBtn.classList.add('delete-btn');
        deleteBtn.addEventListener('click', () => deleteTask(id, li));

        buttonsDiv.appendChild(editBtn);
        buttonsDiv.appendChild(deleteBtn);
        li.appendChild(checkbox);
        li.appendChild(taskSpan);
        li.appendChild(buttonsDiv);

        li.classList.toggle('completed', completed);
        taskList.appendChild(li);
    };

    const editTask = (id, li, taskSpan) => {
        const currentText = taskSpan.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add('edit-input');
        li.replaceChild(input, taskSpan);
        input.focus();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText) {
                updateTask(id, { text: newText });
                taskSpan.textContent = newText;
                li.replaceChild(taskSpan, input);
            } else {
                deleteTask(id, li);
            }
        };

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveEdit();
        });
        input.addEventListener('blur', saveEdit);
    };

    const addTask = (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (text) saveTask(text);
        taskInput.value = '';
    };

    const toggleEmptyState = () => {
        emptyImage.style.display = taskList.children.length === 0 ? 'block' : 'none';
        todosContainer.style.width = taskList.children.length > 0 ? '100%' : '50%';
    };

    const updateProgress = () => {
        const total = taskList.children.length;
        const completed = document.querySelectorAll('#task-list .checkbox:checked').length;
        progressBar.style.width = `${(completed / total) * 100 || 0}%`;
        progressNumber.textContent = `${completed}/${total}`;
    };

    loginBtn.addEventListener('click', handleLogin);
    signupBtn.addEventListener('click', handleSignup);
    logoutBtn.addEventListener('click', handleLogout);
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') addTask(e);
    });

    checkAuthState();
});
