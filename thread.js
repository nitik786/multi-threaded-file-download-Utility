const https = require('https');
const fs = require('fs');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

// Function to download a file chunk
function downloadChunk(url, start, end, filePath) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'Range': `bytes=${start}-${end}`
            }
        };

        https.get(url, options, (res) => {
            const fileStream = fs.createWriteStream(filePath, { flags: 'r+', start: start });
            res.pipe(fileStream);

            res.on('end', () => {
                fileStream.close();
                resolve();
            });

            res.on('error', (err) => {
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

if (isMainThread) {
    // Main thread: Initialize and start worker threads

    const url = 'https://speed.hetzner.de/100MB.bin';
    const filePath = 'downloaded_file.zip';
    const numChunks = 4; // Number of chunks (and worker threads)

    // Make sure the file is created and pre-allocated
    fs.open(filePath, 'w', (err, fd) => {
        if (err) throw err;

        // First, make a HEAD request to get the file size
        https.get(url, { method: 'HEAD' }, (res) => {
            const totalSize = parseInt(res.headers['content-length'], 10);

            if (!totalSize) {
                console.error('Failed to retrieve content length');
                return;
            }

            const chunkSize = Math.ceil(totalSize / numChunks);

            // Create file of the appropriate size
            fs.ftruncate(fd, totalSize, (err) => {
                if (err) throw err;
                fs.close(fd, (err) => {
                    if (err) throw err;

                    let completedChunks = 0;

                    for (let i = 0; i < numChunks; i++) {
                        const start = i * chunkSize;
                        const end = i === numChunks - 1 ? totalSize - 1 : (i + 1) * chunkSize - 1;

                        const worker = new Worker(__filename, { workerData: { url, start, end, filePath } });

                        worker.on('message', () => {
                            console.log(`Chunk ${i} downloaded`);
                            completedChunks += 1;
                            if (completedChunks === numChunks) {
                                console.log('File downloaded successfully!');
                            }
                        });

                        worker.on('error', (err) => {
                            console.error(`Worker error: ${err}`);
                        });

                        worker.on('exit', (code) => {
                            if (code !== 0) {
                                console.error(`Worker stopped with exit code ${code}`);
                            }
                        });
                    }
                });
            });
        }).on('error', (err) => {
            console.error(`Error: ${err}`);
        });
    });

} else {
    // Worker thread: Perform the chunk download
    const { url, start, end, filePath } = workerData;

    downloadChunk(url, start, end, filePath)
        .then(() => {
            parentPort.postMessage('done');
        })
        .catch((err) => {
            console.error(`Error downloading chunk: ${err}`);
        });
}
