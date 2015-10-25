/*
 * BootLoad 0.2.3
 * An HTML5 Hybrid Cordova/Phonegap App remote updater
 * http://github.com/lesion/remup
 * this library depends on cordova plugins File and FileTransfer
 *
 */

/*globals cordova, FileTransfer */
'use strict';

window.bootload = (function (){

  var self = {},
    config,
    release,
    to_load,
    log,
    logger = window.logger = function logger(name){
    return function(msg){
      var message = "[\x1b[32m" + name + '\x1b[0m] ';
      if(config.debug)
      {
        message +=  (typeof msg === 'string') ? msg : JSON.stringify(msg);
        console.log(message);
        request('POST',config.debug_url,message);
      }
    };
  };

  log = logger('bootload');

  self.boot = function(conf){

    config = conf;
    to_load = config.resources.length;
    release = localStorage.getItem('release') || config.release;

    if(config.debug)
      window.onerror = window.logger('GLOBAL');

    // check if i'm on device
    function ready(){
      if(cordova_deps() || config.dev_mode)
        load_resources();
      else
        alert("Error loading BootLoad! is cordova-plugin-file and cordova-plugin-file-transfer installer?");
    }

    if(on_device())
      document.addEventListener('deviceready', ready, false);
    // not in cordova, do not wait for deviceready event to load resources
    else if (config.dev_mode)
      load_resources();
  };



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
    else // FIXME i'm removing it now (19 oct, first release) because loading from fs is not ready!
      base_path = '';//cordova.file.documentsDirectory;

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
      if(--to_load) return;

      config.oncomplete();
      //self.check_update().then(function(data){
        //log(data.resources);
        //data.resources.forEach(function(resource){
          //download(resource).then(log).catch(log);
        //});
      //}).catch(log);
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
  self.check_update = function check_update() {
    return new Promise(function(resolve,reject){

      var update_url = config.dev_url + 'bootload.json';

      //ajax call to check if library as to be updated
      var xhr = new XMLHttpRequest();
      xhr.open("GET", update_url + '?' + Math.random(), true); // true mean async
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status !== 200) {
          reject(xhr.status + ' ' + xhr.statusText);
          return;
        }
        var new_release_meta = {};
        new_release_meta = JSON.parse(xhr.responseText);
        log(new_release_meta.release  + ' ' + release);
        if(new_release_meta.release !== release) 
          resolve(new_release_meta);
        else
          reject('No update, same release');
      };
      xhr.send(null); // null is the body of the GET
    });
  };

  function download(resource) {
    return new Promise(function(resolve,reject){
      var ft = new FileTransfer();
      log("Downloading " + config.dev_url + resource );
      ft.download(config.dev_url + resource, "cdvfile://localhost/persistent/" + resource,
          resolve, reject);
    });
  }

  self.restart = function restart() {
    location.reload();
  };

  return self;

})();
