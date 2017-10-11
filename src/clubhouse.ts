import got = require("got");
import {IConfiguration} from "./configuration";
import {isNullOrUndefined} from "util";
import {pick} from "lodash";

const API_BASE_URL = "https://api.clubhouse.io/api/v2";

export interface IStats {
  num_points_done: number;
  num_stories_unstarted: number;
  last_story_update?: Date;
  num_points_started: number;
  num_points_unstarted: number;
  num_stories_started: number;
  num_stories_unestimated: number;
  num_points: number;
  num_stories_done: number;
}

export interface IEpic {
  entity_type: string;
  id: number;
  external_id?: any;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  deadline?: any;
  state: string;
  position: number;
  started: boolean;
  started_at?: Date;
  started_at_override?: any;
  completed: boolean;
  completed_at?: Date;
  completed_at_override?: any;
  archived: boolean;
  labels: any[];
  milestone_id?: any;
  follower_ids: string[];
  owner_ids: string[];
  project_ids: number[];
  comments: any[];
  stats: IStats;
}

export interface IProject {
  entity_type: string;
  id: number;
  external_id?: any;
  name: string;
  description: string;
  abbreviation: string;
  color: string;
  iteration_length: number;
  show_thermometer: boolean;
  days_to_thermometer: number;
  start_time: Date;
  created_at: Date;
  updated_at: Date;
  archived: boolean;
  follower_ids: any[];
  team_id: number;
  stats: IStats;
}

export interface IMemberProfile {
  deactivated: boolean;
  display_icon: any;
  email_address: string;
  gravatar_hash: string;
  mention_name: string;
  name: string;
  two_factor_auth_activated: boolean;
}

/**
 * A user in Clubhouse
 */
export interface IMember {
  created_at: Date;
  disabled: boolean;
  id: string;
  profile: IMemberProfile;
  role: string;
  updated_at: Date;
}

/**
 * The equivalent of a ticket in clubhouse
 */
export interface IStory {
  blocker?: boolean;
  branches?: any[];
  comments?: Comment[];
  commits?: any[];
  completed?: boolean;
  completed_at?: Date;
  completed_at_override?: Date;
  created_at?: Date;
  deadline?: Date;
  description?: string;
  entity_type?: string;
  epic_id?: number;
  estimate?: number;
  external_id?: string;
  files?: File[];
  follower_ids?: string[];
  id?: number;
  labels?: any[];
  linked_files?: any[];
  moved_at?: Date;
  name: string;
  owner_ids?: string[];
  position?: number;
  project_id: number;
  requested_by_id?: string;
  started?: boolean;
  started_at?: Date;
  started_at_override?: Date;
  story_links?: any[];
  story_type?: string;
  tasks?: any[];
  updated_at?: Date;
  workflow_state_id?: number;
}

/**
 * Just a root object to hold everything we cache at startup
 */
export interface IClubhouseState {
  projects?: IProject[];
  epics?: IEpic[];
  users?: IMember[];
  configuration?: IConfiguration;
  loaded: boolean;
}

export function getProjects(token: string): Promise<IProject[]> {
  return got(`${API_BASE_URL}/projects`, {json: true, query: {token}})
    .then(response => response.body as IProject[])
    .then(projects => projects.filter(project => !project.archived));
}

export function getEpics(token: string): Promise<IEpic[]> {
  return got(`${API_BASE_URL}/epics`, {json: true, query: {token}})
    .then(response => response.body as IEpic[])
    .then(epics => epics.filter(epic => !epic.archived));
}

export function getUsers(token: string): Promise<IMember[]> {
  return got(`${API_BASE_URL}/members`, {json: true, query: {token}})
    .then(response => response.body as IMember[]);
}

export function createStory(token: string, story: IStory): Promise<IStory> {
  const client = require('clubhouse-lib').create(token);
  const reqObj: IStory = pick(story, ['name', 'description', 'story_type', 'epic_id', 'project_id']);

  if (!isNullOrUndefined(story.owner_ids)) {
    reqObj.owner_ids = Array.isArray(story.owner_ids) ? story.owner_ids : [story.owner_ids];
  }
  return client.createStory(reqObj);
}

export function getState(cfg: IConfiguration): Promise<IClubhouseState> {
  const token = cfg.token;
  return Promise
    .all([getProjects(token), getEpics(token), getUsers(token)])
    .then(data => ({
      projects: data[0],
      epics: data[1],
      users: data[2],
      configuration: cfg,
      loaded: true,
    } as IClubhouseState));
}
