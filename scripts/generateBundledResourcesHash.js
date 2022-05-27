/*
 * This script generates a hash of all the React Native bundled assets and writes it into
 * into the APK. The hash in "updateCheck" requests to prevent downloading an identical
 * update to the one already present in the binary.
 *
 * It first creates a snapshot of the contents in the resource directory by creating
 * a map with the modified time of all the files in the directory. It then compares this
 * snapshot with the one saved earlier in "recordFilesBeforeBundleCommand.js" to figure
 * out which files were generated by the "react-native bundle" command. It then computes
 * the hash for each file to generate a manifest, and then computes a hash over the entire
 * manifest to generate the final hash, which is saved to the APK's assets directory.
 */

var crypto = require("crypto");
var fs = require("fs");
var path = require("path");

var getFilesInFolder = require("./getFilesInFolder");

var CODE_PUSH_FOLDER_PREFIX = "CodePush";
var CODE_PUSH_HASH_FILE_NAME = "CodePushHash";
var CODE_PUSH_HASH_OLD_FILE_NAME = "CodePushHash.json";
var HASH_ALGORITHM = "sha256";

var resourcesDir = process.argv[2];
var jsBundleFilePath = process.argv[3];
var assetsDir = process.argv[4];
var tempFileName = process.argv[5];

var oldFileToModifiedTimeMap = {};
var tempFileLocalPath = null;
if (tempFileName) {
  tempFileLocalPath = path.join(require("os").tmpdir(), tempFileName);
  oldFileToModifiedTimeMap = require(tempFileLocalPath);
}
var resourceFiles = [];

getFilesInFolder(resourcesDir, resourceFiles);

var newFileToModifiedTimeMap = {};

resourceFiles.forEach(function (resourceFile) {
  newFileToModifiedTimeMap[resourceFile.path.substring(resourcesDir.length)] =
    resourceFile.mtime;
});

var bundleGeneratedAssetFiles = [];

for (var newFilePath in newFileToModifiedTimeMap) {
  if (
    !oldFileToModifiedTimeMap[newFilePath] ||
    oldFileToModifiedTimeMap[newFilePath] <
      newFileToModifiedTimeMap[newFilePath].getTime()
  ) {
    bundleGeneratedAssetFiles.push(newFilePath);
  }
}

var manifest = [];

if (bundleGeneratedAssetFiles.length) {
  bundleGeneratedAssetFiles.forEach(function (assetFile) {
    // Generate hash for each asset file
    addFileToManifest(resourcesDir, assetFile, manifest, function () {
      if (manifest.length === bundleGeneratedAssetFiles.length) {
        addJsBundleAndMetaToManifest();
      }
    });
  });
} else {
  addJsBundleAndMetaToManifest();
}

function addJsBundleAndMetaToManifest() {
  addFileToManifest(
    path.dirname(jsBundleFilePath),
    path.basename(jsBundleFilePath),
    manifest,
    function () {
      var jsBundleMetaFilePath = jsBundleFilePath + ".meta";
      addFileToManifest(
        path.dirname(jsBundleMetaFilePath),
        path.basename(jsBundleMetaFilePath),
        manifest,
        function () {
          manifest = manifest.sort();
          var finalHash = crypto
            .createHash(HASH_ALGORITHM)
            .update(JSON.stringify(manifest))
            .digest("hex");

          console.log(finalHash);

          var savedResourcesManifestPath =
            assetsDir + "/" + CODE_PUSH_HASH_FILE_NAME;
          fs.writeFileSync(savedResourcesManifestPath, finalHash);

          // "CodePushHash.json" file name breaks flow type checking.
          // To fix the issue we need to delete "CodePushHash.json" file and
          // use "CodePushHash" file name instead to store the hash value.
          // Relates to https://github.com/microsoft/react-native-washington-push/issues/577
          var oldSavedResourcesManifestPath =
            assetsDir + "/" + CODE_PUSH_HASH_OLD_FILE_NAME;
          if (fs.existsSync(oldSavedResourcesManifestPath)) {
            fs.unlinkSync(oldSavedResourcesManifestPath);
          }
        }
      );
    }
  );
}

function addFileToManifest(folder, assetFile, manifest, done) {
  var fullFilePath = path.join(folder, assetFile);
  if (!fileExists(fullFilePath)) {
    done();
    return;
  }

  var readStream = fs.createReadStream(path.join(folder, assetFile));
  var hashStream = crypto.createHash(HASH_ALGORITHM);

  readStream
    .pipe(hashStream)
    .on("error", function (error) {
      throw error;
    })
    .on("finish", function () {
      hashStream.end();
      var buffer = hashStream.read();
      var fileHash = buffer.toString("hex");
      manifest.push(
        path.join(CODE_PUSH_FOLDER_PREFIX, assetFile).replace(/\\/g, "/") +
          ":" +
          fileHash
      );
      done();
    });
}

function fileExists(file) {
  try {
    return fs.statSync(file).isFile();
  } catch (e) {
    return false;
  }
}

if (tempFileLocalPath) {
  fs.unlinkSync(tempFileLocalPath);
}