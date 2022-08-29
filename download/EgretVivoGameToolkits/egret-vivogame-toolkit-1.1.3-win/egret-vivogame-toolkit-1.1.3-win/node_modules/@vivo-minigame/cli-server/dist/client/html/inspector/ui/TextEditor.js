import*as Common from'../common/common.js';import*as TextUtils from'../text_utils/text_utils.js';import{AnchorBehavior}from'./GlassPane.js';import{Suggestions}from'./SuggestBox.js';import{Widget}from'./Widget.js';export class TextEditorFactory{createEditor(options){}}
export class TextEditor extends Common.EventTarget.EventTarget{widget(){}
fullRange(){}
selection(){}
setSelection(selection){}
text(textRange){}
textWithCurrentSuggestion(){}
setText(text){}
line(lineNumber){}
newlineAndIndent(){}
addKeyDownHandler(handler){}
configureAutocomplete(config){}
clearAutocomplete(){}
visualCoordinates(lineNumber,columnNumber){}
tokenAtTextPosition(lineNumber,columnNumber){}
setPlaceholder(placeholder){}}
export const Events={CursorChanged:Symbol('CursorChanged'),TextChanged:Symbol('TextChanged'),SuggestionChanged:Symbol('SuggestionChanged')};export let Options;export let AutocompleteConfig;