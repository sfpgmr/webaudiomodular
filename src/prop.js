'use strict';

export function defObservable(target,propName,opt = {})
{
	(()=>{
		var v_;
		opt.enumerable = opt.enumerable || true;
		opt.configurable = opt.configurable || false;
		opt.get = opt.get || (() => v_);
		opt.set = opt.set || ((v)=>{
			if(v_ != v){
				target.emit(propName + '_changed',v);
			}
			v_ = v;
		});
		Object.defineProperty(target,propName,opt);
	})();
}