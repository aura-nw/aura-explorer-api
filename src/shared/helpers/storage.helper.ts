import {
  writeFile,
  unlink,
  createReadStream,
  ReadStream,
  readFileSync,
} from 'fs';
import { promisify } from 'util';
import { parse } from 'json2csv';

export class StorageHelper {
  static getFileStream = async (
    fileName: string,
    data: any,
    encoding,
  ): Promise<ReadStream> => {
    const csv = parse(data);
    await this.createFile(fileName, csv);
    return createReadStream(`${__dirname}/${fileName}`, encoding);
  };

  static getFileBuffer = async (
    fileName: string,
    data: any,
    encoding,
  ): Promise<Buffer> => {
    const csv = parse(data);
    await this.createFile(fileName, csv);
    return readFileSync(`${__dirname}/${fileName}`, encoding);
  };

  static createFile = async (fileName: string, data: string): Promise<void> => {
    const write = promisify(writeFile);

    return await write(`${__dirname}/${fileName}`, data, 'utf8');
  };

  /**
   * Delete file at the given path via a promise interface
   *
   * @param {string} fileName
   *
   * @returns {Promise<void>}
   */
  static deleteFile = async (fileName: string): Promise<void> => {
    const remove = promisify(unlink);

    return await remove(`${__dirname}/${fileName}`);
  };
}
