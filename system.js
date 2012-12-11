
const PATH = require("path");
const FS = require("fs");
const SM = require("sm");
const PM = SM.for(__dirname);


exports.main = function(callback) {

	var uri = false;
	if (process.platform === "darwin") {
		uri = "node-webkit-bin-" + process.platform + "/node-webkit.app/Contents/MacOS/node-webkit";
	} else {
		return callback(new Error("Platform `" + process.platform + "` not supported!"));
	}

	PM.resolve(uri, function(err, binPath) {
		if (err) return callback(err);

		console.log("\nLaunch examples:\n");

		FS.readdir(PATH.join(__dirname, "examples"), function(err, examples) {
			if (err) return callback(err);

			examples.forEach(function(example) {
				console.log(" ", binPath, PATH.join(__dirname, "examples", example));
			});

			FS.readdir(PATH.join(__dirname, "node_modules/node-webkit-src/tests"), function(err, tests) {
				if (err) return callback(err);

				tests.forEach(function(test) {
					if (PATH.existsSync(PATH.join(__dirname, "node_modules/node-webkit-src/tests", test, "package.json"))) {
						console.log(" ", binPath, PATH.join(__dirname, "node_modules/node-webkit-src/tests", test));
					}
				});

				console.log("");

				return callback(null);
			});
		});
	});
}


if (require.main === module) {
	exports.main(function(err) {
		if (err) {
			console.error(err.stack);
			process.exit(1);
		}
		process.exit(0);
	})
}
