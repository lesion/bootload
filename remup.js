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


var remup = (function () {

	window.onerror = function (e) {
		alert(e);
	};
	var config = {};

	/* load remup configuration */
	function init() {
		console.log("DENTRO INIT!");
		// TODO, can do it searching for remup.js in src attr
		var config_value = document.getElementById('remup').innerHTML;
		console.log("SON Quo o no?!");
		console.log(config_value);
		// TODO try/catch and explain error!
		config = JSON.parse(config_value);
		console.log(config.manifestURI);
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

	/* check if current release is the same as deployed one */
	function check_release(cb) {
		//ajax call to check if library as to be updated
		var xhr = new XMLHttpRequest();
		console.log("Dentro check_release" + config);
		console.log(config.manifestURI);
		xhr.open("GET", config.manifestURI + '?' + Math.random(), true);
		xhr.onreadystatechange = function () {
			if (xhr.readyState !== 4) return;
			alert(xhr.responseText.trim());

			var new_release_meta = JSON.parse(xhr.responseText);

			if (new_release_meta.release !== config.release) {
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

document.addEventListener("deviceready", remup.init, false);
