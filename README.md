# Multi-Threaded File Download Utility

This is a multi-threaded file download utility implemented in Node.js. It allows downloading a file in multiple chunks using worker threads to speed up the download process and optimize network usage.

## Features

- **Multi-threaded Download**: Splits the file into multiple chunks and downloads them concurrently.
- **Dynamic Thread Allocation**: Number of threads and chunk sizes can be configured based on file size.
- **Error Handling**: Proper error handling to ensure smooth downloading and retry logic.

## Prerequisites

- **Node.js**: Make sure you have Node.js installed on your system. You can download it from [nodejs.org](https://nodejs.org/).

## Installation

Clone the repository and navigate into the project directory:

```bash
git clone https://github.com/nitik786/multi-threaded-file-download-Utility.git
cd multi-threaded-file-download-Utility
