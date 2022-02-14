import fs from "fs";
import path from "path";

export function getTestFileContent(filename: string): string {
    const filepath = path.join(__dirname, "test_files", filename);
    return fs.readFileSync(filepath).toString();
}