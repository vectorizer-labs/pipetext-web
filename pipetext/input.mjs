export async function handle_input(self)
{
    let newText = self.codeDiv.textContent;

    let cursorIndex = getCaretCharacterOffsetWithin(self.codeDiv);

    let diff = getDiffOrigin(self.lastTextContent, newText, cursorIndex);

    //console.log(diff);

    let length = Math.max(0, newText.length - self.lastTextContent.length);

    let startLines = self.lastTextContent.substring(0, diff[0]).split(/\r\n|\r|\n/);
    let endLines = self.lastTextContent.substring(0, diff[1]).split(/\r\n|\r|\n/);

    let startRow = startLines.length-1;
    let endRow = endLines.length-1;

    let startColumn = startLines[startRow].length;
    let endColumn = endLines[endRow].length;

    let deltaRow = diff[2].split(/\r\n|\r|\n/);
    let deltaRowLength = deltaRow.length - 1;

    //if we're on the same line add the length
    let deltaColumn = (deltaRowLength > 0) ?  length : startColumn + length;

    let edit = {
        startIndex: diff[0],
        oldEndIndex: diff[1],
        newEndIndex: diff[0] + diff[2].length,
        startPosition: {row: startRow, column: startColumn},
        oldEndPosition: {row: endRow, column: endColumn },
        newEndPosition: {row: startRow + deltaRowLength, column: deltaColumn},
    };

    //console.log(edit);

    //console.log(cursorIndex);

    await self.tree.edit(edit); 

    if(self.lastTree)
    {
        console.log("TREE");
        console.log(self.lastTree);
        let changes = await self.tree.getChangedRanges(self.lastTree); 
        console.log(changes);
    }
    

    await self.refreshState(self, cursorIndex);

    placeCursorBack();

}

function placeCursorBack()
{
    let cursorDiv = document.getElementById("cursorDiv");
    //console.log(cursorDiv);
    var range = document.createRange();

    let content  = cursorDiv.childNodes[0];

    range.setStart(content, cursorDiv.getAttribute("cursor-offset"));
    range.collapse(true);

    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);   
}

function clearSelectionPFill()
{
    if (window.getSelection) {
        if (window.getSelection().empty) {  // Chrome
          window.getSelection().empty();
        } else if (window.getSelection().removeAllRanges) {  // Firefox
          window.getSelection().removeAllRanges();
        }
     } else if (document.selection) {  // IE?
       document.selection.empty();
     }
}


function getDiffOrigin(oldText, newText, cursor) {
    var delta = newText.length - oldText.length;
    var limit = Math.max(0, cursor - delta);
    var end = oldText.length;
    while (end > limit && oldText.charAt(end - 1) == newText.charAt(end + delta - 1)) {
        end -= 1;
    }
    var start = 0;
    var startLimit = cursor - Math.max(0, delta);
    while (start < startLimit && oldText.charAt(start) == newText.charAt(start)) {
        start += 1;
    }
    return [start, end, newText.slice(start, end + delta)];
}

function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            //console.log("big gainz!");
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.startContainer, range.startOffset);
            return preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}

function debugPrintString(lineString)
{
    let numString = "";
    for(var i =0; i < lineString.length; i++)
    {
        numString += "" + i + "";
    }

    console.log(numString + "\r\n" + lineString);

}