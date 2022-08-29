import*as Common from'../common/common.js';import*as Host from'../host/host.js';import*as UI from'../ui/ui.js';import{releaseNoteText}from'./ReleaseNoteText.js';export const releaseNoteViewId='release-note';export function latestReleaseNote(){if(!Help._latestReleaseNote){Help._latestReleaseNote=(self.Help.releaseNoteText||releaseNoteText).reduce((acc,note)=>note.version>acc.version?note:acc);}
return Help._latestReleaseNote;}
export function showReleaseNoteIfNeeded(){innerShowReleaseNoteIfNeeded(Help._releaseNoteVersionSetting.get(),latestReleaseNote().version,self.Common.settings.moduleSetting('help.show-release-note').get());}
export function innerShowReleaseNoteIfNeeded(lastSeenVersion,latestVersion,showReleaseNote){if(!lastSeenVersion){Help._releaseNoteVersionSetting.set(latestVersion);return;}
if(!showReleaseNote){return;}
if(lastSeenVersion>=latestVersion){return;}
Help._releaseNoteVersionSetting.set(latestVersion);self.UI.viewManager.showView(releaseNoteViewId,true);}
export class HelpLateInitialization{async run(){if(!Host.InspectorFrontendHost.isUnderTest()){showReleaseNoteIfNeeded();}}}
export class ReleaseNotesActionDelegate{handleAction(context,actionId){Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab(latestReleaseNote().link);return true;}}
export class ReportIssueActionDelegate{handleAction(context,actionId){Host.InspectorFrontendHost.InspectorFrontendHostInstance.openInNewTab('https://bugs.chromium.org/p/chromium/issues/entry?template=DevTools+issue');return true;}}