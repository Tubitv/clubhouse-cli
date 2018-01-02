import inquirer = require("inquirer");
import {Answers, Question} from "inquirer";
import {isNullOrUndefined} from "util";
import {IConfiguration, saveConfiguration} from "./configuration";
import {getState, IClubhouseState, makeProjectChoices} from "./clubhouse";
import * as Chalk from "chalk";
import {sys} from "typescript";

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
        return getState({token: answers.token} as IConfiguration)
          .then(state => makeProjectChoices(state.projects, state.teams)
            .concat([{name: "No Default", value: "-1"}]))
          .catch(ex => {
            console.error(Chalk.red("Unable to get list of projects and teams. Are you sure the API key is correct?"));
            console.error(Chalk.bold("Error is: ") + ex.message);
            sys.exit(-1);
          });
      },
      default: currentCfg.defaultProjectId || "-1",
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
