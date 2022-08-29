import*as UI from'../ui/ui.js';export let ChevronTab;export class ChevronTabbedPanel extends UI.Widget.VBox{constructor(tab_definitions){super();this.registerRequiredCSS('media/chevronTabbedPanel.css');this._chevronButtons=new Map();this._header_panel=this.contentElement.createChild('div','chevron-tabbed-panel-title');this._content_panel=this.contentElement.createChild('div','chevron-tabbed-panel-content');this._header_panel_button_container=this._header_panel.createChild('div','chevron-tabbed-panel-title-buttons');for(const accessor_id in tab_definitions){this.CreateAndAddDropdownButton(accessor_id,tab_definitions[accessor_id]);}}
CreateAndAddDropdownButton(identifier,tab){const button=this._header_panel_button_container.createChild('div','chevron-tabbed-panel-buttons-item');button.appendChild(tab.title);this._chevronButtons.set(identifier,{content:tab.element,button:button});if(this._chevronButtons.size===1){this._DisplayContentSection(tab.element);button.classList.add('selected');}
button.addEventListener('click',event=>{if(event.currentTarget.classList.contains('selected')){return;}
for(const elements of this._chevronButtons.values()){elements.button.classList.remove('selected');}
event.currentTarget.classList.add('selected');this._DisplayContentSection(tab.element);},false);}
RemoveTab(identifier,remove_all=false){const button=this._chevronButtons.get(identifier);this._chevronButtons.delete(identifier);if(!remove_all&&button.classList.contains('selected')){if(this._chevronButtons.size!==0){const new_selected=this._chevronButtons.values().next().value;new_selected.classList.add('selected');}}
this._header_panel_button_container.removeChild(button.button);}
RemoveTabs(identifiers){for(const identifier of identifiers){this.RemoveTab(identifier,true);}}
_DisplayContentSection(content_element){this._content_panel.innerHTML='';content_element.show(this._content_panel);}
GetListOfButtons(){return this._chevronButtons.keys();}
GetContentPanelByName(name){if(!this._chevronButtons.has(name)){return null;}
return this._chevronButtons.get(name).content;}
GetButtonByName(name){return this._chevronButtons.get(name).button;}}