import{Events,LighthouseController,Presets,RuntimeSettings}from'./LighthouseController.js';import{RadioSetting}from'./RadioSetting.js';export class StartView extends UI.Widget{constructor(controller){super();this.registerRequiredCSS('lighthouse/lighthouseStartView.css');this._controller=controller;this._settingsToolbar=new UI.Toolbar('');this._render();}
settingsToolbar(){return this._settingsToolbar;}
_populateRuntimeSettingAsRadio(settingName,label,parentElement){const runtimeSetting=RuntimeSettings.find(item=>item.setting.name===settingName);if(!runtimeSetting||!runtimeSetting.options){throw new Error(`${settingName} is not a setting with options`);}
const control=new RadioSetting(runtimeSetting.options,runtimeSetting.setting,runtimeSetting.description);parentElement.appendChild(control.element);UI.ARIAUtils.setAccessibleName(control.element,label);}
_populateRuntimeSettingAsToolbarCheckbox(settingName,toolbar){const runtimeSetting=RuntimeSettings.find(item=>item.setting.name===settingName);if(!runtimeSetting||!runtimeSetting.title){throw new Error(`${settingName} is not a setting with a title`);}
runtimeSetting.setting.setTitle(runtimeSetting.title);const control=new UI.ToolbarSettingCheckbox(runtimeSetting.setting,runtimeSetting.description);toolbar.appendToolbarItem(control);if(runtimeSetting.learnMore){const link=UI.XLink.create(runtimeSetting.learnMore,ls`Learn more`,'lighthouse-learn-more');link.style.padding='5px';control.element.appendChild(link);}}
_populateFormControls(fragment){const deviceTypeFormElements=fragment.$('device-type-form-elements');this._populateRuntimeSettingAsRadio('lighthouse.device_type',ls`Device`,deviceTypeFormElements);const categoryFormElements=fragment.$('categories-form-elements');const pluginFormElements=fragment.$('plugins-form-elements');for(const preset of Presets){const formElements=preset.plugin?pluginFormElements:categoryFormElements;preset.setting.setTitle(preset.title);const checkbox=new UI.ToolbarSettingCheckbox(preset.setting);const row=formElements.createChild('div','vbox lighthouse-launcher-row');row.title=preset.description;row.appendChild(checkbox.element);}
UI.ARIAUtils.markAsGroup(categoryFormElements);UI.ARIAUtils.setAccessibleName(categoryFormElements,ls`Categories`);UI.ARIAUtils.markAsGroup(pluginFormElements);UI.ARIAUtils.setAccessibleName(pluginFormElements,ls`Community Plugins (beta)`);}
_render(){this._populateRuntimeSettingAsToolbarCheckbox('lighthouse.clear_storage',this._settingsToolbar);this._populateRuntimeSettingAsToolbarCheckbox('lighthouse.throttling',this._settingsToolbar);this._startButton=UI.createTextButton(ls`Generate report`,()=>this._controller.dispatchEventToListeners(Events.RequestLighthouseStart,UI.elementIsFocusedByKeyboard(this._startButton)),'',true);this.setDefaultFocusedElement(this._startButton);const auditsDescription=ls`Identify and fix common problems that affect your site's performance, accessibility, and user experience.`;const fragment=UI.Fragment.build`
      <div class="vbox lighthouse-start-view">
        <header>
          <div class="lighthouse-logo"></div>
          <div class="lighthouse-start-button-container hbox">
            ${this._startButton}
            </div>
          <div $="help-text" class="lighthouse-help-text hidden"></div>
          <div class="lighthouse-start-view-text">
            <span>${auditsDescription}</span>
            ${UI.XLink.create('https://developers.google.com/web/tools/lighthouse/', ls`Learn more`)}
          </div>
        </header>
        <form>
          <div class="lighthouse-form-categories">
            <div class="lighthouse-form-section">
              <div class="lighthouse-form-section-label">
                ${ls`Categories`}
              </div>
              <div class="lighthouse-form-elements" $="categories-form-elements"></div>
            </div>
            <div class="lighthouse-form-section">
              <div class="lighthouse-form-section-label">
                <div class="lighthouse-icon-label">${ls`Community Plugins(beta)`}</div>
              </div>
              <div class="lighthouse-form-elements" $="plugins-form-elements"></div>
            </div>
          </div>
          <div class="lighthouse-form-section">
            <div class="lighthouse-form-section-label">
              ${ls`Device`}
            </div>
            <div class="lighthouse-form-elements" $="device-type-form-elements"></div>
          </div>
        </form>
      </div>
    `;this._helpText=fragment.$('help-text');this._populateFormControls(fragment);this.contentElement.appendChild(fragment.element());this.contentElement.style.overflow='auto';}
onResize(){const useNarrowLayout=this.contentElement.offsetWidth<560;const startViewEl=this.contentElement.querySelector('.lighthouse-start-view');startViewEl.classList.toggle('hbox',!useNarrowLayout);startViewEl.classList.toggle('vbox',useNarrowLayout);}
focusStartButton(){this._startButton.focus();}
setStartButtonEnabled(isEnabled){if(this._helpText){this._helpText.classList.toggle('hidden',isEnabled);}
if(this._startButton){this._startButton.disabled=!isEnabled;}}
setUnauditableExplanation(text){if(this._helpText){this._helpText.textContent=text;}}}