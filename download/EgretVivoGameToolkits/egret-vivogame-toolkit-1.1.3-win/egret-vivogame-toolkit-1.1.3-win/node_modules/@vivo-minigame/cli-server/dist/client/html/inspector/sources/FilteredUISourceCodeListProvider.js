import*as Common from'../common/common.js';import*as QuickOpen from'../quick_open/quick_open.js';import*as UI from'../ui/ui.js';import*as Workspace from'../workspace/workspace.js';import{FilePathScoreFunction}from'./FilePathScoreFunction.js';export class FilteredUISourceCodeListProvider extends QuickOpen.FilteredListWidget.Provider{constructor(){super();this._queryLineNumberAndColumnNumber='';this._defaultScores=null;this._scorer=new FilePathScoreFunction('');}
_projectRemoved(event){const project=(event.data);this._populate(project);this.refresh();}
_populate(skipProject){this._uiSourceCodes=[];const projects=self.Workspace.workspace.projects().filter(this.filterProject.bind(this));for(let i=0;i<projects.length;++i){if(skipProject&&projects[i]===skipProject){continue;}
const uiSourceCodes=projects[i].uiSourceCodes().filter(this._filterUISourceCode.bind(this));this._uiSourceCodes=this._uiSourceCodes.concat(uiSourceCodes);}}
_filterUISourceCode(uiSourceCode){const binding=self.Persistence.persistence.binding(uiSourceCode);return!binding||binding.fileSystem===uiSourceCode;}
uiSourceCodeSelected(uiSourceCode,lineNumber,columnNumber){}
filterProject(project){return true;}
itemCount(){return this._uiSourceCodes.length;}
itemKeyAt(itemIndex){return this._uiSourceCodes[itemIndex].url();}
setDefaultScores(defaultScores){this._defaultScores=defaultScores;}
itemScoreAt(itemIndex,query){const uiSourceCode=this._uiSourceCodes[itemIndex];const score=this._defaultScores?(this._defaultScores.get(uiSourceCode)||0):0;if(!query||query.length<2){return score;}
if(this._query!==query){this._query=query;this._scorer=new FilePathScoreFunction(query);}
let multiplier=10;if(uiSourceCode.project().type()===Workspace.Workspace.projectTypes.FileSystem&&!self.Persistence.persistence.binding(uiSourceCode)){multiplier=5;}
const fullDisplayName=uiSourceCode.fullDisplayName();return score+multiplier*this._scorer.score(fullDisplayName,null);}
renderItem(itemIndex,query,titleElement,subtitleElement){query=this.rewriteQuery(query);const uiSourceCode=this._uiSourceCodes[itemIndex];const fullDisplayName=uiSourceCode.fullDisplayName();const indexes=[];new FilePathScoreFunction(query).score(fullDisplayName,indexes);const fileNameIndex=fullDisplayName.lastIndexOf('/');titleElement.classList.add('monospace');subtitleElement.classList.add('monospace');titleElement.textContent=uiSourceCode.displayName()+(this._queryLineNumberAndColumnNumber||'');this._renderSubtitleElement(subtitleElement,fullDisplayName);subtitleElement.title=fullDisplayName;const ranges=[];for(let i=0;i<indexes.length;++i){ranges.push({offset:indexes[i],length:1});}
if(indexes[0]>fileNameIndex){for(let i=0;i<ranges.length;++i){ranges[i].offset-=fileNameIndex+1;}
UI.UIUtils.highlightRangesWithStyleClass(titleElement,ranges,'highlight');}else{UI.UIUtils.highlightRangesWithStyleClass(subtitleElement,ranges,'highlight');}}
_renderSubtitleElement(element,text){element.removeChildren();let splitPosition=text.lastIndexOf('/');if(text.length>55){splitPosition=text.length-55;}
const first=element.createChild('div','first-part');first.textContent=text.substring(0,splitPosition);const second=element.createChild('div','second-part');second.textContent=text.substring(splitPosition);element.title=text;}
selectItem(itemIndex,promptValue){const parsedExpression=promptValue.trim().match(/^([^:]*)(:\d+)?(:\d+)?$/);if(!parsedExpression){return;}
let lineNumber;let columnNumber;if(parsedExpression[2]){lineNumber=parseInt(parsedExpression[2].substr(1),10)-1;}
if(parsedExpression[3]){columnNumber=parseInt(parsedExpression[3].substr(1),10)-1;}
const uiSourceCode=itemIndex!==null?this._uiSourceCodes[itemIndex]:null;this.uiSourceCodeSelected(uiSourceCode,lineNumber,columnNumber);}
rewriteQuery(query){query=query?query.trim():'';if(!query||query===':'){return'';}
const lineNumberMatch=query.match(/^([^:]+)((?::[^:]*){0,2})$/);this._queryLineNumberAndColumnNumber=lineNumberMatch?lineNumberMatch[2]:'';return lineNumberMatch?lineNumberMatch[1]:query;}
_uiSourceCodeAdded(event){const uiSourceCode=(event.data);if(!this._filterUISourceCode(uiSourceCode)||!this.filterProject(uiSourceCode.project())){return;}
this._uiSourceCodes.push(uiSourceCode);this.refresh();}
notFoundText(){return Common.UIString.UIString('No files found');}
attach(){self.Workspace.workspace.addEventListener(Workspace.Workspace.Events.UISourceCodeAdded,this._uiSourceCodeAdded,this);self.Workspace.workspace.addEventListener(Workspace.Workspace.Events.ProjectRemoved,this._projectRemoved,this);this._populate();}
detach(){self.Workspace.workspace.removeEventListener(Workspace.Workspace.Events.UISourceCodeAdded,this._uiSourceCodeAdded,this);self.Workspace.workspace.removeEventListener(Workspace.Workspace.Events.ProjectRemoved,this._projectRemoved,this);this._queryLineNumberAndColumnNumber='';this._defaultScores=null;}}