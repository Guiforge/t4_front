var fs = require('fs');
var archiver = require('archiver');
var output = fs.createWriteStream('./example.zip');
var rd = fs.createReadStream('./dev.Dockerfile')
var archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
});

var Stream = require('stream').Stream

// listen for all archive data to be written
// 'close' event is fired only when a file descriptor is involved
output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

// This event is fired when the data source is drained no matter what was the data source.
// It is not part of this library but rather from the NodeJS Stream API.
// @see: https://nodejs.org/api/stream.html#stream_event_end
output.on('end', function() {
  console.log('Data has been drained');
});

output.on('data', () => {console.log('w')})

// good practice to catch warnings (ie stat failures and other non-blocking errors)
archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    // log warning
  } else {
    // throw error
    throw err;
  }
});

// console.log('rd',{
// i: typeof rd,
// d: rd instanceof Stream
// })
// good practice to catch this error explicitly
archive.on('error', function(err) {
  throw err;
});
// pipe archive data to the output file
archive.pipe(output);

console.log(rd)
// append files
archive.append(rd, {name: 'foobar.md'});
rd = fs.createReadStream('./index.html')
archive.append(rd, {name: 'foobar.html'});

// Wait for streams to complete
archive.finalize();
