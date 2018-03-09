var $, applications, applicationsFolder, cacheFile, closeWindow, createText, exec, execFile, fs, input, oldApps, parseApplications, readAppName, remote, removeText, runApplication, spawn;

fs = require('fs');

$ = require('jQuery');

remote = require('electron').remote;

spawn = require('child_process').spawn;

exec = require('child_process').exec;

execFile = require('child_process').execFile;

applicationsFolder = '/usr/share/applications/';

cacheFile = './cachefile';

applications = [];

oldApps = [];

parseApplications = function() {
  var cacheData, cacheDataJson, dateNow;
  cacheData = fs.readFileSync(cacheFile, 'utf8');
  cacheData = JSON.parse(cacheData);
  dateNow = Date.now() / 1000 | 0;
  if (cacheData.expirations === void 0 || cacheData.expirations < dateNow) {
    fs.readdirSync(applicationsFolder).forEach(function(file) {
      var applicationsData, contents, found, re;
      contents = fs.readFileSync(applicationsFolder + file, 'utf8');
      re = /Name=(.*)/;
      found = contents.match(re);
      if (found && found[1].length) {
        applicationsData = {};
        applicationsData.name = found[1];
        re = /Exec=(.*)/;
        found = contents.match(re);
        if (found && found[1].length) {
          applicationsData.exec = found[1];
        }
        console.log(applicationsData);
        return applications.push(applicationsData);
      }
    });
    cacheData = {
      'expirations': dateNow + 360,
      'applications': applications
    };
    cacheDataJson = JSON.stringify(cacheData);
    return fs.writeFileSync(cacheFile, cacheDataJson);
  } else {
    return applications = cacheData.applications;
  }
};

readAppName = function(name) {
  var counter;
  oldApps = [];
  counter = 0;
  return applications.forEach(function(application) {
    if (application.name.toLowerCase().indexOf(name.toLowerCase()) !== -1 && counter < 5) {
      createText(++counter + '. ' + application.name);
      return oldApps.push(application);
    }
  });
};

createText = function(text) {
  var container, div;
  container = $('.container');
  div = document.createElement('div');
  div.textContent = text;
  div.className = 'text';
  return container.append(div);
};

removeText = function() {
  return $('.text').remove();
};

closeWindow = function() {
  var window;
  window = remote.getCurrentWindow();
  return window.close();
};

runApplication = function(application) {
  var ps;
  ps = spawn('wmctrl', ['-v', '-a', application.name]);
  ps.stdout.on('data', function(data) {
    return console.log('stdout: ' + data);
  });
  return ps.on('close', function(code) {
    var execApplication, execArray;
    if (code === 1) {
      execArray = application.exec.split('%');
      execApplication = exec(execArray[0]);
      execApplication.stdout.on('data', function(data) {
        return console.log('stdout: ' + data);
      });
      return execApplication.on('close', function() {
        return closeWindow();
      });
    } else {
      return closeWindow();
    }
  });
};

input = document.getElementById('appName');

input.addEventListener('keyup', function(event) {
  if ($.isNumeric(event.key)) {
    input.value = event.target.value.slice(0, -1);
    if (event.key > 0 && event.key < 6 && oldApps.length >= event.key) {
      return runApplication(oldApps[event.key - 1]);
    }
  } else if (event.key === 'Enter') {
    return runApplication(oldApps[0]);
  } else {
    removeText();
    return readAppName(event.target.value);
  }
});

input.focus();

parseApplications();
