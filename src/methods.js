//method to calculate a porcetage
calculatePercentage = (list) => {
    passed = 0
    list.array.forEach(element => {
        if (element.expected === element.response) {
            passed++
        }
    });
    return (passed / list.length) * 100
}