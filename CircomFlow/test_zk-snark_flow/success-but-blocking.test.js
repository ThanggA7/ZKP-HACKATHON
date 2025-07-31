const { runZKSNARKWorkflow } = require('../complier');

console.log(
	'Kết quả chạy flow, khi nó là false sẽ không có bằng chứng trả về client ->',
	runZKSNARKWorkflow('./circuits/prove_PoR')
);
console.log(
	'Minh chứng việc sinh bằng chứng chặn luồng chính rất lâu, chạy xong mười mấy giây cái này mới log ra kết quả 1 + 1 ->',
	1 + 1
);
