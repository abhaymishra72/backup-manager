const fs = require("fs");
const yaml = require("js-yaml");

function convertYamlToJsObject(filePath) {
  try {
    const fileContents = fs.readFileSync(filePath, "utf8");
    return yaml.load(fileContents);
  } catch (error) {
    console.error("Error reading or parsing YAML file:", error.message);
    return null;
  }
}
