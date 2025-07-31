const { parentPort, workerData } = require('worker_threads');
const { runZKSNARKWorkflow } = require('../complier');

(async () => {
	const result = runZKSNARKWorkflow(workerData.circuitPath);
	parentPort.postMessage(result);
})();
