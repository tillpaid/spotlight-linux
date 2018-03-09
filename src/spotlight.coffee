fs = require('fs')
$ = require('jQuery')
remote = require('electron').remote
spawn = require('child_process').spawn
exec = require('child_process').exec
execFile = require('child_process').execFile

applicationsFolder = '/usr/share/applications/'
cacheFile = './cachefile'
applications = []
oldApps = []

parseApplications = ->
    cacheData = fs.readFileSync cacheFile, 'utf8'
    cacheData = JSON.parse cacheData
    dateNow = Date.now() / 1000 | 0

    if cacheData.expirations == undefined || cacheData.expirations < dateNow
        fs.readdirSync(applicationsFolder).forEach (file) ->
            contents = fs.readFileSync applicationsFolder + file, 'utf8'

            re = /Name=(.*)/
            found = contents.match re

            if found && found[1].length
                applicationsData = {}
                applicationsData.name = found[1]

                re = /Exec=(.*)/
                found = contents.match re

                if found && found[1].length
                    applicationsData.exec = found[1]

                console.log applicationsData
                applications.push applicationsData

        cacheData = {
            'expirations': dateNow + 360
            'applications': applications
        }

        cacheDataJson = JSON.stringify cacheData
        fs.writeFileSync cacheFile, cacheDataJson
    else
        applications = cacheData.applications

readAppName = (name) ->
    oldApps = []
    counter = 0

    applications.forEach (application) ->
        if application.name.toLowerCase().indexOf(name.toLowerCase()) != -1 && counter < 5
            createText(++counter + '. ' + application.name)
            oldApps.push application

createText = (text) ->
    container = $('.container')
    div = document.createElement 'div'
    div.textContent = text
    div.className = 'text'
    container.append div

removeText = ->
    $('.text').remove()

closeWindow = ->
    window = remote.getCurrentWindow()
    window.close()

runApplication = (application) ->
    ps = spawn 'wmctrl', ['-v', '-a', application.name]

    ps.stdout.on 'data', (data) ->
        console.log 'stdout: ' + data

    ps.on 'close', (code) ->
        if code == 1
            execArray = application.exec.split '%'
            execApplication = exec execArray[0]

            execApplication.stdout.on 'data', (data) ->
                console.log 'stdout: ' + data

            execApplication.on 'close', ->
                closeWindow()
        else
            closeWindow()

input = document.getElementById 'appName'
input.addEventListener 'keyup', (event) ->
    if $.isNumeric(event.key)
        input.value = event.target.value.slice 0, -1

        if event.key > 0 && event.key < 6 && oldApps.length >= event.key
            runApplication oldApps[event.key - 1]

    else if event.key == 'Enter'
        runApplication oldApps[0]
    else
        removeText()
        readAppName event.target.value

input.focus()
parseApplications()
