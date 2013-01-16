
const SM = require("sm");
const PM = SM.for(__dirname);


exports.getBinPath = function(platform, callback) {
	var uri = false;
	if (process.platform === "darwin") {
		uri = "node-webkit-bin-" + process.platform + "/node-webkit.app/Contents/MacOS/node-webkit";
	} else {
		return callback(new Error("Platform `" + process.platform + "` not supported!"));
	}
	PM.resolve(uri, function(err, binPath) {
		if (err) return callback(err);
		return callback(null, binPath);
	}).fail(callback);
}

exports.main = function(callback) {
	// Install platform specific dependencies.
	return exports.getBinPath(process.platform, callback);
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
