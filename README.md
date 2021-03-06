# bootload
This little library will solve a small but annoying problem:
updating an hybrid html5 application without going throught Stores
neither manually update in Ad-Hoc / Enterprise situation.
Tired of recompiling every time the whole application?
Use your tool to concat/compile you application in minified file
and be ready to deploy it in just seconds!


# Use case
Let's say we have this HelloWorld v0.1 PhoneGap/Cordova app:

##### index.html
```html
<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="description" content="My application">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>My application</title>
</head>

<body>

	<script src="cordova.js"></script>
  <script src="myapp.js"></script>

</body>
</html>
```

##### myapp.js
```javascript
function main(){
    alert("HelloWorld v0.1");
}

document.addEventListener("deviceready", main, false);
```

We want now to deploy a new fantastic feature which will alert twice the user at startup,
so our main function will be:

##### myapp_0.2.js
```javascript
function main(){
    alert("HelloWorld v0.2");
    alert("Yes! this is the new release");
}
```

To be able to update the release of all users without pain, we should use bootload.


# Install / Configuration
Get the library with bower:
```
 bower install bootload --save
```
or just the bootload.js from [here](https://raw.githubusercontent.com/lesion/bootload/master/bootload.js).

Prepare a little json file to put online where bootload will check the upcoming releases.

#### bootload.json
```json
{
	"release": "v0.2",
	"uri": "http://localhost:8000/myapp_0.2.js"
}
```

As you can see there are only two fields!

Then include the library in your html removing your original script as follow:

##### index.html
```html
<!doctype html>
<html>
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="description" content="My application">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>My application</title>
</head>

<body>

    <button onclick="check_update();"></button>

	<script src="cordova.js"></script>
    <script src="bootload.js" data-main="myapp.js"></script>

</body>
</html>
```

and change your myapp.js:
##### myapp.js
``` javascript
var app_version = '0.1';

function check_update() {
    // check if remote release match with current one
    // and call a callback according
    bootload.check_update(app_version, 'http://localhost:8000/bootload.json',
        success_update, error_update);
}

// release_data obj here is something:
// { "release": "remote_release_name", "uri': "http://newjsurl", is_new: true }
function success_update(release_data) {
    // could ask user if want to update...
    if (release_data.is_new) {
        // update the app, at next reload the new myapp.0.2.js will be loaded !
        bootload.update(release_data, bootload.restart,
            function (e) {
                alert("Error download the new release" + e);
            });
    } else
        alert("Current release is the latest one! => " + app_version);
}

function error_update(e) {
    alert("Error checking for a new release" + e);
}


function main() {
    alert("HelloWorld 0.1");
}

main();
```

At first run or in case of error, bootload will load the myapp.js from the
App bundle.

After a successfull update (pressing the button in the code above), bootload will
load the latest release of your app.
