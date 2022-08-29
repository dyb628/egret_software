export class Issue{constructor(code){this._code=code;}
get code(){return this._code;}
static create(code){return new Issue(code);}}