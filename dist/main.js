"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core_1 = require("@actions/core");
const action_1 = require("@octokit/action");
const plugin_rest_endpoint_methods_1 = require("@octokit/plugin-rest-endpoint-methods");
const fetch_github_release_1 = require("@terascope/fetch-github-release");
const cache = require("@actions/cache");
const path = require("path");
const fse = require("fs-extra");
const ACTION_NAME = "Setup PMMP PHPStan Environment";
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
async function findVersion(gitHubApi, target) {
    if (target.match(/^\d+\.\d+\.\d+/)) {
        const response = await gitHubApi.rest.repos.getReleaseByTag({
            owner: GITHUB_REPO_OWNER,
            repo: GITHUB_REPO,
            tag: target
        });
        if (response.status !== 200) {
            throw new Error(`Could not find a ${GITHUB_REPO_OWNER}/${GITHUB_REPO} release with tag '${target}'`);
        }
        return response.data;
    }
    if (target.toLowerCase() === "latest") {
        const response = await gitHubApi.rest.repos.getLatestRelease({
            owner: GITHUB_REPO_OWNER,
            repo: GITHUB_REPO
        });
        if (response.status !== 200) {
            throw new Error(`Could not find latest ${GITHUB_REPO_OWNER}/${GITHUB_REPO} release`);
        }
        return response.data;
    }
    throw new Error("Invalid version target " + target);
}
/**
 * Find a single asset from a release given a file name.
 *
 * @param assets
 * @param file
 */
function findAsset(assets, file) {
    const found = assets.find((asset, index) => {
        return asset.name === file;
    });
    if (found === undefined) {
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
async function install(releaseId, asset, restorePath, cacheKey) {
    const hitKey = await cache.restoreCache([restorePath], cacheKey);
    if (hitKey === undefined) {
        await (0, fetch_github_release_1.downloadRelease)(GITHUB_REPO_OWNER, GITHUB_REPO, restorePath, (release) => {
            return release.id === releaseId;
        }, (releaseAsset) => {
            return releaseAsset.id === asset.id;
        }, false, false);
        await cache.saveCache([restorePath], cacheKey);
        (0, core_1.info)(`${ACTION_OUT_PREFIX} Downloaded ${GITHUB_RELEASE_ASSET_NAME} to ${restorePath}`);
    }
    else {
        (0, core_1.info)(`${ACTION_OUT_PREFIX} Using cached ${GITHUB_RELEASE_ASSET_NAME}, restored to ${restorePath}`);
    }
    return restorePath;
}
/**
 * Download PMMP phar to the given path, taking care of caching.
 */
async function run() {
    const RestOctokit = action_1.Octokit.plugin(plugin_rest_endpoint_methods_1.restEndpointMethods);
    const gitHubApi = new RestOctokit();
    const release = await findVersion(gitHubApi, (0, core_1.getInput)("pmmp-version"));
    const asset = findAsset(release.assets, GITHUB_RELEASE_ASSET_NAME);
    (0, core_1.info)(`${ACTION_OUT_PREFIX} Using target version ${release.tag_name} released @ ${release.published_at}`);
    const restorePath = path.resolve((0, core_1.getInput)("install-path"));
    const cacheKey = `setup-pmmp-phpstan-env-action-v${ACTION_VERSION}-${release.tag_name}-${asset.id}-${restorePath.replace(/\//g, "-")}-${GITHUB_RELEASE_ASSET_NAME}`;
    await fse.mkdir(restorePath);
    let pmmpPhar = await install(release.id, asset, restorePath, cacheKey) + GITHUB_RELEASE_ASSET_NAME;
    (0, core_1.setOutput)("pmmp-phar", pmmpPhar);
    await installDefaultConfigs(restorePath);
}
exports.run = run;
/**
 * Copy default PHPStan configs into the workspace.
 */
async function installDefaultConfigs(installPath) {
    const sourcePath = path.join(__dirname, "../config");
    const configInstallPath = path.join(installPath, "phpstan");
    (0, core_1.info)(`${ACTION_OUT_PREFIX} Installing default PHPStan configs to ${configInstallPath}`);
    await fse.mkdir(configInstallPath);
    await fse.copy(sourcePath, configInstallPath);
}
;
(async () => {
    await run();
})().catch(core_1.setFailed);
