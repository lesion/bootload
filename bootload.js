/*
 * BootLoad 0.2.5
 * An HTML5 Hybrid Cordova/Phonegap App remote updater
 * http://github.com/lesion/bootload
 * this library depends on cordova plugins File and FileTransfer
 */

/* globals cordova, FileTransfer */

/*! promise-polyfill 2.1.0 */
// !function(a){function b(a,b){return function(){a.apply(b,arguments)}}function c(a){if("object"!=typeof this)throw new TypeError("Promises must be constructed via new");if("function"!=typeof a)throw new TypeError("not a function");this._state=null,this._value=null,this._deferreds=[],i(a,b(e,this),b(f,this))}function d(a){var b=this;return null===this._state?void this._deferreds.push(a):void j(function(){var c=b._state?a.onFulfilled:a.onRejected;if(null===c)return void(b._state?a.resolve:a.reject)(b._value);var d;try{d=c(b._value)}catch(e){return void a.reject(e)}a.resolve(d)})}function e(a){try{if(a===this)throw new TypeError("A promise cannot be resolved with itself.");if(a&&("object"==typeof a||"function"==typeof a)){var c=a.then;if("function"==typeof c)return void i(b(c,a),b(e,this),b(f,this))}this._state=!0,this._value=a,g.call(this)}catch(d){f.call(this,d)}}function f(a){this._state=!1,this._value=a,g.call(this)}function g(){for(var a=0,b=this._deferreds.length;b>a;a++)d.call(this,this._deferreds[a]);this._deferreds=null}function h(a,b,c,d){this.onFulfilled="function"==typeof a?a:null,this.onRejected="function"==typeof b?b:null,this.resolve=c,this.reject=d}function i(a,b,c){var d=!1;try{a(function(a){d||(d=!0,b(a))},function(a){d||(d=!0,c(a))})}catch(e){if(d)return;d=!0,c(e)}}var j="function"==typeof setImmediate&&setImmediate||function(a){setTimeout(a,1)},k=Array.isArray||function(a){return"[object Array]"===Object.prototype.toString.call(a)};c.prototype["catch"]=function(a){return this.then(null,a)},c.prototype.then=function(a,b){var e=this;return new c(function(c,f){d.call(e,new h(a,b,c,f))})},c.all=function(){var a=Array.prototype.slice.call(1===arguments.length&&k(arguments[0])?arguments[0]:arguments);return new c(function(b,c){function d(f,g){try{if(g&&("object"==typeof g||"function"==typeof g)){var h=g.then;if("function"==typeof h)return void h.call(g,function(a){d(f,a)},c)}a[f]=g,0===--e&&b(a)}catch(i){c(i)}}if(0===a.length)return b([]);for(var e=a.length,f=0;f<a.length;f++)d(f,a[f])})},c.resolve=function(a){return a&&"object"==typeof a&&a.constructor===c?a:new c(function(b){b(a)})},c.reject=function(a){return new c(function(b,c){c(a)})},c.race=function(a){return new c(function(b,c){for(var d=0,e=a.length;e>d;d++)a[d].then(b,c)})},c._setImmediateFn=function(a){j=a},"undefined"!=typeof module&&module.exports?module.exports=c:a.Promise||(a.Promise=c)}(this);

/*
bootload.boot({
  release: '2.0.0',
  resources: ['css/vendor.css','css/app.css','js/vendor.js','js/templates.js','js/app.js'],
  dev_mode: false,
  debug_url: "http://dev-machine-hostname.local:10000",
  dev_url: "http://dev-machine-hostname.local:8000",
  update_url: "https://deploy-machine-hostname/",
  oncomplete: require('js/app').init });
*/

(function(root) {

  var self = {},
    config, //store configuration
    release, //store current release
    to_load,
    log;

  /**
   * usefull generic logger factory (it POST remotely logs to config.debug_url)
   * @param  {string} name logger name
   * @return {function}      logger
   * @example
   * 		var log = logger('myModule');
   * 		log('my log');
   *    // this will produce "[myModule] my log" in console.log and remotely
   */
  self.logger = function logger(name) {
    return function(msg) {
      var message = '';
      if (config.dev_mode) {
        message = (typeof msg === 'string') ? msg : JSON.stringify(msg);
        console.log("[" + name + "] " + message);
        message = "[\x1b[32m" + name + '\x1b[0m] ' + message;
        request('POST', config.debug_url, message);
      }
    };
  };


  // generic request xhr method with promises
  function request(method, url, data) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.onload = function() {
        if (xhr.status === 200) {
          resolve(xhr.response);
        } else {
          reject(Error(xhr.statusText));
        }
      };
      xhr.onerror = reject;
      xhr.send(data);
    });
  }

  /**
   * boot method / this is the first method you have to call
   * @param  {Object} conf bootload configuration
   */
  self.boot = function(conf) {

    config = conf;
    to_load = config.resources.length;
    release = localStorage.getItem('release') || config.release;

    if (config.dev_mode) {
      root.onerror = self.logger('GLOBAL');
    }
    log = self.logger('bootload');
    root.logger = self.logger;
    window.onerror = alert;
    function ready() {
      // check if deps are satisfied
      if (cordova_deps())
        load_resources();
      else
        alert("Error loading BootLoad! is cordova-plugin-file and cordova-plugin-file-transfer installer?");
    }

    // on device, wait for cordova deviceready
    if (on_device()) document.addEventListener('deviceready', ready, false);

    // not in cordova, do not wait for deviceready to load resources
    else if (config.dev_mode) load_resources();
  };


  function on_device() {
    return (document.URL.indexOf('http://') === -1);
  }

  function cordova_deps() {
    return (typeof cordova !== 'undefined' &&
      typeof cordova.file !== 'undefined' &&
      typeof FileTransfer !== 'undefined');
  }

  function load_resources() {
    log("Start to load resources  \n\t" + config.resources.join(" \n\t"));
    config.resources.forEach(load_resource);
  }

  function load_resource(resource) {

    // load resource from config.dev_url in dev_mode
    // load resource from cordova fs the other case
    // in case of error, load the resource from bundle !!
    var base_path;

    if (config.dev_mode)
      base_path = config.dev_url;
    else
      base_path = cordova.file.documentsDirectory;
    log(base_path);
    log(config.dev_mode);
    load(base_path + resource)
      .then(success, function() {
        log("Failed toload " + base_path + resource);
        load(resource)
          .then(success, function() {
            log("ERROR! Failed on both base_url for resource " + resource);
          });
      });

    function load(URI) {
      return new Promise(function(resolve, reject) {
        var extension = URI.split('.').pop(),
          isCss = (extension === 'css'),
          element;
        element = document.createElement(isCss ? 'link' : 'script');
        element.async = true;
        element.onload = resolve;
        element.onerror = reject;
        element.setAttribute(isCss ? 'href' : 'src', URI);
        element.setAttribute(isCss ? 'rel' : 'type', isCss ? 'stylesheet' : 'text/javascript');
        document.getElementsByTagName('head')[0].appendChild(element);
      });
    }


    function success() {
      // log("Succesfully loaded " + base_path + resource);
      if (--to_load) return;
      log("LOAD COMPLETED !!! RUNNING APP! ");
      try {
        config.oncomplete();
      } catch (e) {
        log(e.stack);
      }
    }
  }

  self.update = function update() {
    var download_promises = config.resources.map(download);
    return Promise.all(download_promises).then(function(){
      log("All DOWNLOADED!!!");
      self.check_update().then(function(new_release_meta){
        config.release = new_release_meta.release;
        localStorage.setItem('release',config.release);
      });
    });
  };

  /* async check for updates */
  self.check_update = function check_update() {
    return request('GET', config.update_url)
      .then(function(data) {
        var new_release_meta = JSON.parse(data);
        log(new_release_meta.release + ' ' + release);
        if (new_release_meta.release !== release)
          return new_release_meta;
        else {
          throw new Error('no update, same release');
        }
      });
  };

  function download(resource) {
    return new Promise(function(resolve, reject) {
      var ft = new FileTransfer();
      log("Downloading " + config.dev_url + resource);
      ft.download(config.dev_url + resource + '?' + Date.now(), "cdvfile://localhost/persistent/" + resource,
        resolve, reject);
    });
  }

  self.restart = function restart() {
    location.reload();
  };

  root.bootload = self;

})(this);
