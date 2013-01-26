
const PATH = require("path");
const FS = require("fs");


exports.main = function(options) {

	var API = options.API;
	var $ = API.$;
	var document = API.document;


	$(document).ready(function(){

		function append(html) {
			$("body").append(html);
		}

		append("<h3>Launch examples:</h3>");

		var examples = FS.readdirSync(PATH.join(__dirname, "../examples"));

		examples.forEach(function(example) {
			var descriptor = JSON.parse(FS.readFileSync(PATH.join(__dirname, "../examples", example, "package.json")));
			if (descriptor && descriptor.scripts && descriptor.scripts.run) {
				append("<pre>sm run --dir " + PATH.join("./examples", example) + "</pre>");
			} else {
				append("<pre>nw " + PATH.join("examples", example) + "</pre>");
			}
		});

		var tests = FS.readdirSync(PATH.join(__dirname, "../node_modules/node-webkit-src/tests"));

		tests.forEach(function(test) {
			if (FS.existsSync(PATH.join(__dirname, "../node_modules/node-webkit-src/tests", test, "package.json"))) {
				append("<pre>nw " +PATH.join("node_modules/node-webkit-src/tests", test) + "</pre>");
			}
		});
	});
}
