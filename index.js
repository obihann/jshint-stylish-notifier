(function() {
	'use strict';
	var chalk = require('chalk');
	var table = require('text-table');
	var logSymbols = require('log-symbols');
	var stringLength = require('string-length');
	var plur = require('plur');
	var beeper = require('beeper');
	var notifier = require('node-notifier');
	var path = require('path');

	module.exports = {
		toString: function () {
			return __filename;
		},
		reporter: function (result, config, options) {
			var total = result.length;
			var ret = '';
			var headers = [];
			var prevfile;
			var errorCount = 0;
			var warningCount = 0;

			options = options || {};

			ret += table(result.map(function (el, i) {
				var err = el.error;
				// E: Error, W: Warning, I: Info
				var isError = err.code && err.code[0] === 'E';

				var line = [
					'',
					chalk.gray('line ' + err.line),
					chalk.gray('col ' + err.character),
					isError ? chalk.red(err.reason) : chalk.blue(err.reason)
				];

				if (el.file !== prevfile) {
					headers[i] = el.file;
				}

				if (options.verbose) {
					line.push(chalk.gray('(' + err.code + ')'));
				}

				if (isError) {
					errorCount++;
				} else {
					warningCount++;
				}

				prevfile = el.file;

				return line;
			}), {
				stringLength: stringLength
			}).split('\n').map(function (el, i) {
				return headers[i] ? '\n' + chalk.underline(headers[i]) + '\n' + el : el;
			}).join('\n') + '\n\n';

			if (total > 0) {
				if (errorCount > 0) {
					ret += '  ' + logSymbols.error + '  ' + errorCount + ' ' + plur('error', errorCount) + (warningCount > 0 ? '\n' : '');
				}

				ret += '  ' + logSymbols.warning + '  ' + warningCount + ' ' + plur('warning', total);

				if (options.beep) {
					beeper();
				}

				var title = "Build Pass";
				var message = "JSHint build completed Successfully";
				var icon = path.join(__dirname, 'pass.png');

				if (errorCount > 0 && warningCount > 0) {
					title = "Build Failure";
					message = 'JSHint build failed with ' + errorCount + ' errors and ' + warningCount + ' warnings';
					icon = path.join(__dirname, 'fail.png');
				} else if (errorCount > 0) {
					title = "Build Failure";
					message = 'JSHint failed with ' + errorCount + ' errors';
					icon = path.join(__dirname, 'fail.png');
				} else if (warningCount > 0) {
					title = "Build Completed";
					message = 'JSHint completed with ' + warningCount + ' warnings';
					icon = path.join(__dirname, 'warning.png');
				}

				notifier.notify({
					title:        title,
					message:      message,
					icon:		  path.join(__dirname, 'gulp.png'),
					contentImage: icon,
				});
			} else {
				ret += '  ' + logSymbols.success + ' No problems';
				ret = '\n' + ret.trim();
			}

			console.log(ret + '\n');
		}
	};
}());
