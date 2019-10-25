export async function handle_input(self, mutation)
{
    let start, end, startRow, startColumn, endRow, endColumn;
    let element = mutation.target; 

    //If we're in a text node we need to find out our starting index
    if( element.nodeType === Node.TEXT_NODE) 
    {

    }
    else
    {
        //otherwise we just get it straight from the node
        start = element.getAttribute("startindex");
        end = element.getAttribute("endindex");

        startRow = element.getAttribute("startrow");
        startColumn = element.getAttribute("startcolumn");
        endRow = element.getAttribute();
        endColumn = element.getAttribute();
    }

    let initalTextLength = (end - start);

    await self.tree.edit({
        startIndex: start,
        oldEndIndex: end,
        newEndIndex: start + element.textContent.length,
        startPosition: {row: 0, column: 0},
        oldEndPosition: {row: 0, column: 3},
        newEndPosition: {row: 0, column: 5},
      });

}















export async function input_handler(self, event)
{
    let start = performance.now();
    let beginningOffset = getCaretCharacterOffsetWithin(self.codeDiv);
    let diff = getDiff(self.lastTextContent, self.codeDiv.textContent, beginningOffset);

    findElementFromRange(self,diff);

    let ops = diffToOps(diff, self.docState);
    // apply ops locally
    for (var i = 0; i < ops.length; i++) {
        self.docState.add(ops[i]);
    }
    
    //console.log('ops:' + JSON.stringify(ops));
    //console.log('docstate: ' + self.docState.get_str());

    await self.refreshState(self.codeDiv.firstChild, beginningOffset);

    /*
    

    //console.log(beginningOffset);
    await self.refreshState(self, beginningOffset);
      
    let cursorDiv = document.getElementById("cursorDiv");
    let localOffset = cursorDiv.getAttribute("cursor-offset");

    let range = document.createRange();
    range.setStart(cursorDiv, localOffset);
    range.setEnd(cursorDiv, localOffset);
    
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    const duration = (performance.now() - start).toFixed(1);
    console.log(`parsed in ${duration} ms`);

    self.lastTextContent = self.codeDiv.textContent;
      */
}

function findElementFromRange(beginningElement, endElement, range)
{
    let start = beginningElement.getAttribute("startIndex");
    let end = endElement.getAttribute("endIndex");

    //if the range we're looking for is inside the currentElement then we need to descend
    if(start <= range[0] && end >= range[1])
    {
        return [beginningElement, endElement];
    }
    //if the range we're looking for is inside the currentElement then we need to descend
    else if(start <= range[0] && end >= range[1] && beginningElement === endElement)
    {
        return findElementFromRange(
            beginningElement.firstChild, 
            beginningElement.lastChild,
            range);
    }

    //TODO HANDLE THE CONTRCTIVE SEARCH INSIDE CHILDREN
    //the range lands in the parent node or previous sibling
    // and the end is inside this node
    else if(start > range[0] && end >= range[1])
    {
        return currentElement.parentElement;
    }
    //the range start is inside this node but the range end is outside 
    else if(start <= range[0] && end < range[1])
    {
        
    }else /*if (start > range[0] && end < range[1]) */{

    } 
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