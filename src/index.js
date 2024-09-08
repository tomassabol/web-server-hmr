// @ts-check
import { logger } from "./logger.js";

const button = document.getElementById("myBtn");

button?.addEventListener("click", () => {
  alert("Hello World!");

  // @ts-ignore
  const bgColor = button.style.backgroundColor;
  if (bgColor === "red") {
    // @ts-ignore
    button.style.backgroundColor = "blue";
  } else {
    // @ts-ignore
    button.style.backgroundColor = "red";
  }
});

const hoverBtn = document.getElementById("hover-btn");
const hiddenMessageText = document.getElementById("hidden-message");
if (!hiddenMessageText) {
  throw new Error("hidden-message element not found");
}
if (!hoverBtn) {
  throw new Error("hover-btn element not found");
}

const hiddenMessageClassList = hiddenMessageText.classList;

hoverBtn.addEventListener("mouseover", () => {
  hiddenMessageClassList.remove("hidden");
});

hoverBtn.addEventListener("mouseout", () => {
  hiddenMessageClassList.add("hidden");
});

const submitBtn = document.getElementById("addTodo");
if (!submitBtn) {
  throw new Error("addTodo element not found");
}

const todoList = document.getElementById("todoList");
if (!todoList) {
  throw new Error("todoList element not found");
}

const newTodoText = document.getElementById("newTodoText");
if (!newTodoText) {
  throw new Error("newTodoText element not found");
}

submitBtn.addEventListener("click", () => {
  // @ts-expect-error
  const inputValue = newTodoText.value;

  const newTodo = document.createElement("li");
  newTodo.innerText = inputValue;
  todoList.appendChild(newTodo);
});

newTodoText.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    // @ts-expect-error
    const inputValue = newTodoText.value;

    const newTodo = document.createElement("li");
    newTodo.innerText = inputValue;
    todoList.appendChild(newTodo);
  }
});

logger.warn("This is a warning message");
logger.info("This is an info message");
