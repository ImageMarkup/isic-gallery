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
	const questionIndex = addedQuestionsAndAnswersNames
		.findIndex(item => item.questionName === questionName);
	if (questionIndex > -1) {
		return addedQuestionsAndAnswersNames[questionIndex].answerNames;
	}
	return null;
}


function removeAddedQuestions(questionName) {
	const index = addedQuestionsAndAnswersNames.findIndex(item => item.questionName === questionName);
	if (index > -1) {
		addedQuestionsAndAnswersNames.splice(index, 1);
	}
}

function removeAnswerName(questionName, answerName) {
	const questionIndex = addedQuestionsAndAnswersNames
		.findIndex(item => item.questionName === questionName);
	if (questionIndex > -1) {
		const answerIndex = addedQuestionsAndAnswersNames[questionIndex]
			.answerNames
			.findIndex(answer => answer === answerName);
		addedQuestionsAndAnswersNames[questionIndex].answerNames.splice(answerIndex, 1);
	}
}

function addAnswerName(questionName, newAnswerName) {
	const questionIndex = addedQuestionsAndAnswersNames
		.findIndex(item => item.questionName === questionName);
	if (questionIndex > -1) {
		addedQuestionsAndAnswersNames[questionIndex].answerNames.push(newAnswerName);
	}
}

function clearAddedQuestions() {
	addedQuestionsAndAnswersNames = [];
}

export default {
	setTextLayoutNames,
	getTextLayoutNames,
	removeTextLayoutName,
	clearTextLayoutNames,
	setAddedQuestionsAndAnswersNames,
	getAddedQuestionsAndAnswersNames,
	removeAddedQuestions,
	removeAnswerName,
	addAnswerName,
	getAddedAnswerNames,
	clearAddedQuestions
};
