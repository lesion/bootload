'use strict';
var app_version = '0.1';

function check_update() {
    console.log("dentro check upload");
    // check if remote release match with current one and call a callback according
    remup.check_update(app_version, 'http://192.168.1.28:8000/remup.json', success_update, error_update);
}

// release_data obj here is something:
// { "release": "remote_release_name", "uri': "http://newjsurl", is_new: true }
function success_update(release_data) {
    // could ask user if want to update...
    if (release_data.is_new) {
        // update the app, at next reload the new myapp.0.2.js will be loaded !
        remup.update(release_data, remup.restart,
            function (e) {
                alert("Error download the new release" + e);
            });
    } else
        alert("Current release is the latest one! => " + app_version);
}

function error_update(e) {
    alert("Error checking for a new release: ");
    console.log("ERROR: " + e);
}


function main() {
    alert("HelloWorld 0.1");
}

main();
