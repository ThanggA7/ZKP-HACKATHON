const path = require('path');
const { Worker } = require('worker_threads');

function runZKInWorker(circuitPath) {
	return new Promise((resolve, reject) => {
		const workerPath = path.join(__dirname, 'worker.js');

		const worker = new Worker(workerPath, {
			workerData: { circuitPath },
		});

		worker.on('message', (result) => {
			resolve(result);
		});

		worker.on('error', reject);
		worker.on('exit', (code) => {
			if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
		});
	});
}

console.log('Start xử lý ZK...');
runZKInWorker('./circuits/prove_PoR').then((result) => {
	console.log('Kết quả chạy flow:', result);
});

console.log('Không chặn luồng nữa');
