/*:
 * @plugindesc Tracks time spent editing or testing in RPG Maker MV using WakaTime.
 * @author Eileen
 * @help
 * This plugin sends WakaTime heartbeats when you test or save the game.
 */

(function() {
  const { spawn, spawnSync } = require("child_process");
  const path = require("path");

  // 👇 Use your absolute path to wakatime-cli
  const wakatimeCli = "C:\\Users\\Eileen\\.wakatime\\wakatime-cli-windows-amd64.exe";

  // 👇 Test the CLI works inside RPG Maker
  const test = spawnSync(wakatimeCli, ["--version"]);
  console.log("WakaTime test output:", test.stdout ? test.stdout.toString() : "", test.stderr ? test.stderr.toString() : "");

  function sendHeartbeat(entity, category = "coding") {
    console.log("Sending WakaTime heartbeat:", entity);
    const args = [
      "--entity", entity,
      "--entity-type", "app",
      "--plugin", "rpgmaker-mv/1.0.0",
      "--category", category,
      "--write"
    ];

    const child = spawn(wakatimeCli, args);
    child.on("error", (err) => console.error("WakaTime error:", err.message));
    child.stdout.on("data", (data) => console.log(data.toString()));
    child.stderr.on("data", (data) => console.error(data.toString()));
  }

  // Send heartbeat when game is saved
  const _DataManager_saveGameWithoutRescue = DataManager.saveGameWithoutRescue;
  DataManager.saveGameWithoutRescue = function(savefileId) {
    const result = _DataManager_saveGameWithoutRescue.call(this, savefileId);
    sendHeartbeat(`Save${savefileId}.rvdata2`);
    return result;
  };

  // Send heartbeat when playtest starts
  const _SceneManager_run = SceneManager.run;
  SceneManager.run = function(sceneClass) {
    sendHeartbeat("Playtest Started", "building");
    _SceneManager_run.call(this, sceneClass);
  };
})();
