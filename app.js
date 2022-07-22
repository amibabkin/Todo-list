// Global
const todoList = document.getElementById("todo-list");
const userSelect = document.getElementById("user-todo");
const form = document.querySelector("form");
let users = [];
let todos = [];

// Attach events
document.addEventListener("DOMContentLoaded", initApp);
form.addEventListener("submit", handleSubmit);

// Basic logic
function getUserName(userId) {
  const user = users.find((u) => u.id === userId);
  return user.name;
}

function printTodo({ id, userId, title, completed }) {
  const li = document.createElement("li");
  li.className = "todo-item";
  li.dataset.id = id;
  li.innerHTML = `<span>${title}</span> <i>by</i> <b>${getUserName(
    userId
  )}</b>`;

  const status = document.createElement("input");
  status.type = "checkbox";
  status.checked = completed; // задача с сервера может прийти завершённой
  status.addEventListener("change", handleTodoChange);

  const close = document.createElement("span");
  close.innerHTML = "&times";
  close.className = "close";
  close.addEventListener("click", handleClose);

  li.prepend(status);
  li.append(close);

  todoList.prepend(li);
}

function createUserOption(user) {
  const option = document.createElement("option");
  option.value = user.id;
  option.innerText = user.name;

  userSelect.append(option);
}

function removeTodo(todoId) {
  todos = todos.filter((todo) => todo.id !== todoId);

  const todo = todoList.querySelector(`[data-id="${todoId}"]`);
  todo.querySelector("input").removeEventListener("change", handleTodoChange);
  todo.querySelector(".close").removeEventListener("click", handleClose);

  todo.remove();
}

function alertError(error) {
  alert(error.message);
}

// Event logic
function initApp() {
  Promise.all([getAllUsers(), getAllTodos()]).then((values) => {
    [users, todos] = values;

    // отправить в разметку
    todos.forEach((todo) => printTodo(todo));
    users.forEach((user) => createUserOption(user));
  });
}

function handleSubmit(e) {
  e.preventDefault();

  createTodo({
    userId: Number(form.user.value), //id в качестве строки
    title: form.todo.value,
    completed: false,
  });
}

function handleTodoChange() {
  const todoId = this.parentElement.dataset.id;
  const completed = this.checked;

  toggleTodoComplete(todoId, completed);
}

function handleClose() {
  const todoId = this.parentElement.dataset.id;

  deleteTodo(todoId);
}

// async logic
async function getAllUsers() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const data = await response.json();

    return data;
  } catch (error) {
    alertError(error);
  }
}

async function getAllTodos() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos");
    const data = await response.json();

    return data;
  } catch (error) {
    alertError(error);
  }
}

async function createTodo(todo) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/todos", {
      method: "POST",
      body: JSON.stringify(todo),
      headers: { "Content-type": "application/json" },
    });
    const newTodo = await response.json();

    printTodo(newTodo);
  } catch (error) {
    alertError(error);
  }
}

async function toggleTodoComplete(todoId, completed) {
  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/todos/${todoId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ completed: completed }),
        headers: { "Content-type": "application/json" },
      }
    );
    const data = await response.json();
    console.log(data);

    if (!response.ok) {
      throw new Error("failed to connect with server!");
    }
  } catch (error) {
    alertError(error);
  }
}

async function deleteTodo(todoId) {
  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/todos/${todoId}`,
      {
        method: "DELETE",
        headers: { "Content-type": "application/json" },
      }
    );

    if (response.ok) {
      // delete todo from DOM
      removeTodo(todoId);
    } else {
      throw new Error("failed to connect width server!");
    }
  } catch (error) {
    alertError(error);
  }
}
