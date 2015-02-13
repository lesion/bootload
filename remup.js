/*
 * RemUp 0.1
 * An HTML5 Hybrid Cordova/Phonegap App remote updater
 * http://github.com/lesion/remup
 * this library depends on cordova plugins File and FileTransfer
 *
 * # states
 * 1- check if there is a new release reading a json manifest file
 * 2- if there's a problem retrieving the new release load the last one
 * 3- if there's a problem loading the latest, load the boundle one!
 *
 */

/*globals cordova*/
'use strict';

var remup = (function () {

  var config = {};

  /* load remup configuration */
  function init() {
    // check if this is the first time running
    config.app_release = localStorage.getItem('remup.app_release') || 'remup.init';
    alert(cordova);
    alert(cordova.file.dataDirectory);
    //if (config.app_release === 'remup.init')



      console.log("Inside init");
    load('remup_config.js', conf_loaded, conf_error);
  }

  function conf_loaded() {
    console.log("CONF LOADED");

    // loading last saved release
    var last_release = cordova.file.dataDirectory + config.main.split('/').reverse()[0];
    console.log("LOADING LAST_RELEASE: " + last_release);
    load(last_release, function () {
      console.log("SUCCESS");
    }, function () {
      var boundle_release = config.main;
      console.log("FAILED! LOADING BOUNDLE: " + boundle_release);
      load(boundle_release);
    });




  }

  function conf_error() {
    console.log("remup_config.js file not found! Please read http://github.com/lesion/remup/ ");
    throw new Error("remup_config.js file not found! Please read http://github.com/lesion/remup/ ");
  }

  /* check if current release is the same as deployed one */
  function check_release(current, manifestURI) {
    //ajax call to check if library as to be updated
    var xhr = new XMLHttpRequest();
    xhr.open("GET", manifestURI, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;

    };
    xhr.send();
  }

  function update() {

  }



  function load(scriptURI, success, error) {
    var script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', scriptURI);
    script.onload = success;
    script.onerror = error;
    document.getElementsByTagName('head')[0].appendChild(script);
  }

  return {
    init: init,
    config: config,
    check_release: check_release,
    update: update,
    load: load
  };

})();
//remup.init();
document.addEventListener("deviceready", remup.init, false);
