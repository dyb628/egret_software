import*as UI from'../ui/ui.js';import{Events}from'./CSSOverviewController.js';export class CSSOverviewProcessingView extends UI.Widget.Widget{constructor(controller){super();this.registerRequiredCSS('css_overview/cssOverviewProcessingView.css');this._formatter=new Intl.NumberFormat('en-US');this._controller=controller;this._render();}
_render(){const cancelButton=UI.UIUtils.createTextButton(ls`Cancel`,()=>this._controller.dispatchEventToListeners(Events.RequestOverviewCancel),'',true);this.setDefaultFocusedElement(cancelButton);this.fragment=UI.Fragment.Fragment.build`
      <div class="vbox overview-processing-view">
        <h1>Processing page</h1>
        <div>${cancelButton}</div>
      </div>
    `;this.contentElement.appendChild(this.fragment.element());this.contentElement.style.overflow='auto';}}