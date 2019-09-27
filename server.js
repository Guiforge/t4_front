
// var fs = require('fs');
// var archiver = require('archiver');
// var output = process.stderr
// var rd = fs.createReadStream('/sgoinfre/goinfre/ISO/debian/debian-9.6.0-i386-DVD-1.iso')
// // var rd2 = fs.createReadStream('./index.html')

// var archive = archiver('zip', {
//     zlib: { level: 9 } // Sets the compression level.
// });

// var Stream = require('stream').Stream

// // listen for all archive data to be written
// // 'close' event is fired only when a file descriptor is involved
// output.on('close', function() {
//   console.log(archive.pointer() + ' total bytes');
//   console.log('archiver has been finalized and the output file descriptor has closed.');
// });

// // This event is fired when the data source is drained no matter what was the data source.
// // It is not part of this library but rather from the NodeJS Stream API.
// // @see: https://nodejs.org/api/stream.html#stream_event_end
// output.on('end', function() {
//   console.log('Data has been drained');
// });

// rd.on('data', (c) => {console.log('rd read:',  c.byteLength)})
// rd.on('end', () => {console.log('rd end')})
// // rd2.on('data', (c) => {console.log('rd2 read:', c.byteLength)})
// // rd2.on('end', () => {console.log('rd2 end')})

// output.on('drain', (c) => {console.log('write', c)})

// // good practice to catch warnings (ie stat failures and other non-blocking errors)
// archive.on('warning', function(err) {
//   if (err.code === 'ENOENT') {
//     // log warning
//   } else {
//     // throw error
//     throw err;
//   }
// });

// // console.log('rd',{
// // i: typeof rd,
// // d: rd instanceof Stream
// // })
// // good practice to catch this error explicitly
// archive.on('error', function(err) {
//   throw err;
// });
// // pipe archive data to the output file
// archive.pipe(output);

// console.log(rd)
// // append files
// archive.append(rd, {name: 'foobar.md'});
// // archive.append(rd2, {name: 'foobar.html'});

// // Wait for streams to complete
// archive.finalize();


//################################################

var util = require('util');
var PassThrough = require('stream').PassThrough;
var Readable = require('stream').Readable;
var Transform = require('stream').Transform;
var fs = require('fs');


const t = new Transform({
  readableObjectMode: true,
  
  transform(chunk, encoding, callback) {
    this.push(chunk);
    callback();
  }
});

const oldClose = t.end

let top = 2;
t.end = (data) => {
  top--;
  console.log('end Call\n')
  t.write(data)
  if (!top) {
    console.log('EMIT')
    // t.writableEnded = true
    // t.emit('end')
    t.emit('finish')
    // t.finish()
  }
  // t.destroy()
}

var w = fs.createWriteStream('./toto.txt')


// w.end = (a) => {w.write('end\n')}
w.on('close', () => {
  w.write('toto')
  console.log('toto')
})

const stream1 = new Readable({
  read() {}
});


const stream2 = new Readable({
  read() {}
});


stream1.pipe(t);
stream2.pipe(t);

stream1.push('stream 1: a\n');
stream1.push('stream 1: b\n');


stream2.push('stream ******************************************** a\n');
stream1.push('stream 1: a\n');
stream1.push('stream 1: b\n');
stream2.push('stream ******************************************** b\n');
stream1.push('stream 1: a\n');
stream1.push('stream 1: b\n');stream1.push('stream 1: a\n');
stream1.push('stream 1: b\n');stream1.push('stream 1: a\n');
stream1.push('stream 1: b\n');stream1.push('stream 1: a\n');
stream2.push('stream ******************************************** b\n');
stream2.push('stream ******************************************** b\n');

stream2.push('stream ******************************************** b\n');

stream1.push('stream 1: b\n');stream1.push('stream 1: a\n');
stream1.push('stream 1: b\n');stream1.push('stream 1: a\n');
stream1.push('stream 1: b\n');stream1.push('stream 1: a\n');
stream2.push('stream ******************************************** b\n');

stream1.push('stream 1: b\n');
stream2.push(null); // No more data
stream1.push(null); // No more data




t.pipe(w)
