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
'use strict';

var remup = (function() {

	/* check if current release is the same as deployed one */
	function check_release(current,manifestURI){
		//ajax call to check if library as to be updated

	}


	function load(callback){
		var main = document.createElement('script');
		main.setAttribute('type','text/javascript');
		main.setAttribute('src', scriptURI);
		main.onload = function(){ console.log("LOADING OK => " + scriptURI); callback();}
	}

	return { check_release: check_release }

})();
