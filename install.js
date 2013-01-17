
const PATH = require("path");
const FS = require("fs-extra");
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

	function installPlatformSpecificDependencies(callback) {
		return exports.getBinPath(process.platform, function(err, binPath) {
			if (err) return callback(err);

			var binAliasPath = PATH.join(__dirname, "bin");
			if (!PATH.existsSync(binAliasPath)) {
				FS.mkdirSync(binAliasPath);
			}

			binAliasPath = PATH.join(binAliasPath, "nw");

			// @issue https://github.com/rogerwang/node-webkit/issues/357
			//if (PATH.existsSync(binAliasPath)) {
				// TODO: Only unlink if link target is different.
			//	FS.unlinkSync(binAliasPath);
			//}
			//FS.symlinkSync(binPath, binAliasPath);
			// WORKAROUND: Create wrapper script instead of symlink.
			FS.writeFileSync(binAliasPath, [
				"#!/bin/bash",
				"BASE_PATH=$(dirname $0)",
				"$BASE_PATH/.." + binPath.substring(__dirname.length) + " $@"
			].join("\n"));
			FS.chmodSync(binAliasPath, 0755);
			return callback(null);
		});
	}

	function linkMappingsForExamples(callback) {
		// TODO: Refactor this into sm helpers lib.
		try {
			FS.readdirSync(PATH.join(__dirname, "examples")).forEach(function(example) {
				var path = PATH.join(__dirname, "examples", example, "package.json");
				var descriptor = JSON.parse(FS.readFileSync(path));
				if (descriptor && descriptor.mappings && descriptor.mappings["app-node-webkit"]) {
					path = PATH.join(__dirname, "examples", example, "node_modules");
					if (!FS.existsSync(path)) FS.mkdirSync(path);
					path = PATH.join(__dirname, "examples", example, "node_modules", "app-node-webkit");
					if (!FS.existsSync(path)) FS.symlinkSync("../../..", path);
				}
			});
			return callback(null);
		} catch(err) {
			return callback(err);
		}
	}

	return installPlatformSpecificDependencies(function(err) {
		if (err) return callback(err);

		return linkMappingsForExamples(callback);
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
