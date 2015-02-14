# Remup
This little library will solve a small but annoying problem:
updating an hybrid html5 application without going throught Stores
neither manually update in Ad-Hoc / Enterprise situation.
Tired of recompiling every time to whole application? Use your tool to concat/compile
you application in minified file and be ready to deploy it in just seconds!

# How it works
Let's say we have this PhoneGap/Cordova app:

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

</body>
</html>
```
