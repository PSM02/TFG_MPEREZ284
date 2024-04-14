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
        element.response = element.response.toLowerCase()
        if (element.expected === "passed") {
            res.allThatShouldBePassed++
            if (element.response === "passed") {
                res.passed++
            }
        } else if (element.expected === "failed") {
            res.allThatShouldBeFailed++
            if (element.response === "failed") {
                res.failed++
            }
        } else if (element.expected === "inapplicable") {
            res.allThatShouldBeInapplicable++
            if (element.response === "inapplicable") {
                res.inapplicable++
            }
        }
    });
    return res
}

// Export the function
module.exports = {
    calculateScores
}