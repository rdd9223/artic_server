const crawlingoption = (url) => {
    return {
        mode: 'text',
        pythonPath: '',
        //서버 올린 후 경로 수정 -> /usr/bin/python3
        pythonOptions: ['-u'],
        scriptPath: __dirname,
        args: [url]
    }
};
module.exports = crawlingoption;