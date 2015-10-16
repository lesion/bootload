/*
 * RemUp 0.2.1
 * An HTML5 Hybrid Cordova/Phonegap App remote updater
 * http://github.com/lesion/remup
 * this library depends on cordova plugins File and FileTransfer
 *
 */

/*globals cordova, FileTransfer */
'use strict';

var remup = (function () {

    var config = {};

    /* load remup configuration */
    function init() {
        // read remup configuration from dataset attribute
        var tmp_scripts = document.getElementsByTagName('script');
        for (var i = tmp_scripts.length - 1; i >= 0; i--) {
            if (tmp_scripts[i].src.indexOf("remup.js") > -1) {
                config.main = tmp_scripts[i].dataset.main;
                config.continue = tmp_scripts[i].dataset.continue;
            }
        }
        // check if configuration is specified
        if (!config.main) {
            alert("Config error, have you added data-main to remup.js script?");
            return;
        }
        //check if cordova and cordova.file is defined
        if (typeof cordova === 'undefined' || typeof cordova.file === 'undefined' || typeof FileTransfer === 'undefined') {
            if (config.continue) {
                load(config.main);
                return;
            }
            alert("Remup depends on cordova, cordova File >= 1.2 and cordova FileTransfer plugin!");
            return;
        }

        try_to_load();
    }


    /* try to load in sequence:
     * 1. last release
     * 2. boundle release
     */
    function try_to_load() {

        // loading last saved release
        //	var last_release = cordova.file.dataDirectory + config.main.split('/').reverse()[0];
        var last_release = cordova.file.documentsDirectory + config.main.split('/').reverse()[0];

        console.log("LOADING LAST_RELEASE: " + last_release);
        load(last_release, function () {
            console.log("SUCCESS LOADING DOWNLOADED RELEASE!");
        }, function () {
            var boundle_release = config.main;
            console.log("FAILED! LOADING BOUNDLE: " + boundle_release);
            load(boundle_release);
        });

    }

    /* async check for updates */
    function check_update(current_release_name, manifest_uri, success_callback, error_callback) {
        //ajax call to check if library as to be updated
        var xhr = new XMLHttpRequest();
        console.log("Dentro check_release");
        xhr.open("GET", manifest_uri + '?' + Math.random(), true); // true mean async
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            if (xhr.status !== 200) {
                error_callback(xhr.status + ' ' + xhr.statusText);
                return;
            }
            var new_release_meta = {};
            new_release_meta = JSON.parse(xhr.responseText);
            new_release_meta.is_new = (new_release_meta.release !== current_release_name);
            success_callback(new_release_meta);
        };
        xhr.send(null); // null is the body of the GET
    }

    function update(release_meta, success_update, error_update) {
        // call me when there is a new release
        var ft = new FileTransfer();
        ft.download(release_meta.uri, "cdvfile://localhost/persistent/" + config.main,
            success_update, error_update);
    }

    function restart() {
        location.reload();
    }

    function load(scriptURI, success, error) {
        var script = document.createElement('script');
        script.setAttribute('type', 'text/javascript');
        script.setAttribute('src', scriptURI);
        console.log("TRYING TO LOAD: " + scriptURI);
        script.onload = success;
        script.onerror = error;
        document.getElementsByTagName('head')[0].appendChild(script);
    }

    return {
        init: init,
        update: update,
        restart: restart,
        check_update: check_update,
        load: load
    };

})();

//remup.init();
document.addEventListener("deviceready", remup.init, false);

module.exports = remup;

