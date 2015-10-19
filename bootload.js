/*
 * BootLoader 0.2.3
 * An HTML5 Hybrid Cordova/Phonegap App remote updater
 * http://github.com/lesion/remup
 * this library depends on cordova plugins File and FileTransfer
 *
 */

/*globals cordova, FileTransfer */
'use strict';

window.bootloader = (function (config) {

  var to_load = config.resources.length;

  // check if i'm on device
  // TOFIX: has to check for filetransfer dep
  function ready(){
    if(cordova_deps() || config.dev_mode)
      load_resources();
    else
      alert("Error loading BootLoader! is cordova-plugin-file and cordova-plugin-file-transfer installer?");
  }

  if(on_device())
    document.addEventListener('deviceready', ready, false);
  // not in cordova, do not wait for deviceready event to load resources
  else if (config.dev_mode)
    load_resources();



  function log(msg){
    if(config.debug)
    {
      msg = '[remup]' + (typeof msg === 'string') ? msg : JSON.stringify(msg);
      console.log(msg);
      request('POST','http://elementary.local:10000',msg);
    }
  }

  window.onerror = log;
  window.log = log;

  function on_device(){
    return ( document.URL.indexOf( 'http://' ) === -1 );
  }

  function cordova_deps(){
    return (typeof cordova !== 'undefined' &&   typeof cordova.file !== 'undefined' &&
        typeof FileTransfer !== 'undefined' );
  }

  function load_resources(){
    config.resources.forEach(load_resource);
  }

  function load_resource(resource){

    // load resource from config.dev_url in dev_mode
    // load resource from cordova fs the other case
    // in case of error, load the resource from bundle !!

    
    var base_path;

    if(config.dev_mode)
      base_path = config.dev_url;
    else
      base_path = cordova.file.documentsDirectory;

    load(base_path + resource)
      .then(success)
      .catch(function(e){
        log(e);
        log("Failed to load " + base_path + resource );
        load(resource)
          .then(success)
          .catch(function(){
            log("ERROR! Failed on both base_url for resource " + resource);
          });
      });

    function load(URI){
      return new Promise(function(resolve,reject){
        log("Trying to load " + URI);
        var extension = URI.split('.').pop(),
             isCss = (extension==='css'),
             element;
        element = document.createElement(isCss?'link':'script');
        element.setAttribute(isCss?'href':'src',URI);
        element.setAttribute(isCss?'rel':'type',isCss?'stylesheet':'text/javascript');
        element.onload=resolve;
        element.onerror=reject;
        document.getElementsByTagName('head')[0].appendChild(element);
      });
    }


    function success(){
      log("Succesfully loaded " + base_path + resource );
      if(!--to_load)
        config.oncomplete();
    }

  }

  function request(method, url,data) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url,true);
      xhr.onload = resolve;
      xhr.onerror = reject;
      xhr.send(data);
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

  return {
    update: update,
    restart: restart,
    check_update: check_update,
  };

})();

//remup.init();
//document.addEventListener("deviceready", remup.init, false);
//
