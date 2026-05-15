/**
 * Group input patterns into "tasks" — units of work tied to a base directory.
 * Mirrors upstream `managers/tasks.ts` with our flat pattern utils.
 */
import * as pattern from "./pattern.ts";
import type { Pattern, Settings } from "./settings.ts";

export interface Task {
  base: string;
  dynamic: boolean;
  patterns: Pattern[];
  positive: Pattern[];
  negative: Pattern[];
}

type PatternsGroup = Record<string, Pattern[]>;

export function generate(input: readonly Pattern[], settings: Settings): Task[] {
  const patterns = processPatterns([...input], settings);
  const ignore = processPatterns([...settings.ignore], settings);

  const positive = pattern.getPositivePatterns(patterns);
  const negative = getNegativePatternsAsPositive(patterns, ignore);

  const staticPatterns = positive.filter((p) => pattern.isStaticPattern(p, settings));
  const dynamicPatterns = positive.filter((p) => pattern.isDynamicPattern(p, settings));

  const staticTasks = convertPatternsToTasks(staticPatterns, negative, false);
  const dynamicTasks = convertPatternsToTasks(dynamicPatterns, negative, true);

  return staticTasks.concat(dynamicTasks);
}

function processPatterns(input: Pattern[], settings: Settings): Pattern[] {
  let patterns: Pattern[] = input;

  if (settings.braceExpansion) {
    patterns = pattern.expandPatternsWithBraceExpansion(patterns);
  }
  if (settings.baseNameMatch) {
    patterns = patterns.map((p) => (p.includes("/") ? p : `**/${p}`));
  }
  return patterns.map(pattern.removeDuplicateSlashes);
}

function getNegativePatternsAsPositive(
  patterns: Pattern[],
  ignore: Pattern[],
): Pattern[] {
  const negative = pattern.getNegativePatterns(patterns).concat(ignore);
  return negative.map(pattern.convertToPositivePattern);
}

function convertPatternsToTasks(
  positive: Pattern[],
  negative: Pattern[],
  dynamic: boolean,
): Task[] {
  const tasks: Task[] = [];

  const outsidePatterns = pattern.getPatternsOutsideCurrentDirectory(positive);
  const insidePatterns = pattern.getPatternsInsideCurrentDirectory(positive);

  const outsideGroup = groupPatternsByBaseDirectory(outsidePatterns);
  const insideGroup = groupPatternsByBaseDirectory(insidePatterns);

  tasks.push(...convertPatternGroupsToTasks(outsideGroup, negative, dynamic));

  if ("." in insideGroup) {
    tasks.push(convertPatternGroupToTask(".", insidePatterns, negative, dynamic));
  } else {
    tasks.push(...convertPatternGroupsToTasks(insideGroup, negative, dynamic));
  }

  return tasks;
}

function groupPatternsByBaseDirectory(patterns: Pattern[]): PatternsGroup {
  const group: PatternsGroup = {};
  for (const p of patterns) {
    let base = pattern.getBaseDirectory(p);
    base = pattern.removeBackslashes(base);
    if (base in group) group[base].push(p);
    else group[base] = [p];
  }
  return group;
}

function convertPatternGroupsToTasks(
  positive: PatternsGroup,
  negative: Pattern[],
  dynamic: boolean,
): Task[] {
  return Object.keys(positive).map((base) =>
    convertPatternGroupToTask(base, positive[base], negative, dynamic),
  );
}

function convertPatternGroupToTask(
  base: string,
  positive: Pattern[],
  negative: Pattern[],
  dynamic: boolean,
): Task {
  return {
    dynamic,
    positive,
    negative,
    base,
    patterns: ([] as Pattern[]).concat(
      positive,
      negative.map(pattern.convertToNegativePattern),
    ),
  };
}
