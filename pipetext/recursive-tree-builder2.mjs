export function buildNode(cursor, srcString, cursorIndex)
{
    if (cursor.nodeIsMissing) return null;

    let parentNode = buildLogicalNode(cursor, srcString,cursorIndex);

    //if the parentNode has children go get them!
    if(cursor.gotoFirstChild()){
        parentNode.children = [];
        let childIndex = 0;

        parentNode.children.push(buildNode(cursor, srcString, cursorIndex));
        childIndex += 1;

        while(cursor.gotoNextSibling())
        {  
            let last_sibling = parentNode.children[childIndex-1];

            //determine if a space exists between the last_sibling and this child
            if(last_sibling != null && last_sibling.endIndex != undefined)
            {
                let whiteSpaceDiv = processWhitespace(srcString, last_sibling.endIndex, cursor.startIndex, cursorIndex);
                //console.log(whiteSpaceDiv);
                //if(whiteSpaceDiv == null) console.log(`Indices start : ${ last_sibling.endIndex } end : ${ cursor.startIndex }`);
                if(whiteSpaceDiv){ parentNode.children.push(whiteSpaceDiv);childIndex += 1;}
                
            }

            parentNode.children.push(buildNode(cursor, srcString, cursorIndex));
            
            childIndex += 1;
        }

        cursor.gotoParent();

        let last_sibling = parentNode.children[childIndex-1];

        //determine if a space exists between the last_sibling and the end of the parent
        if(last_sibling != null && last_sibling.endIndex != undefined)
        {
            let whiteSpaceDiv = processWhitespace(srcString, last_sibling.endIndex, cursor.endIndex, cursorIndex);
            if(whiteSpaceDiv) parentNode.children.push(whiteSpaceDiv);
        }

        for (var i = 0; i < parentNode.children.length; i++)
        {
            if(parentNode.children[i] != null)
            {
                parentNode.HTMLNode.appendChild(parentNode.children[i].HTMLNode);
            }
            
        } 
    }
    
    return parentNode;

}

function buildLogicalNode(cursor, srcString, cursorIndex)
{
    const start = cursor.startPosition;
    const end = cursor.endPosition;

    //Set up some attributes
    let logicalNode = {};

    logicalNode.endIndex = cursor.endIndex;
    logicalNode.startIndex = cursor.startIndex;

    logicalNode.start = start;
    logicalNode.end = end;

    logicalNode.hasNoChildren = cursor.currentNode().childCount == 0;

    logicalNode.displayName = cursor.nodeIsNamed ? cursor.nodeType : undefined;

    logicalNode.hasError = cursor.currentNode().hasError();

    logicalNode.fieldName = cursor.currentFieldName();

    logicalNode.isMissing = cursor.nodeIsMissing;

    //Build the HTML
    logicalNode.HTMLNode = buildHTMLNode(cursor, srcString, logicalNode.hasNoChildren, cursorIndex);
    
    return logicalNode;
}

function buildHTMLNode(cursor, srcString, hasNoChildren, cursorIndex)
{
    let displayName = cursor.nodeIsNamed ? cursor.nodeType : undefined;

    let HTMLNode = (displayName == undefined) ? getTag(srcString, cursor.startIndex, cursor.endIndex, null) : document.createElement(displayName);

    
    let isCursorDiv = (cursorIndex >= cursor.startIndex) && (cursorIndex < cursor.endIndex);
    //BUILD THE TEXT CONTENT OF THE NODE
    //Only if this node has no children
    if(isCursorDiv && hasNoChildren) 
    { 
        //console.log("start : " + cursor.startIndex + " end : " + cursor.endIndex); 
        let localOffset = cursorIndex - cursor.startIndex;

        HTMLNode.id = "cursorDiv";
        HTMLNode.setAttribute("cursor-offset", localOffset);
    }

    if(hasNoChildren) HTMLNode.textContent = srcString.substring(cursor.startIndex, cursor.endIndex);

    return HTMLNode;
}

function processWhitespace(srcString, startIndex, endIndex, cursorIndex)
{
    let logicalNode = {};

    let whiteSpaceDiv = document.createElement("whitespace");
    let whitespaceString = srcString.substring(startIndex, endIndex);

    //console.log(`Indices : ${ startIndex } : ${ endIndex }`);

    if(whitespaceString != "")
    {
        whiteSpaceDiv.textContent = whitespaceString;

        //console.log(cursorIndex);
        let isCursorDiv = (cursorIndex >= startIndex) && (cursorIndex < endIndex);
        
        //add cursor attributes if this is the cursor div
        if(isCursorDiv) 
        { 
            //console.log("start : " + startIndex + " end : " + endIndex); 
            let localOffset = cursorIndex - startIndex;

            whiteSpaceDiv.id = "cursorDiv";
            whiteSpaceDiv.setAttribute("cursor-offset", localOffset);
        }

        logicalNode.HTMLNode = whiteSpaceDiv;
        
        return logicalNode;
    }
    return null;
    
}

function getTag(srcString, start, end)
{
    let betweenBits = srcString.substring(start,end);

    let tag = betweenBits.trim();
    tag = matchToken[tag];

    let HTMLNode = document.createElement(tag);

    return HTMLNode;
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