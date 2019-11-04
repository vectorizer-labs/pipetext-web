export function buildHTMLNode2(cursor, srcString, self, cursorIndex)
{
    //we enter into this level as the first node on the left
    var firstNode = buildNode(cursor, srcString, self, cursorIndex);
    if(firstNode == null) return null;

    firstNode = processTextNode(cursor, srcString, firstNode, cursorIndex);

    //if(firstNode.nodeType == Node.TEXT_NODE) return firstNode;

    //We need to go to the first child before passing down to the buildHTMLNode2 recursively
    if(cursor.gotoFirstChild())
    {
        var last_child = buildHTMLNode2(cursor, srcString, self, cursorIndex);

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

            last_child = buildHTMLNode2(cursor, srcString, self, cursorIndex);
            
            //append all the relevant 
            if (last_child != null) firstNode.appendChild(last_child);
        }

        cursor.gotoParent();

        //determine if a space exists between the last_child and the end of the parent
        if(last_child != null && last_child.getAttribute("endIndex"))
        {
            firstNode.appendChild(document.createTextNode(srcString.substring(
                last_child.getAttribute("endIndex")
                ,cursor.endIndex)));
        }
    }
    
    return firstNode;   
}

function buildNode(cursor, srcString, self, cursorIndex)
{

    let displayName = cursor.nodeIsNamed ? cursor.nodeType : undefined;

    if(cursor.currentNode().hasError())
    {
        console.error("Current Node has error!");
        //console.log(cursor.currentNode());
    }

    const start = cursor.startPosition;
    const end = cursor.endPosition;
    const id = cursor.nodeId;

    

    let HTMLNode = (displayName == undefined) ? 
        getInbetweenTags(srcString, cursor.startIndex, cursor.endIndex, null) : 
        document.createElement(displayName);

    let fieldName = cursor.currentFieldName();
    if (fieldName) HTMLNode.setAttribute("fieldName", fieldName);

    //in case a node is deleted
    if (HTMLNode.nodeType == Node.TEXT_NODE) console.log(cursor);

    if (cursor.nodeIsMissing)
    {
        //console.log("MISSING");
        //console.log(cursor);
        HTMLNode.id == "missing";
        return null;
    }
    
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

function processTextNode(cursor, srcString, HTMLNode, cursorIndex)
{
    //console.log(cursorIndex);
    let isCursorDiv = (cursorIndex >= cursor.startIndex) && (cursorIndex < cursor.endIndex);
    let hasNoChildren = cursor.currentNode().childCount == 0;
    
    //BUILD THE TEXT CONTENT OF THE NODE
    //Only if this node has no children
    if(isCursorDiv && hasNoChildren) 
    { 
        console.log("start : " + cursor.startIndex + " end : " + cursor.endIndex); 
        let localOffset = cursorIndex - cursor.startIndex;

        let cursorSelect = document.createElement("cursor");
        cursorSelect.id = "cursorDiv";
        cursorSelect.setAttribute("cursor-offset", localOffset);

        cursorSelect.textContent = srcString.substring(cursor.startIndex, cursor.endIndex);

        HTMLNode.appendChild(cursorSelect);
    } 
    //If the node has no children then the content is just text
    else if(hasNoChildren)
    {
        HTMLNode.textContent = srcString.substring(cursor.startIndex, cursor.endIndex);
    }

    return HTMLNode;
}

function getInbetweenTags(srcString, start, end)
{
    let betweenBits = srcString.substring(start,end);

    if(betweenBits != "")
    {
        let tag = betweenBits.trim();
        tag = matchToken[tag];

        let HTMLNode = document.createElement(tag);

        HTMLNode.textContent = betweenBits;

        return HTMLNode;
    }
    
    return document.createTextNode("");

}

const matchToken = 
{
    "{" : "open_bracket",
    "}" : "close_bracket",
    "(" : "open_paren",
    ")" : "close_paren",
    ";" : "semicolon",
    ":" : "colon",
    "," : "comma",
    '"' : "quote",
    "while" : "while",
    "import" : "import",
    "from" : "from",
    "export" : "export",
    "default" : "default",
    "if" : "if",
    "const" : "const",
    "static" : "static",
    "return" : "return",
    "function" : "function_keyword"
}