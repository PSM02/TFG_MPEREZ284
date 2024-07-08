const langchain = require("../src/llm");
const groq = require("../src/groq");
const testsJson = require('../test/new_test.json');

//method to calculate a porcetage
calculateScores = (list) => {
    res = {
        "passed": 0,
        "failed": 0,
        "inapplicable": 0,
        "allThatShouldBePassed": 0,
        "allThatShouldBeFailed": 0,
        "allThatShouldBeInapplicable": 0
    }
    list.forEach(element => {
        response = element.response.toLowerCase()
        // response = element.response.split(/[ .:;?!~,`"&|()<>{}\[\]\r\n/\\]+/)[0]
        /* console.log("expected: " + element.expected)
        console.log("response: " + response) */
        if (element.expected === "passed") {
            res.allThatShouldBePassed++
            if (response.includes("passed")) {
                res.passed++
            }
        } else if (element.expected === "failed") {
            res.allThatShouldBeFailed++
            if (response.includes("failed")) {
                res.failed++
            }
        } else if (element.expected === "inapplicable") {
            res.allThatShouldBeInapplicable++
            if (response.includes("inapplicable")) {
                res.inapplicable++
            }
        }
    });
    return res
}

totalScore = (res) => {
    totalPassed = 0
    totalFailed = 0
    totalInapplicable = 0
    totalAllThatShouldBePassed = 0
    totalAllThatShouldBeFailed = 0
    totalAllThatShouldBeInapplicable = 0
    for (let i = 0; i < res.length; i++) {
        totalPassed += res[i].passed
        totalFailed += res[i].failed
        totalInapplicable += res[i].inapplicable
        totalAllThatShouldBePassed += res[i].allThatShouldBePassed
        totalAllThatShouldBeFailed += res[i].allThatShouldBeFailed
        totalAllThatShouldBeInapplicable += res[i].allThatShouldBeInapplicable
    }
    return (totalPassed + totalFailed + totalInapplicable) / (totalAllThatShouldBePassed + totalAllThatShouldBeFailed + totalAllThatShouldBeInapplicable)
}

// Export the function
module.exports = {
    calculateScores,
    totalScore,
    callLLM
}