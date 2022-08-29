import*as UI from'../ui/ui.js';import{Events}from'./CSSOverviewController.js';export class CSSOverviewStartView extends UI.Widget.Widget{constructor(controller){super();this.registerRequiredCSS('css_overview/cssOverviewStartView.css');this._controller=controller;this._render();}
_render(){const startButton=UI.UIUtils.createTextButton(ls`Capture overview`,()=>this._controller.dispatchEventToListeners(Events.RequestOverviewStart),'',true);this.setDefaultFocusedElement(startButton);const fragment=UI.Fragment.Fragment.build`
      <div class="vbox overview-start-view">
        <h1>${ls`CSS Overview`}</h1>
        <div>${startButton}</div>
      </div>
    `;this.contentElement.appendChild(fragment.element());this.contentElement.style.overflow='auto';}}