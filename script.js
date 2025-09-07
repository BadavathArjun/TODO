document.addEventListener('DOMContentLoaded', () => {
  const todoInput = document.getElementById('todo-input');
  const todoList = document.getElementById('todo-list');
  const itemsLeft = document.getElementById('items-left');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const clearCompletedBtn = document.getElementById('clear-completed');
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');

  let todos = JSON.parse(localStorage.getItem('todos')) || [];
  let currentFilter = 'all';
  let darkMode = localStorage.getItem('darkMode') === 'true';

  // Initialize theme
  function applyTheme() {
    if (darkMode) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      themeIcon.src = 'images/icon-sun.svg';
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      themeIcon.src = 'images/icon-moon.svg';
    }
  }

  applyTheme();

  themeToggleBtn.addEventListener('click', () => {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    applyTheme();
  });

  // Save todos to localStorage
  function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
  }

  // Render todos based on filter
  function renderTodos() {
    todoList.innerHTML = '';

    let filteredTodos = todos;
    if (currentFilter === 'active') {
      filteredTodos = todos.filter(todo => !todo.completed);
    } else if (currentFilter === 'completed') {
      filteredTodos = todos.filter(todo => todo.completed);
    }

    filteredTodos.forEach(todo => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      if (todo.completed) li.classList.add('completed');
      li.setAttribute('data-id', todo.id);
      li.setAttribute('draggable', 'true');

      const checkbox = document.createElement('div');
      checkbox.className = 'todo-checkbox';
      if (todo.completed) checkbox.classList.add('checked');
      checkbox.addEventListener('click', () => toggleComplete(todo.id));

      if (todo.completed) {
        const checkImg = document.createElement('img');
        checkImg.src = 'images/icon-check.svg';
        checkImg.alt = 'Completed';
        checkbox.appendChild(checkImg);
      }

      const text = document.createElement('span');
      text.className = 'todo-text';
      text.textContent = todo.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'todo-delete';
      deleteBtn.innerHTML = '<img src="images/icon-cross.svg" alt="Delete" />';
      deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(deleteBtn);

      // Drag and drop event handlers
      li.addEventListener('dragstart', dragStart);
      li.addEventListener('dragover', dragOver);
      li.addEventListener('drop', drop);
      li.addEventListener('dragend', dragEnd);

      todoList.appendChild(li);
    });

    updateItemsLeft();
  }

  // Drag and drop handlers
  let dragSrcEl = null;

  function dragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
  }

  function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
  }

  function drop(e) {
    e.stopPropagation();
    if (dragSrcEl !== this) {
      const srcId = dragSrcEl.getAttribute('data-id');
      const targetId = this.getAttribute('data-id');

      const srcIndex = todos.findIndex(todo => todo.id == srcId);
      const targetIndex = todos.findIndex(todo => todo.id == targetId);

      // Swap positions
      todos.splice(targetIndex, 0, todos.splice(srcIndex, 1)[0]);
      saveTodos();
      renderTodos();
    }
    return false;
  }

  function dragEnd(e) {
    this.classList.remove('dragging');
  }

  // Update items left count
  function updateItemsLeft() {
    const count = todos.filter(todo => !todo.completed).length;
    itemsLeft.textContent = `${count} item${count !== 1 ? 's' : ''} left`;
  }

  // Add new todo
  todoInput.addEventListener('keydown', e => {
    if (e.key === 'Enter' && todoInput.value.trim() !== '') {
      const newTodo = {
        id: Date.now(),
        text: todoInput.value.trim(),
        completed: false,
      };
      todos.push(newTodo);
      saveTodos();
      renderTodos();
      todoInput.value = '';
    }
  });

  // Toggle complete
  function toggleComplete(id) {
    todos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos();
    renderTodos();
  }

  // Delete todo
  function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
  }

  // Filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      currentFilter = button.getAttribute('data-filter');
      renderTodos();
    });
  });

  // Clear completed
  clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    renderTodos();
  });

  // Initial render
  renderTodos();
});
