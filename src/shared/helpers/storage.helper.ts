import { writeFile, unlink, readFileSync } from 'fs';
import { promisify } from 'util';
import { parse } from 'json2csv';

export class StorageHelper {
  /**
   * Get file buffer
   *
   * @param fileName
   * @param data
   * @param fields
   * @param encoding
   *
   * @returns {Promise<Buffer>}
   */
  static getFileBuffer = async (
    fileName: string,
    data,
    fields,
    encoding,
  ): Promise<Buffer> => {
    data = data.length > 0 ? data : {};
    const csv = parse(data, { fields, includeEmptyRows: true });
    await this.createFile(fileName, csv);
    const path = `${__dirname}/${fileName}`;
    return readFileSync(path, encoding);
  };

  static createFile = async (fileName: string, data: string): Promise<void> => {
    const write = promisify(writeFile);
    const path = `${__dirname}/${fileName}`;
    return await write(path, data, 'utf8');
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
    const path = `${__dirname}/${fileName}`;
    return await remove(path);
  };
}
