import {info, getInput, setFailed, setOutput} from "@actions/core"
import { Octokit } from "@octokit/action";
import { restEndpointMethods } from "@octokit/plugin-rest-endpoint-methods";
import { downloadRelease } from "@terascope/fetch-github-release";
import {RestEndpointMethodTypes} from "@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types";
import * as cache from "@actions/cache"
import * as path from "path"
import * as fse from "fs-extra"
import fetch from "node-fetch"

const ACTION_NAME = "Setup PHPStan";
const ACTION_VERSION = "1";
const ACTION_OUT_PREFIX = `[${ACTION_NAME}]`;

const GITHUB_REPO_OWNER = "pmmp";
const GITHUB_REPO = "PocketMine-MP";
const GITHUB_RELEASE_ASSET_NAME = "PocketMine-MP.phar";

/**
 * Find a PHPStan release given a version.
 *
 * @param gitHubApi
 * @param target
 */
async function findVersion(gitHubApi: Octokit, target: string): Promise<RestEndpointMethodTypes["repos"]["getLatestRelease"]["response"]["data"]> {
	if (target.match(/^\d+\.\d+\.\d+/)) {
		const response = await gitHubApi.rest.repos.getReleaseByTag({
			owner: GITHUB_REPO_OWNER,
			repo: GITHUB_REPO,
			tag: target
		});

		if(response.status !== 200) {
			throw new Error(`Could not find a ${GITHUB_REPO_OWNER}/${GITHUB_REPO} release with tag '${target}'`);
		}

		return response.data;
	}

	if(target.toLowerCase() === "latest") {
		const response = await gitHubApi.rest.repos.getLatestRelease({
			owner: GITHUB_REPO_OWNER,
			repo: GITHUB_REPO
		});

		if(response.status !== 200) {
			throw new Error(`Could not find latest ${GITHUB_REPO_OWNER}/${GITHUB_REPO} release`);
		}

		return response.data;
	}

	throw new Error("Invalid version target " + target);
}

type ReleaseAsset = RestEndpointMethodTypes["repos"]["getLatestRelease"]["response"]["data"]["assets"] extends (infer U)[] ? U : never;

/**
 * Find a single asset from a release given a file name.
 *
 * @param assets
 * @param file
 */
function findAsset(assets: RestEndpointMethodTypes["repos"]["getLatestRelease"]["response"]["data"]["assets"], file: string) : ReleaseAsset {
	const found = assets.find((asset, index) => {
		return asset.name === file;
	});

	if(found === undefined) {
		throw new Error(`Could not find ${file} asset in release`);
	}

	return found;
}

/**
 * Download or restore a cached phpstan.phar executable.
 *
 * @param releaseId
 * @param asset
 * @param restorePath
 */
async function install(releaseId: number, asset: ReleaseAsset, restorePath: string, cacheKey: string) : Promise<string> {
	const hitKey = await cache.restoreCache([restorePath], cacheKey);

	if (hitKey === undefined) {
		await downloadRelease(GITHUB_REPO_OWNER, GITHUB_REPO, restorePath, (release) : boolean => {
			return release.id === releaseId;
		}, (releaseAsset) : boolean => {
			return releaseAsset.id === asset.id;
		}, false, false);

		await cache.saveCache([restorePath], cacheKey);
		info(`${ACTION_OUT_PREFIX} Downloaded ${GITHUB_RELEASE_ASSET_NAME} to ${restorePath}`);
	} else {
		info(`${ACTION_OUT_PREFIX} Using cached ${GITHUB_RELEASE_ASSET_NAME}, restored to ${restorePath}`);
	}

	return restorePath;
}

/**
 * Download PMMP phar to the given path, taking care of caching.
 */
export async function run(): Promise<void> {
	const RestOctokit = Octokit.plugin(restEndpointMethods);
	const gitHubApi = new RestOctokit();

	const release = await findVersion(gitHubApi, getInput("version"));
	const asset = findAsset(release.assets, GITHUB_RELEASE_ASSET_NAME);
	info(`${ACTION_OUT_PREFIX} Using target version ${release.tag_name} released @ ${release.published_at}`);

	const restorePath = path.resolve(getInput("install-path"));
	const cacheKey = `setup-pmmp-phpstan-env-v${ACTION_VERSION}-${release.tag_name}-${asset.id}-${restorePath.replace(/\//g, "-")}-${GITHUB_RELEASE_ASSET_NAME}`;

	await fse.mkdir(restorePath);
	let pmmpPhar = await install(release.id, asset, restorePath, cacheKey) + GITHUB_RELEASE_ASSET_NAME;

	setOutput("pmmp-phar", pmmpPhar);

	await installDefaultConfigs(restorePath);
}

/**
 * Copy default PHPStan configs into the workspace.
 */
async function installDefaultConfigs(installPath: string) : Promise<void> {
	const sourcePath = path.join(__dirname, "../config");
	const configInstallPath = path.join(installPath, "phpstan");

	info(`${ACTION_OUT_PREFIX} Installing default PHP-Stan configs to ${configInstallPath}`);

	await fse.mkdir(configInstallPath);
	await fse.copy(sourcePath, configInstallPath);

	const pmmpEnumRuleUrl = "https://github.com/pmmp/PocketMine-MP/blob/5d9f78303726a6ba58cdda8231976f57a54a73c4/tests/phpstan/rules/DisallowEnumComparisonRule.php";
	const body = await fetch(pmmpEnumRuleUrl)
		.then((x) => x.arrayBuffer())
		.catch((err) => {
			setFailed(`Failed to download PMMP phpstan rule from ${pmmpEnumRuleUrl}`);
			return undefined;
		});

	if (body === undefined) return;

	const ruleFileName = path.join(configInstallPath, "rules", "DisallowEnumComparisonRule.php");
	await fse.writeFile(ruleFileName, body);
}

;(async () => {
	await run();
})().catch(setFailed);
