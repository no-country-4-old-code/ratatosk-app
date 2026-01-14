// eslint-disable-next-line @typescript-eslint/no-var-requires
const fsPromises = require('fs').promises;

// api for mocking during tests
export const FileApi = {
    writeFile: (path: string, buf: any) => fsPromises.writeFile(path, buf),
    readFile: (path: string) => fsPromises.readFile(path),
    deleteFile: (path: string) => fsPromises.unlink(path)
};