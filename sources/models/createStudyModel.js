let textViewNames = [];

let addedQuestionsAndAnswersNames = [];

function setTextLayoutNames(textViewName) {
	textViewNames.push(textViewName);
}

function getTextLayoutNames() {
	return textViewNames;
}

function removeTextLayoutName(textViewName) {
	const index = textViewNames.indexOf(textViewName);
	if (index > -1) {
		textViewNames.splice(index, 1);
	}
}

function clearTextLayoutNames() {
	textViewNames = [];
}

function setAddedQuestionsAndAnswersNames(questionName, answersArray) {
	addedQuestionsAndAnswersNames.push({
		questionName,
		answerNames: answersArray
	});
}

function getAddedQuestionsAndAnswersNames() {
	return addedQuestionsAndAnswersNames;
}

function getAddedAnswerNames(questionName) {
	const qustionIndex = addedQuestionsAndAnswersNames.findIndex(item => item.questionName === questionName);
	if (qustionIndex > -1) {
		return addedQuestionsAndAnswersNames[qustionIndex].answerNames;
	}
}


function removeAddedQustions(questionName) {
	const index = addedQuestionsAndAnswersNames.findIndex(item => item.questionName === questionName);
	if (index > -1) {
		addedQuestionsAndAnswersNames.splice(index, 1);
	}
}

function removeAnswerName(questionName, answerName) {
	const qustionIndex = addedQuestionsAndAnswersNames.findIndex(item => item.questionName === questionName);
	if (qustionIndex > -1) {
		const answerIndex = addedQuestionsAndAnswersNames[qustionIndex].answerNames.findIndex(answer => answer === answerName);
		addedQuestionsAndAnswersNames[qustionIndex].answerNames.splice(answerIndex, 1);
	}
}

function addAnswerName(questionName, newAnswerName) {
	const qustionIndex = addedQuestionsAndAnswersNames.findIndex(item => item.questionName === questionName);
	if (qustionIndex > -1) {
		addedQuestionsAndAnswersNames[qustionIndex].answerNames.push(newAnswerName);
	}
}

export default {
	setTextLayoutNames,
	getTextLayoutNames,
	removeTextLayoutName,
	clearTextLayoutNames,
	setAddedQuestionsAndAnswersNames,
	getAddedQuestionsAndAnswersNames,
	removeAddedQustions,
	removeAnswerName,
	addAnswerName,
	getAddedAnswerNames
};
