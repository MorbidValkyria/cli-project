// ESM syntax is supported.
import { promisify } from 'util';
import { projectInstall } from 'pkg-install';

const chalk = require('chalk');
const fs = require('fs');
const ncp = require('ncp');
const path = require('path');
const execa = require('execa');
const Listr = require('listr');
const access = promisify(fs.access);
const copy = promisify(ncp);



async function copyTemplateFiles(options) {
	return copy(options.templateDirectory, options.targetDirectory, {
		clobber: false,
	});
}

async function initGit(options) {
	const result = await execa('git', ['init'], {
 		cwd: options.targetDirectory,
    });
 	if (result.failed) {
		return Promise.reject(new Error('Failed to initialize git'));
	}
	return;
}

export async function cliProject(options) {
	options = {
		...options,
		targetDirectory: options.targetDirectory || process.cwd(),
	};

	const currentFileUrl = import.meta.url;
	const templateDir = path.resolve(
		new URL(currentFileUrl).pathname,
		'../../templates',
		options.template.toLowerCase()
	);
	options.templateDirectory = templateDir;

	try {
		await access(templateDir, fs.constants.R_OK);
	} catch(err) {
		console.error('%s Invalid template name', chalk.red.bold('ERROR'));
		process.exit(1);
	}

	const tasks = new Listr([
	  {
	    title: 'Copy project files',
	    task: () => copyTemplateFiles(options),
	  },
	  {
	    title: 'Initialize git',
	    task: () => initGit(options),
	    enabled: () => options.git,
	  },
	  {
	    title: 'Install dependencies',
	    task: () =>
	      projectInstall({
	        cwd: options.targetDirectory,
	      }),
	   skip: () =>
	      !options.runInstall
	        ? 'Pass --install to automatically install dependencies'
	        : undefined,
	  },
	]);


	await tasks.run();

	console.log('%s Project ready', chalk.green.bold('DONE'));
	return true;
}

