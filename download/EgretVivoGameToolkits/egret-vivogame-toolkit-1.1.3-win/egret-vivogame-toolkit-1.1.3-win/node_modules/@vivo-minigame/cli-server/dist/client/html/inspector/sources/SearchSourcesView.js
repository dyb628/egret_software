import*as Search from'../search/search.js';import*as UI from'../ui/ui.js';import{SourcesSearchScope}from'./SourcesSearchScope.js';export class SearchSourcesView extends Search.SearchView.SearchView{constructor(){super('sources');}
static async openSearch(query,searchImmediately){const view=self.UI.viewManager.view('sources.search-sources-tab');const location=await self.UI.viewManager.resolveLocation('drawer-view');location.appendView(view);await self.UI.viewManager.revealView((view));const widget=(await view.widget());widget.toggle(query,!!searchImmediately);return widget;}
createScope(){return new SourcesSearchScope();}}
export class ActionDelegate{handleAction(context,actionId){this._showSearch();return true;}
_showSearch(){const selection=self.UI.inspectorView.element.window().getSelection();let queryCandidate='';if(selection.rangeCount){queryCandidate=selection.toString().replace(/\r?\n.*/,'');}
return SearchSourcesView.openSearch(queryCandidate);}}