export async function handle_input(self)
{
    //if(mutation.type == "childList") return;
    //console.log(mutation);

    let cursorIndex = getCaretCharacterOffsetWithin(self.codeDiv);

    //let edit = getEditFromElement(self, mutation);
    let diff = getDiff(self.lastTextContent, self.codeDiv.textContent,cursorIndex);

    console.log(diff);

    let startLines = self.lastTextContent.substring(0, diff[0]).split(/\r\n|\r|\n/);
    let endLines = self.lastTextContent.substring(0, diff[1]).split(/\r\n|\r|\n/);

    let startRow = startLines.length-1;
    let endRow = endLines.length-1;

    let startColumn = startLines[startRow-1].length-1;
    let endColumn = endLines[endRow-1].length-1;

    let deltaRow = diff[2].split(/\r\n|\r|\n/);
    let deltaRowLength = deltaRow.length - 1;

    let length = deltaRow[deltaRowLength].length-1;

    //if we're on the same line add the length
    let deltaColumn = (deltaRowLength > 0) ?  length : startColumn + length;

    let edit = {
        startIndex: diff[0],
        oldEndIndex: diff[1],
        newEndIndex: diff[1] + diff[2].length,
        startPosition: {row: startRow, column: startColumn},
        oldEndPosition: {row: endRow, column: endColumn},
        newEndPosition: {row: startRow + deltaRowLength, column: startColumn + deltaColumn },
    };

    //printEditString(self.codeDiv,edit);

    console.log(edit);

    await self.tree.edit(edit); 
    await self.refreshState(self);

    //put back cursor
}

function getDiff(oldText, newText, cursor) {
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
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
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



var pri = Math.floor(Math.random() * 0x1000000);
var ser = 0;
function getid() {
    return (pri * 0x100000) + ser++;
}

function diffToOps(diff, docState) {
    var start = diff[0];
    var end = diff[1];
    var newstr = diff[2];
    var result = [];
    for (var i = start; i < end; i++) {
        result.push({pri: pri, ty: 'del', ix: docState.xform_ix(i), id: getid()});
    }
    var ix = docState.xform_ix(end);
    for (var i = 0; i < newstr.length; i++) {
        result.push({pri: pri, ty: 'ins', ix: ix + i, id: getid(), ch: newstr.charAt(i)});
    }
    return result;
}