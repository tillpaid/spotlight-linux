// Generated by CoffeeScript 2.2.2
(function() {
  var $, applications, applicationsFolder, cacheFile, closeWindow, createText, exec, execFile, fs, input, oldApps, parseApplications, readAppName, remote, removeText, runApplication, spawn;

  fs = require('fs');

  $ = require('jQuery');

  remote = require('electron').remote;

  spawn = require('child_process').spawn;

  exec = require('child_process').exec;

  execFile = require('child_process').execFile;

  applicationsFolder = '/usr/share/applications/';

  cacheFile = '/home/alexandr/www/spotlight-linux/cachefile';

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
    $('appName').val('');
    // window.close()
    return window.minimize();
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
        return closeWindow();
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
        runApplication(oldApps[event.key - 1]);
        return input.value = '';
      }
    } else if (event.key === 'Enter') {
      runApplication(oldApps[0]);
      return input.value = '';
    } else {
      removeText();
      return readAppName(event.target.value);
    }
  });

  input.focus();

  parseApplications();

}).call(this);
