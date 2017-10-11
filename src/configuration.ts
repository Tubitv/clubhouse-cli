import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as yaml from 'js-yaml';
import * as inquirer from "inquirer";
import {Answers} from "inquirer";
import {DumpOptions} from "js-yaml";
import {isUndefined} from "util";

const cfgFile = path.resolve(os.homedir(), '.chcli', 'config');

export interface IConfiguration {
  token?: string;
  defaultProjectId?: number;
  loaded: boolean;
  errorMsg?: string;
}

function makeError(errorMsg: string): IConfiguration {
  return {
    loaded: false,
    defaultProjectId: -1,
    errorMsg,
  };
}

/**
 * Loads the configuration from the user's home directory
 * @return {IConfiguration} loaded will be set to true if this was a success
 */
export function loadConfiguration(): IConfiguration {
  if (fs.existsSync(cfgFile)) {
    try {
      const cfg = yaml.safeLoad(fs.readFileSync(cfgFile, 'utf8'))['clubhouse-cli'] as IConfiguration;
      if (isUndefined(cfg)) return makeError("Error loading configuration");
      return cfg;
    } catch (e) {
      return makeError(e.message);
    }
  } else {
    return makeError("Configuration file not found");
  }
}

function doFileSave(fileName: string, config: IConfiguration): void {
  try {
    const configYml = yaml.safeDump({"clubhouse-cli": config});
    const dir = path.dirname(cfgFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    fs.writeFileSync(fileName, configYml, {flag: 'w'});
  } catch (e) {
    console.error(e.message);
  }
}

export function saveConfiguration(config: IConfiguration): void {
  if (fs.existsSync(cfgFile)) {
    inquirer
      .prompt({
        name: 'overrideCfg',
        type: 'confirm',
        message: 'Config already exists, override:',
        default: true,
      }).then((answers: Answers) => {
        if (answers.overrideCfg) doFileSave(cfgFile, config);
      });
  } else {
    doFileSave(cfgFile, config);
  }
}
