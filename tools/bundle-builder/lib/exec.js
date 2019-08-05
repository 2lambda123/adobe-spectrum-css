/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const cp = require('child_process');

function handleExec(cb) {
  return function(err, stdout, stderr) {
    if (err) {
      return cb(err, stdout, stderr);
    }

    cb(null, stdout, stderr);
  }
}

function task(taskName, command) {
  // return a function
  var func = function(cb) {
    runCommand(command, cb);
  };

  Object.defineProperty(func, 'name', { value: taskName, writable: false });

  return func;
}

function runCommand(command, cb, options = {}) {
  // Execute immediately
  let commandProcess = cp.exec(command, handleExec(cb));
  if (options.pipe) {
    commandProcess.stdout.pipe(process.stdout);
    commandProcess.stderr.pipe(process.stderr);
  }
  return commandProcess;
}

exports.command = runCommand;
exports.task = task;
