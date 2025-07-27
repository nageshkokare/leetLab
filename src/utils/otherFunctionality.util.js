import axios from "axios";
const getJudge0LanguageId = function (language) {
    const languageMap = {
        "PYTHON" : 71,
        "JAVA" : 62,
        "JAVASCRIPT" : 63,
    }
    return languageMap[language.toUpperCase()];
}

const submitBatch = async function (submissions) {
    const {data} = await axios.post(
        `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
        {submissions}
    );
    console.log("Batch submission response:", data);
    return data; // returns the [{token}, {token}] 
}

const sleep = (ms)=>{return new Promise((resolve)=>setTimeout(resolve, ms))}
const pollBatchResults = async function (tokens) {
    console.log(" now pull function is start to Run"); //-------TEST LINE 

     await sleep(2000); //---- wait before first pull

    while (true) {
        const {data} = await axios.get(
            `${process.env.JUDGE0_API_URL}/submissions/batch`,
            {
                params: {
                    tokens: tokens.join(","),
                    base64_encoded: false,
                },
            }
        );

        const results = data.submissions || [];
        console.log("Polling...", results.map(r => r?.status?.description || "null"));

        
        const isAllDone = results.every(
            (r)=>r?.status.id !== 1 && r?.status.id !==2
        );

        if(isAllDone) return results;

        await sleep(1000); //----> wait before pulling again
    }
}

export {
    getJudge0LanguageId,
    submitBatch,
    sleep,
    pollBatchResults
}