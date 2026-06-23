export const answerStore = {
    answers: {},
    setAnswer(qId, value) { this.answers[qId] = value; },
    getAnswer(qId) { return this.answers[qId]; }
};
