import*as Common from'../common/common.js';import*as Diff from'../diff/diff.js';import*as Host from'../host/host.js';import*as UI from'../ui/ui.js';import{FilteredListWidget,Provider}from'./FilteredListWidget.js';import{QuickOpenImpl}from'./QuickOpen.js';export class CommandMenu{constructor(){this._commands=[];this._loadCommands();}
static createCommand(category,keys,title,shortcut,executeHandler,availableHandler){const keyList=keys.split(',');let key='';keyList.forEach(k=>{key+=(ls(k.trim())+'\0');});return new Command(category,title,key,shortcut,executeHandler,availableHandler);}
static createSettingCommand(extension,title,value){const category=extension.descriptor()['category']||'';const tags=extension.descriptor()['tags']||'';const setting=self.Common.settings.moduleSetting(extension.descriptor()['settingName']);return CommandMenu.createCommand(ls(category),tags,title,'',setting.set.bind(setting,value),availableHandler);function availableHandler(){return setting.get()!==value;}}
static createActionCommand(action){const shortcut=self.UI.shortcutRegistry.shortcutTitleForAction(action.id())||'';return CommandMenu.createCommand(action.category(),action.tags(),action.title(),shortcut,action.execute.bind(action));}
static createRevealViewCommand(extension,category){const viewId=extension.descriptor()['id'];const executeHandler=self.UI.viewManager.showView.bind(self.UI.viewManager,viewId);const tags=extension.descriptor()['tags']||'';return CommandMenu.createCommand(category,tags,Common.UIString.UIString('Show %s',extension.title()),'',executeHandler);}
_loadCommands(){const locations=new Map();self.runtime.extensions(UI.View.ViewLocationResolver).forEach(extension=>{const category=extension.descriptor()['category'];const name=extension.descriptor()['name'];if(category&&name){locations.set(name,category);}});const viewExtensions=self.runtime.extensions('view');for(const extension of viewExtensions){const category=locations.get(extension.descriptor()['location']);if(category){this._commands.push(CommandMenu.createRevealViewCommand(extension,ls(category)));}}
const settingExtensions=self.runtime.extensions('setting');for(const extension of settingExtensions){const options=extension.descriptor()['options'];if(!options||!extension.descriptor()['category']){continue;}
for(const pair of options){this._commands.push(CommandMenu.createSettingCommand(extension,ls(pair['title']),pair['value']));}}}
commands(){return this._commands;}}
export class CommandMenuProvider extends Provider{constructor(){super();this._commands=[];}
attach(){const allCommands=commandMenu.commands();const actions=self.UI.actionRegistry.availableActions();for(const action of actions){if(action.category()){this._commands.push(CommandMenu.createActionCommand(action));}}
for(const command of allCommands){if(command.available()){this._commands.push(command);}}
this._commands=this._commands.sort(commandComparator);function commandComparator(left,right){const cats=left.category().compareTo(right.category());return cats?cats:left.title().compareTo(right.title());}}
detach(){this._commands=[];}
itemCount(){return this._commands.length;}
itemKeyAt(itemIndex){return this._commands[itemIndex].key();}
itemScoreAt(itemIndex,query){const command=this._commands[itemIndex];const opcodes=Diff.Diff.DiffWrapper.charDiff(query.toLowerCase(),command.title().toLowerCase());let score=0;for(let i=0;i<opcodes.length;++i){if(opcodes[i][0]===Diff.Diff.Operation.Equal){score+=opcodes[i][1].length*opcodes[i][1].length;}}
if(command.category().startsWith('Panel')){score+=2;}else if(command.category().startsWith('Drawer')){score+=1;}
return score;}
renderItem(itemIndex,query,titleElement,subtitleElement){const command=this._commands[itemIndex];titleElement.removeChildren();const tagElement=titleElement.createChild('span','tag');const index=String.hashCode(command.category())%MaterialPaletteColors.length;tagElement.style.backgroundColor=MaterialPaletteColors[index];tagElement.textContent=command.category();titleElement.createTextChild(command.title());FilteredListWidget.highlightRanges(titleElement,query,true);subtitleElement.textContent=command.shortcut();}
selectItem(itemIndex,promptValue){if(itemIndex===null){return;}
this._commands[itemIndex].execute();Host.userMetrics.actionTaken(Host.UserMetrics.Action.SelectCommandFromCommandMenu);}
notFoundText(){return ls`No commands found`;}}
export const MaterialPaletteColors=['#F44336','#E91E63','#9C27B0','#673AB7','#3F51B5','#03A9F4','#00BCD4','#009688','#4CAF50','#8BC34A','#CDDC39','#FFC107','#FF9800','#FF5722','#795548','#9E9E9E','#607D8B'];export class Command{constructor(category,title,key,shortcut,executeHandler,availableHandler){this._category=category;this._title=title;this._key=category+'\0'+title+'\0'+key;this._shortcut=shortcut;this._executeHandler=executeHandler;this._availableHandler=availableHandler;}
category(){return this._category;}
title(){return this._title;}
key(){return this._key;}
shortcut(){return this._shortcut;}
available(){return this._availableHandler?this._availableHandler():true;}
execute(){this._executeHandler();}}
export class ShowActionDelegate{handleAction(context,actionId){Host.InspectorFrontendHost.InspectorFrontendHostInstance.bringToFront();QuickOpenImpl.show('>');return true;}}
export const commandMenu=new CommandMenu();