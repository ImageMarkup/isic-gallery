export default class AsyncQueue {
	constructor(fn, context, args) {
		this.current = Promise.resolve(false);
		this._init(fn, context, args);
	}

	_init(fn, context = {}, args = []) {
		this.fn = fn.bind(context, ...args);
	}

	addJobToQueue() {
		this.current = this.current.then(() => this.fn());
	}
}
