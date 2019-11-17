import arg from 'arg';   // To parse our cli arguments
import inquirer from 'inquirer';
import { cliProject } from './main';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
		{
			'--git': Boolean,
			'--yes': Boolean,
			'--install': Boolean,
			'-g': '--git',
			'-y': '--yes',
			'-i': '--install',
		},
		{
			argv: rawArgs.slice(2),
		}
	);
	return {
		skipPrompts: args['--yes'] || false,
		git: args['--git'] || false,
		template: args._[0],
		runInstall: args['--install'] || false,

	};
}

async function promptForMissingOptions(options) {
    try {
      const defaultTemplate = 'JavaScript';
      if (options.skipPrompts) {
          return {
              ...options,
              template: options.template || defaultTemplate,
          };
      }

      const questions = [];
      if (!options.template) {
          questions.push({
              type: 'list',
              name: 'template',
              message: 'Please choose which project template to use',
              choices: ['JavaScript', 'TypeScript'],
              default: defaultTemplate,
          });
      }

      if (!options.git) {
          questions.push({
              type: 'confirm',
              name: 'git',
              message: 'Initialize a git repository?',
              default: false,
          })
      }

      const answers = await inquirer.prompt(questions);
      return {
          ...options,
          template: options.template || answers.template,
          git: options.git || answers.git,
      };
    } catch (err) {
      console.log(err);
    }
}

export async function cli(args) {
  try {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  await cliProject(options);
  } catch(err) {
    console.log(err);
  }
  //console.log(options);
}
