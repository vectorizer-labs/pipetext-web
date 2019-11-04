export function buildTree(cursor, srcString, self, cursorIndex)
{
        
    let logicalNode = buildLogicalNode(cursor);
    logicalNode.HTMLNode = buildHTMLNode(cursor);

    if(cursor.currentNode().childCount > 0)
    {
        logicalNode.children = getChildren(cursor, logicalNode);
    }


    return logicalNode;
}

function getChildren(cursor, parentNode)
{

    if(!cursor.gotoFirstChild()) console.error("try to get child but this node has no children.");

    let firstChild = buildLogicalNode(cursor);

    //TODO make whitespace logical Node
    parentNode.HTMLNode.appendChild(document.createTextNode(srcString.substring(
                parentNode.startIndex
                ,cursor.startIndex)));

    //cursor is now at first child so we pass it down
    parentNode.HTMLNode.appendChild(firstChild);

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

function buildLogicalNode(cursor)
{
    let logicalNode = {};

    logicalNode.displayName = cursor.nodeIsNamed ? cursor.nodeType : undefined;

    logicalNode.hasError = cursor.currentNode().hasError();

    logicalNode.fieldName = cursor.currentFieldName();

    logicalNode.isMissing = cursor.nodeIsMissing;

    logicalNode.HTMLNode = buildHTMLNode(cursor);
    
    return logicalNode;
}

function buildHTMLNode(cursor,)
{

    let displayName = cursor.nodeIsNamed ? cursor.nodeType : undefined;

    let HTMLNode = (displayName == undefined) ? 
        getInbetweenTags(srcString, cursor.startIndex, cursor.endIndex, null) : 
        document.createElement(displayName);

    return HTMLNode;
}

function getInbetweenTags(srcString, start, end)
{
    let betweenBits = srcString.substring(start,end);

    let tag = betweenBits.trim();
    tag = matchToken[tag];

    let HTMLNode = document.createElement(tag);

    HTMLNode.textContent = betweenBits;

    return HTMLNode;
}