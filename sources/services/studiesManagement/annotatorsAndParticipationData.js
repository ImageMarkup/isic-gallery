function prepareAnnotatorsData(item) {
	const imagesCount = item.images && item.images.length ? item.images.length : 0;
	let result = [];
	if (item.users && item.users.length) {
		item.users.forEach((user) => {
			const userCompletion = item.userCompletion[user._id];
			const completion = `${userCompletion}/${imagesCount} &emsp; ${Math.round(userCompletion / imagesCount * 100)}%`;
			let fullUserName = "";
			if (user.firstName || user.lastName || user.login) {
				fullUserName = `[${user.firstName} ${user.lastName} (${user.login})]`;
			}
			result.push({
				id: user._id,
				userName: `${user.name} ${fullUserName}`,
				completion
			});
		});
	}
	return result;
}

function prepareParticipationReqData(item) {
	let result = [];
	if (item.participationRequests && item.participationRequests.length) {
		item.participationRequests.forEach((user) => {
			let fullUserName = "";
			if (user.firstName || user.lastName || user.login) {
				fullUserName = `[${user.firstName} ${user.lastName} (${user.login})]`;
			}
			result.push({
				id: user._id,
				userName: `${user.name} ${fullUserName}`
			});
		});
	}
	return result;
}

export default {
	prepareAnnotatorsData,
	prepareParticipationReqData
}