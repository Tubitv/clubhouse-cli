import inquirer = require("inquirer");
import {Answers, ChoiceType, Question} from "inquirer";
import {isNullOrUndefined} from "util";
import {IConfiguration, saveConfiguration} from "./configuration";
import {getProjects, IClubhouseState, IProject} from "./clubhouse";
import ChoiceOption = inquirer.objects.ChoiceOption;
import * as Chalk from "chalk";
import {sys} from "typescript";


function makeProjectChoices(projects: IProject[]): ChoiceOption[] {
  return projects
    .map(project => (
      {
        name: project.name,
        value: project.id.toString(),
        short: `\n${project.description}\n`,
      } as ChoiceOption));
}

export function doInstall(currentCfg: IConfiguration, chCfg: IClubhouseState): Promise<IConfiguration> {
  const questions: Question[] = [
    {
      type: "input",
      name: "token",
      message: "API Token (https://app.clubhouse.io/tubi/settings/account/api-tokens): ",
      default: currentCfg.token || process.env.CLUBHOUSE_API_TOKEN,
      validate: (input: string, answers?: Answers) => {
        if (isNullOrUndefined(input) || input.length != 36) return "Token must be 36 characters long";
        return true;
      },
    },
    {
      type: "list",
      name: "defaultProject",
      message: "Do you want to set a project as a default? ",
      choices: (answers: Answers) => {
        return getProjects(answers.token)
          .then(projects => makeProjectChoices(projects)
            .concat([{name: "No Default", value: "-1"}]))
          .catch(ex => {
            console.error(Chalk.red("Unable to get list of projects. Are you sure the API key is correct?"));
            console.error(Chalk.bold("Error is: ") + ex.message);
            sys.exit(-1);
          });
      },
      default: currentCfg.defaultProjectId,
    },
  ] as Question[];

  return inquirer
    .prompt(questions)
    .then((answers: Answers) => {
      const cfg = {
        token: answers.token,
        defaultProjectId: answers.defaultProject,
        loaded: true,
      } as IConfiguration;

      saveConfiguration(cfg);

      return cfg;
    })
    .catch((err: any) => {
      console.error(err);
      return { loaded: false } as IConfiguration;
    });
}
