'use strict';
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

export default {
  dmkdir(dir = '') {
    const parent = path.dirname(dir);
    if (!fs.existsSync(parent)) {
      this.dmkdir(parent);
    }
    return fs.mkdirSync(dir);
  },
  zip(files = [], target = '', options = {}) {
    return new Promise((resolve, reject) => {
      options = Object.assign({
        zlib: { level: 9 } // Sets the compression level.
      }, options);
      const dir = path.dirname(target);
      const exists = fs.existsSync(dir);
      if (!exists) {
        this.dmkdir(dir);
      }

      const output = fs.createWriteStream(target);
      const archive = archiver('zip', options);

      // listen for all archive data to be written
      // 'close' event is fired only when a file descriptor is involved
      output.on('close', () => {
        resolve(target);
        // console.log(archive.pointer() + ' total bytes');
      });

      // This event is fired when the data source is drained no matter what was the data source.
      // It is not part of this library but rather from the NodeJS Stream API.
      // @see: https://nodejs.org/api/stream.html#stream_event_end
      // output.on('end', function() {
      // });

      // good practice to catch warnings (ie stat failures and other non-blocking errors)
      archive.on('warning', err => {
        if (err.code === 'ENOENT') {
          // log warning
        } else {
          reject(err);
        }
      });

      // good practice to catch this error explicitly
      archive.on('error', err => {
        reject(err);
      });

      // pipe archive data to the file
      archive.pipe(output);
      files.forEach(node => {
        if (node instanceof Object) {
          if (node.type == 'string') {
            archive.append(node.text, {
              name: node.name
            });
          } else {
            const names = node.src.split('/');
            const name = names[names.length - 1];
            archive.directory(node.src, node.target || name, false);
          }
        } else {
          if (node.indexOf('.') > -1) {
            const names = node.split('/');
            const name = names[names.length - 1];
            archive.file(node, {
              name
            });
          } else {
            archive.directory(node);
          }
        }
      });
      archive.finalize();
    });
  }

};
