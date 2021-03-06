
const PATH = require("path");
const FS = require("fs-extra");
const EXEC = require("child_process").exec;
const PINF = require("pinf").for(module);


exports.getBinPath = function(platform, callback) {
	var uri = false;
	if (process.platform === "darwin") {
		uri = "node-webkit-bin-" + process.platform + "/Contents/MacOS/node-webkit";
	} else {
		return callback(new Error("Platform `" + process.platform + "` not supported!"));
	}
	return PINF.resolve(uri, function(err, binPath) {
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
				'# Find the dirname path to the fully resolved command.',
				'# @credit http://stackoverflow.com/a/246128/330439',
				'SOURCE="${BASH_SOURCE[0]}"',
				'while [ -h "$SOURCE" ]; do # resolve $SOURCE until the file is no longer a symlink',
				'  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"',
				'  LAST_SOURCE=$SOURCE',
				'  SOURCE="$(readlink "$SOURCE")"',
				'  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE" # if $SOURCE was a relative symlink, we need to resolve it relative to the path where the symlink file was located',
				'done',
				'BASE_PATH="$( cd -P "$( dirname "$SOURCE" )" && pwd )"',
				"$BASE_PATH/.." + binPath.substring(__dirname.length) + " $@"
			].join("\n"));
			FS.chmodSync(binAliasPath, 0755);
			return callback(null);
		});
	}

	function linkMappingsForExamples(callback) {
		// TODO: Refactor this into sm helpers lib.
		try {
			if (!PATH.existsSync(PATH.join(__dirname, "examples"))) {
				return callback(null);
			}
			FS.readdirSync(PATH.join(__dirname, "examples")).forEach(function(example) {
				var path = PATH.join(__dirname, "examples", example, "package.json");
				var descriptor = JSON.parse(FS.readFileSync(path));
				// TODO: Run `sm install --dir examples/*` with flag to indicate that `app-node-webkit` should be linked.
				if (descriptor && descriptor.mappings && descriptor.mappings["app-node-webkit"]) {
					path = PATH.join(__dirname, "examples", example, "node_modules");
					if (!FS.existsSync(path)) FS.mkdirSync(path);
					path = PATH.join(__dirname, "examples", example, "node_modules", "app-node-webkit");
					if (!FS.existsSync(path)) FS.symlinkSync("../../..", path);
					path = PATH.join(__dirname, "examples", example, ".sm", "bin", "nw");
					if (!FS.existsSync(path)) {
						if (!FS.existsSync(PATH.dirname(path))) FS.mkdirsSync(PATH.dirname(path));
						FS.symlinkSync(PATH.join("../..", "node_modules", "app-node-webkit", "bin", "nw"), path);
					}
				}
			});
			return callback(null);
		} catch(err) {
			return callback(err);
		}
	}

	function installDevcomp(callback) {
		// TODO: Refactor this into sm helpers lib.
		try {
			if (!PATH.existsSync(PATH.join(__dirname, "devcomp"))) {
				return callback(null);
			}

			// TODO: Use spawn and log progress via helper.
			EXEC("sm install", {
				cwd: PATH.join(__dirname, "devcomp")
			}, function(error, stdout, stderr) {
				// TODO: See why `sm *` writes `\[0m` to stderr.
			    if (error || (stderr && !(stderr.length === 4 && stderr.charAt(1) === "["))) {
			    	TERM.stderr.writenl("\0red(" + stderr + "\0)");
			        return callback(new Error("Error running os command: " + command));
			    }
			    return callback(null);
			});

		} catch(err) {
			return callback(err);
		}		
	}

	return installPlatformSpecificDependencies(function(err) {
		if (err) return callback(err);

		return linkMappingsForExamples(function(err) {
			if (err) return callback(err);

			//return installDevcomp(callback);

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
