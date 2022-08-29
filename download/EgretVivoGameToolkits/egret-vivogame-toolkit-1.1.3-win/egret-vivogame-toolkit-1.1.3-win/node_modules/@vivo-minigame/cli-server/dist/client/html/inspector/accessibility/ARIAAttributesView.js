import*as SDK from'../sdk/sdk.js';import*as UI from'../ui/ui.js';import{AccessibilitySubPane}from'./AccessibilitySubPane.js';import{ariaMetadata}from'./ARIAMetadata.js';export class ARIAAttributesPane extends AccessibilitySubPane{constructor(){super(ls`ARIA Attributes`);this._noPropertiesInfo=this.createInfo(ls`No ARIA attributes`);this._treeOutline=this.createTreeOutline();}
setNode(node){super.setNode(node);this._treeOutline.removeChildren();if(!this.node()){return;}
const target=this.node().domModel().target();const attributes=node.attributes();for(let i=0;i<attributes.length;++i){const attribute=attributes[i];if(!this._isARIAAttribute(attribute)){continue;}
this._treeOutline.appendChild(new ARIAAttributesTreeElement(this,attribute,target));}
const foundAttributes=(this._treeOutline.rootElement().childCount()!==0);this._noPropertiesInfo.classList.toggle('hidden',foundAttributes);this._treeOutline.element.classList.toggle('hidden',!foundAttributes);}
_isARIAAttribute(attribute){return _attributes.has(attribute.name);}}
export class ARIAAttributesTreeElement extends UI.TreeOutline.TreeElement{constructor(parentPane,attribute,target){super('');this._parentPane=parentPane;this._attribute=attribute;this.selectable=false;}
static createARIAValueElement(value){const valueElement=createElementWithClass('span','monospace');valueElement.setTextContentTruncatedIfNeeded(value||'');return valueElement;}
onattach(){this._populateListItem();this.listItemElement.addEventListener('click',this._mouseClick.bind(this));}
_populateListItem(){this.listItemElement.removeChildren();this.appendNameElement(this._attribute.name);this.listItemElement.createChild('span','separator').textContent=':\xA0';this.appendAttributeValueElement(this._attribute.value);}
appendNameElement(name){this._nameElement=createElement('span');this._nameElement.textContent=name;this._nameElement.classList.add('ax-name');this._nameElement.classList.add('monospace');this.listItemElement.appendChild(this._nameElement);}
appendAttributeValueElement(value){this._valueElement=ARIAAttributesTreeElement.createARIAValueElement(value);this.listItemElement.appendChild(this._valueElement);}
_mouseClick(event){if(event.target===this.listItemElement){return;}
event.consume(true);this._startEditing();}
_startEditing(){const valueElement=this._valueElement;if(UI.UIUtils.isBeingEdited(valueElement)){return;}
const previousContent=valueElement.textContent;function blurListener(previousContent,event){const text=event.target.textContent;this._editingCommitted(text,previousContent);}
this._prompt=new ARIAAttributePrompt(ariaMetadata().valuesForProperty(this._nameElement.textContent),this);this._prompt.setAutocompletionTimeout(0);const proxyElement=this._prompt.attachAndStartEditing(valueElement,blurListener.bind(this,previousContent));proxyElement.addEventListener('keydown',this._editingValueKeyDown.bind(this,previousContent),false);valueElement.getComponentSelection().selectAllChildren(valueElement);}
_removePrompt(){if(!this._prompt){return;}
this._prompt.detach();delete this._prompt;}
_editingCommitted(userInput,previousContent){this._removePrompt();if(userInput!==previousContent){this._parentPane.node().setAttributeValue(this._attribute.name,userInput);}}
_editingCancelled(){this._removePrompt();this._populateListItem();}
_editingValueKeyDown(previousContent,event){if(event.handled){return;}
if(isEnterKey(event)){this._editingCommitted(event.target.textContent,previousContent);event.consume();return;}
if(isEscKey(event)){this._editingCancelled();event.consume();return;}}}
export class ARIAAttributePrompt extends UI.TextPrompt.TextPrompt{constructor(ariaCompletions,treeElement){super();this.initialize(this._buildPropertyCompletions.bind(this));this._ariaCompletions=ariaCompletions;this._treeElement=treeElement;}
_buildPropertyCompletions(expression,prefix,force){prefix=prefix.toLowerCase();if(!prefix&&!force&&(this._isEditingName||expression)){return Promise.resolve([]);}
return Promise.resolve(this._ariaCompletions.filter(value=>value.startsWith(prefix)).map(c=>({text:c})));}}
const _attributes=new Set(['role','aria-activedescendant','aria-atomic','aria-autocomplete','aria-brailleroledescription','aria-busy','aria-checked','aria-colcount','aria-colindex','aria-colindextext','aria-colspan','aria-controls','aria-current','aria-describedby','aria-details','aria-disabled','aria-dropeffect','aria-errormessage','aria-expanded','aria-flowto','aria-grabbed','aria-haspopup','aria-hidden','aria-invalid','aria-keyshortcuts','aria-label','aria-labelledby','aria-level','aria-live','aria-modal','aria-multiline','aria-multiselectable','aria-orientation','aria-owns','aria-placeholder','aria-posinset','aria-pressed','aria-readonly','aria-relevant','aria-required','aria-roledescription','aria-rowcount','aria-rowindex','aria-rowindextext','aria-rowspan','aria-selected','aria-setsize','aria-sort','aria-valuemax','aria-valuemin','aria-valuenow','aria-valuetext',]);