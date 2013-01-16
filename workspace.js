
const PATH = require("path");
const FS = require("fs");
const INSTALL = require("./install");


exports.main = function(callback) {

	console.log("\nLaunch examples:\n");

	FS.readdir(PATH.join(__dirname, "examples"), function(err, examples) {
		if (err) return callback(err);

		examples.forEach(function(example) {

			var descriptor = JSON.parse(FS.readFileSync(PATH.join("examples", example, "package.json")));
			if (descriptor && descriptor.scripts && descriptor.scripts.run) {
				console.log(" ", "sm run --dir", PATH.join("./examples", example));
			} else {
				console.log(" ", "nw", PATH.join("examples", example));
			}
		});

		FS.readdir(PATH.join(__dirname, "node_modules/node-webkit-src/tests"), function(err, tests) {
			if (err) return callback(err);

			tests.forEach(function(test) {
				if (PATH.existsSync(PATH.join(__dirname, "node_modules/node-webkit-src/tests", test, "package.json"))) {
					console.log(" ", "nw", PATH.join("node_modules/node-webkit-src/tests", test));
				}
			});

			console.log("");

			return callback(null);
		});
	});
}


if (require.main === module) {
	exports.main(function(err) {
		if (err) {
			console.error(err.stack);
			return process.exit(1);
		}
		return process.exit(0);
	});
}
