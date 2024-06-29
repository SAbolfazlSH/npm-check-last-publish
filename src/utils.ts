import { exec } from "node:child_process";
import util from "node:util";
import fsPromises from "node:fs/promises";
import ora, { type Ora } from "ora";

const execPromise = util.promisify(exec);

const readPackageJson = async () => {
  const packageJSON: {
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  } = JSON.parse(
    await fsPromises.readFile("package.json", {
      encoding: "utf8",
    })
  );

  return packageJSON;
};

export const getAllDependencies = async () => {
  const packageJSON = await readPackageJson();

  const allDependencies = {
    ...packageJSON.dependencies,
    ...packageJSON.devDependencies,
  };

  return allDependencies;
};

export const getPackageVersion = async (packageName: string) => {
  const { stdout: packageVersionStdout } = await execPromise(
    `npm view ${packageName} version`
  );
  const packageVersion = packageVersionStdout.replace("\n", "");
  return packageVersion;
};

export const getPublishedTimes = async (packageName: string) => {
  const { stdout: publishedTimesStdout } = await execPromise(
    `npm view ${packageName} time --json`
  );
  const publishedTimes: Record<string, string> =
    JSON.parse(publishedTimesStdout);
  return publishedTimes;
};

export const getPackagePublishDate = async (packageName: string) => {
  const packageVersion = await getPackageVersion(packageName);
  const publishedTimes = await getPublishedTimes(packageName);
  const packagePublishDate = publishedTimes[packageVersion];
  return { packagePublishDate, packageVersion };
};

let oraSpinner: null | Ora = null;
export const loading = {
  start() {
    console.time();
    oraSpinner = ora("Loading...").start();
  },
  stop() {
    oraSpinner?.stop();
    oraSpinner?.clear();
    console.timeEnd();
  },
};