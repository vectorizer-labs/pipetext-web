export function buildHTMLNode2(cursor, srcString, self)
{
    //we enter into this level as the first node on the left
    var firstNode = buildNode(cursor, srcString, self);

    //We need to go to the first child before passing down to the buildHTMLNode2 recursively
    if(cursor.gotoFirstChild())
    {
        var last_child = buildHTMLNode2(cursor, srcString, self);

        if(firstNode.getAttribute("startIndex"))
        {
            firstNode.appendChild(document.createTextNode(srcString.substring(
                firstNode.getAttribute("startIndex")
                ,cursor.startIndex)));
        }

        //cursor is now at first child so we pass it down
        firstNode.appendChild(last_child);

        while(cursor.gotoNextSibling())
        {  
            //determine if a space exists between the last_child and this child
            if(last_child.getAttribute("endIndex"))
            {
                firstNode.appendChild(document.createTextNode(srcString.substring(
                    last_child.getAttribute("endIndex")
                    ,cursor.startIndex)));

            }

            last_child = buildHTMLNode2(cursor, srcString, self);
            
            //append all the relevant 
            firstNode.appendChild(last_child);
        }

        cursor.gotoParent();

        //determine if a space exists between the last_child and this child
        if(last_child.getAttribute("endIndex"))
        {
            firstNode.appendChild(document.createTextNode(srcString.substring(
                last_child.getAttribute("endIndex")
                ,cursor.endIndex)));
        }

    } else firstNode.innerText = srcString.substring(cursor.startIndex, cursor.endIndex);
    
    return firstNode;   
}

function buildNode(cursor, srcString, self)
{
    let displayName;
    if (cursor.nodeIsMissing) {
        displayName = `MISSING ${cursor.nodeType}`;
    } else if (cursor.nodeIsNamed) {
        displayName = cursor.nodeType;
    }

    const start = cursor.startPosition;
    const end = cursor.endPosition;
    const id = cursor.nodeId;

    let fieldName = cursor.currentFieldName();
    if (!fieldName) fieldName = '';

    let range = { start: start, end: end };
    let indexRange = { start : cursor.startIndex, end : cursor.endIndex };

    let HTMLNode = (displayName == undefined) ? 
        getInbetweenTags(srcString, cursor.startIndex, cursor.endIndex, null) : 
        document.createElement(displayName);

    HTMLNode.contentEditable = true;
    
    HTMLNode.setAttribute("fieldName", fieldName);

    //ROW
    HTMLNode.setAttribute("startRow", start.row);
    HTMLNode.setAttribute("endRow", end.row);

    //COLUMN
    HTMLNode.setAttribute("startColumn", start.column);
    HTMLNode.setAttribute("endColumn", end.column);

    //INDICES
    HTMLNode.setAttribute("startIndex", cursor.startIndex);
    HTMLNode.setAttribute("endIndex", cursor.endIndex);

    HTMLNode.setAttribute("nodeId", id);

    return HTMLNode;
}

function getInbetweenTags(srcString, start, end, cursorIndex)
{
    let betweenBits = srcString.substring(start,end);

    if(betweenBits != "")
    {
        let tag = betweenBits.trim();
        tag = matchToken[tag];
 
        //console.log("'"+betweenBits+"'");

        let HTMLNode = document.createElement(tag);

        HTMLNode.textContent = betweenBits;

        /*
        let isCursorDiv = cursorIndex >= start && cursorIndex < end;

        if(isCursorDiv) 
        { 
            console.log("start : " + start + " end : " + end); 
            let localOffset = Math.min(0,(cursorIndex - start));

            HTMLNode.setAttribute("id", 'cursorDiv');
            HTMLNode.setAttribute("cursor-offset", localOffset);
        }*/

        return HTMLNode;
    }
    
    return document.createTextNode("");

}

const matchToken = 
{
    "{" : "open_bracket",
    "}" : "close_bracket",
    ";" : "semicolon",
    "," : "comma",
    '"' : "quote",
    "import" : "import",
    "from" : "from",
    "export" : "export",
    "default" : "default",
    "if" : "if",
    "const" : "const",
    "static" : "static",
    "return" : "return"
}