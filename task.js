#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const taskFilePath = path.join(process.cwd(), 'task.txt');
const completedFilePath = path.join(process.cwd(), 'completed.txt');


function deleteFile(path) {
  try {
    fs.unlinkSync(path);
  } catch (err) {}
}

function addTask(priority, text) {
  const task = {
    priority: parseInt(priority),
    text: text,
  };
  const taskString = JSON.stringify(task);

  let existingTasks = loadTasks(taskFilePath);
  if (existingTasks.length > 0) {
    fs.appendFileSync(taskFilePath, `\n${taskString}`);
  } else {
    fs.appendFileSync(taskFilePath, taskString);
  }
  console.log(`Added task: "${text}" with priority ${priority}`);
}

function listTasks() {
  const tasks = loadTasks(taskFilePath);
  const sortedTasks = tasks.sort((a, b) => a.priority - b.priority);

  if (sortedTasks.length === 0) {
    console.log('There are no pending tasks!');
  } else {
    console.log('TODO List:');
    sortedTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.text} [${task.priority}]`);
    });
  }
}

function deleteTask(index) {
  const tasks = loadTasks(taskFilePath);

  if (index >= 1 && index <= tasks.length) {
    const deletedTask = tasks.splice(index - 1, 1)[0];
    saveTasks(taskFilePath, tasks);
    console.log(`Deleted task #${index}`);
  } else {
    console.log(`Error: task with index #${index} does not exist. Nothing deleted.`);
  }
}

function markTaskAsDone(index) {
  const tasks = loadTasks(taskFilePath);

  if (index >= 1 && index <= tasks.length) {
    const completedTask = tasks.splice(index - 1, 1)[0];
    saveTasks(taskFilePath, tasks);
    appendTaskToFile(completedFilePath, completedTask);
    console.log('Marked item as done.');
  } else {
    console.log(`Error: no incomplete item with index #${index} exists.`);
  }
}
function reportTasks() {
  const pendingTasks = loadTasks(taskFilePath);
  const completedTasks = loadTasks(completedFilePath);

  console.log(`Pending : ${pendingTasks.length}`);
  pendingTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.text} [${task.priority}]`);
  });
  console.log();
  console.log(`Completed : ${completedTasks.length}`);
  completedTasks.forEach((task, index) => {
    console.log(`${index + 1}. ${task.text}`);
  });
}


function loadTasks(filePath) {
  try {
    const tasksData = fs.readFileSync(filePath, 'utf8');
    const taskStrings = tasksData.split('\n').filter(Boolean);
    return taskStrings.map((taskString) => {
      try {
        return JSON.parse(taskString);
      } catch (err) {
        console.error(`Error parsing task: ${taskString}`);
        return null;
      }
    }).filter(Boolean);
  } catch (err) {
    return [];
  }
}


function saveTasks(filePath, tasks) {
  fs.writeFileSync(filePath, tasks.map((task) => JSON.stringify(task)).join('\n'), 'utf8');
}

function appendTaskToFile(filePath, task) {
  fs.appendFileSync(filePath, `${JSON.stringify(task)}\n`);
}

// Command-line arguments
const command = process.argv[2];
const args = process.argv.slice(3);
let usage = `Usage :-
$ ./task add 2 hello world    # Add a new item with priority 2 and text "hello world" to the list
$ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order
$ ./task del INDEX            # Delete the incomplete item with the given index
$ ./task done INDEX           # Mark the incomplete item with the given index as complete
$ ./task help                 # Show usage
$ ./task report               # Statistics`;

switch (command) {
  case 'add':
    if (args.length === 2) {
      const [priority, text] = args;
      addTask(priority, text);
    } else {
      console.log('Error: Missing tasks string. Nothing added!');
    }
    break;
  case 'ls':
    listTasks();
    break;
  case 'del':
    if (args.length === 1) {
      const index = parseInt(args[0]);
      deleteTask(index);
    } else {
      console.log('Error: Missing NUMBER for deleting tasks.');
    }
    break;
  case 'done':
    if (args.length === 1) {
      const index = parseInt(args[0]);
      markTaskAsDone(index);
    } else {
      console.log('Error: Missing NUMBER for marking tasks as done.');
    }
    break;
  case 'report':
    reportTasks();
    break;
  default:
    // console.log(`Usage :-
    // $ ./task add 2 hello world    # Add a new item with priority 2 and text \"hello world\" to the list
    // $ ./task ls                   # Show incomplete priority list items sorted by priority in ascending order
    // $ ./task del INDEX            # Delete the incomplete item with the given index
    // $ ./task done INDEX           # Mark the incomplete item with the given index as complete
    // $ ./task help                 # Show usage
    // $ ./task report               # Statistics`);
    console.log(usage)
    break;
}
