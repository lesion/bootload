/*
 * RemUp 0.1
 * An HTML5 Hybrid Cordova/Phonegap App remote updater
 * http://github.com/lesion/remup
 * this library depends on cordova plugins File and FileTransfer
 *
 */

/*globals cordova, FileTransfer */
'use strict';

var remup = (function () {

    window.onerror = function (e) {
        alert(e);
    };

    var config = {};

    /* load remup configuration */
    function init() {
        // TODO, can do it searching for remup.js in src attr
        var tmp_scripts = document.getElementsByTagName('script');
        for (var i = tmp_scripts.length - 1; i >= 0; i--) {
            if (tmp_scripts[i].src.indexOf("remup.js") > -1) {
                console.log(tmp_scripts[i].dataset);
                config.main = tmp_scripts[i].dataset.main;
                config.manifestURI = tmp_scripts[i].dataset.manifest;
            }
        }
        // check if configuration is specified
        if (!config.main || !config.manifestURI) {
            alert("Config error, have you added data-main and data-manifest to remup.js script?");
            return;
        }
        if (typeof cordova === 'undefined') {
            alert("Remup depends on cordova and cordova file >= 1.2 plugin!");
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
        //		var last_release = cordova.file.dataDirectory + config.main.split('/').reverse()[0];
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

    /* async check if current release is the same as deployed one */
    function check_release(current_release_name, callback) {
        //ajax call to check if library as to be updated
        var xhr = new XMLHttpRequest();
        console.log("Dentro check_release" + config);
        console.log(config.manifestURI);
        xhr.open("GET", config.manifestURI + '?' + Math.random(), true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;
            alert(xhr.responseText.trim());

            var new_release_meta = JSON.parse(xhr.responseText);

            if (new_release_meta.release !== current_release_name) {
                cb(new_release_meta);
            }
        };
        xhr.send();
    }

    function update(release_meta) {
        alert("UPDATE FROM: " + release_meta.uri);
        // call me when there is a new release
        var ft = new FileTransfer();
        ft.download(release_meta.uri, "cdvfile://localhost/persistent/" + config.main,
            function (e) {

                alert(e.toURL());
                location.reload();
            },
            function (e) {
                alert(e.http_status);
                console.log(e);
                alert(e.code);

            });

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
        check_release: check_release,
        load: load
    };

})();

remup.init();
document.addEventListener("deviceready", remup.init, false);
