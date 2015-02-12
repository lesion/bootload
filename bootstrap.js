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


	function set_release(release){
		this.release=release;
	}

	return { set_release: set_release }

})();


window.remup  = {

	set_release: function(release){
		this.release = release;
	},


	/*
	 * check if current release is the same as deployed one
	 */
	check_release:function () {

	};


	app_bootstrap.update_release = function () {

	};


	app_bootstrap.load = function (scriptURI,callback) {
		var main = document.createElement('script');
		main.setAttribute('type','text/javascript');
		main.setAttribute('src', scriptURI);
		main.onload = function(){ console.log("LOADING OK => " + scriptURI); callback();}
	};
};
