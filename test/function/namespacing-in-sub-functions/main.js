import { func as otherFunc } from './func';
function innerFunc() {
	function func () {
		return otherFunc();
	}
	func();
}

var res = innerFunc();

export default res;