const ul = document.getElementById('task-List');

const template = document.querySelector('#task-li');
const tasksForm = document.querySelector('form[name=tasks]');
const btns = document.getElementById('sort-block');
const btn1 = document.getElementById('btn1');

function getNode(li) {
    return {
        li,
        divHead: li.querySelector('.head'),
        chBox: li.querySelector('.chBox'),
        h2: li.querySelector(".title"),
        divTaskInfo: li.querySelector('.task-info'),
        pDate: li.querySelector('.date'),
        pDescription: li.querySelector('.description'),
    }
}
function createTaskListItem(task) {
    let li = template.content.cloneNode(true).querySelector('li');
    let nodes = getNode(li);
    li.setAttribute("id", task.id);
    setHeadAndDescription(task, nodes)
    isOverdue(task, nodes);
    isDone(task, nodes);

    return li;
}
function appendTask(task) {
    let { name, due_date, description } = task;
    const taskElement = createTaskListItem(task);
    taskElement.setAttribute("id", task.id);
    ul.append(taskElement)
}
function setHeadAndDescription(task, { h2, pDescription, pDate }) {
    h2.textContent = `${task.name}`;
    task.description !== null ? pDescription.textContent = `${task.description}` : pDescription.textContent = '';
    pDescription.textContent = "";
}
function isOverdue(task, { divHead, pDate }) {
    if (!task.due_date) {
        return false;
    }
    const taskDate = new Date(task.due_date);
    const currDate = new Date(new Date().setHours(0, 0, 0, 0));
    taskDate.setHours(0, 0, 0, 0);
    task.due_date !== null ? pDate.textContent = `${newDateFormat(taskDate)}` : pDate.textContent = '';
    if (currDate > taskDate) {
        divHead.parentElement.className = 'task overdue';
        pDate.classList.toggle('overdue');
        return true;
    }
    return false;
}
function isDone(task, { chBox, li }) {
    if (task.done) {
        chBox.checked = true;
        li.classList.toggle('checked');
    }
    return chBox.checked;
}
function setStatus(element) {
    let li = element.parentElement.parentElement;
    let currItemId = parseInt(li.getAttribute("id"));
    let chBoxStatus = li.querySelector('.chBox').checked;
    const taskProps = { done: chBoxStatus ? true : false };
    updateTask(currItemId, taskProps);
}
function removeTask(element) {
    let li = element.parentElement.parentElement;
    let currItemId = parseInt(li.getAttribute("id"));
    const currLi = element.closest(".task");
    deleteTask(currItemId)
        .then(() => currLi.remove(), alert);
}

function newDateFormat(date) {
    const dateObj = {
        year: date.getFullYear(),
        month: ('0' + (date.getMonth() + 1)).slice(-2),
        day: ('0' + (date.getDate())).slice(-2),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        seconds: date.getSeconds(),
        ms: date.getMilliseconds()
    };
    return `${dateObj.year}-${dateObj.month}-${dateObj.day} ${dateObj.hours}:${dateObj.minutes}:${dateObj.seconds}.${dateObj.ms}`
}
ul.addEventListener('change', (event) => {
    if (event.target.classList.contains('chBox')) {
        let t = event.target.closest('.task');
        t.classList.toggle('checked');
    }
});
btns.addEventListener('click', (event) => {
    if (event.target.classList.contains('button')) {
        event.target.classList.toggle('enabled');
        ul.classList.toggle('hide-done');
    }
});
tasksForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(tasksForm);
    const task = Object.fromEntries(formData.entries());
    if (task.name === '') {
        alert('You must input task name');
    } else {
        task.due_date ? '' : task.due_date = null
        createNewTask(task)
            .then(task => appendTask(task));
    }
});

let tasksEndpoint = 'http://localhost:3000/tasks/';

fetch(tasksEndpoint)
    .then(res => res.json())
    .then(tasks => tasks.forEach(appendTask));

function createNewTask(task) {
    return fetch(tasksEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
    })
        .then(res => res.json());
}
function updateTask(currItemId, taskProps) {
    return fetch(tasksEndpoint + `${currItemId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskProps)
    })
        .then(res => res.json());
}
function deleteTask(currItemId) {
    return fetch(tasksEndpoint + `${currItemId}`, {
        method: 'DELETE'
    });
}
