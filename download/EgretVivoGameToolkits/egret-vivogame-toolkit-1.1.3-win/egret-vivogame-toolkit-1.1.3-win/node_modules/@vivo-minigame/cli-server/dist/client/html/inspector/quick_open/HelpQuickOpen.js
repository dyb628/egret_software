import{Provider}from'./FilteredListWidget.js';import{QuickOpenImpl}from'./QuickOpen.js';export class HelpQuickOpen extends Provider{constructor(){super();this._providers=[];self.runtime.extensions(Provider).forEach(this._addProvider.bind(this));}
_addProvider(extension){if(extension.title()){this._providers.push({prefix:extension.descriptor()['prefix'],title:extension.title()});}}
itemCount(){return this._providers.length;}
itemKeyAt(itemIndex){return this._providers[itemIndex].prefix;}
itemScoreAt(itemIndex,query){return-this._providers[itemIndex].prefix.length;}
renderItem(itemIndex,query,titleElement,subtitleElement){const provider=this._providers[itemIndex];const prefixElement=titleElement.createChild('span','monospace');prefixElement.textContent=(provider.prefix||'…')+' ';titleElement.createTextChild(provider.title);}
selectItem(itemIndex,promptValue){if(itemIndex!==null){QuickOpenImpl.show(this._providers[itemIndex].prefix);}}
renderAsTwoRows(){return false;}}