import path from "path";
import fs from "fs";

export default function logDirectoryTree(dir: string, prefix: string = "") {
  fs.readdirSync(dir).forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.lstatSync(filePath);
    if (stats.isDirectory()) {
      console.log(prefix + "📁 " + file);
      logDirectoryTree(filePath, prefix + "  ");
    } else {
      console.log(prefix + "📄 " + file);
    }
  });
}
