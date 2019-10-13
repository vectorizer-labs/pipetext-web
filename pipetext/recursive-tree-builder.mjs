export function recursivelyBuild(cursor, node, childCount) {

    //we enter into this level as the first node on the left
    let firstNode = buildNode(cursor, childCount);
    //the first node

    if(cursor.gotoFirstChild())
    {
        firstNode.children = [];
        firstNode.children = recursivelyBuild(cursor, firstNode.children, 0);

        cursor.gotoParent();
    }

    if(firstNode) { node.push(firstNode); childCount++; }

    if(cursor.gotoNextSibling())
    {  
        node = recursivelyBuild(cursor, node, childCount);
    }

    return node;
}

function buildNode(cursor, childCount)
{
    let displayName;
    if (cursor.nodeIsMissing) {
        displayName = `MISSING ${cursor.nodeType}`
    } else if (cursor.nodeIsNamed) {
        displayName = cursor.nodeType;
    }

    if(displayName == undefined) return null;

    const start = cursor.startPosition;
    const end = cursor.endPosition;
    const id = cursor.nodeId;

    let fieldName = cursor.currentFieldName();
    if (!fieldName) fieldName = '';

    return { 
        displayName: displayName, 
        fieldName: fieldName, 
        range: { start: start, end: end }, 
        indexRange : { start : cursor.startIndex, end : cursor.endIndex },
        id: id 
    };
}

export function buildHTMLNode(parentNode, srcString, cursorIndex)
{
    //open the node
    let nodeString = "";
    let cursorString = "";
    if(parentNode.children)
    {
        parentNode.children.sort(function(a, b){ return a.indexRange.start - b.indexRange.start });

        let lastNode = { indexRange : { end : parentNode.indexRange.start} };

        parentNode.children.forEach(n => 
        {

            nodeString += getInbetweenTags(srcString, lastNode.indexRange.end, n.indexRange.start,cursorIndex);
            nodeString += buildHTMLNode(n, srcString, cursorIndex);

            lastNode = n;
        });

        nodeString += getInbetweenTags(srcString, lastNode.indexRange.end,parentNode.indexRange.end,cursorIndex);
    }
    else nodeString += srcString.substring(parentNode.indexRange.start,parentNode.indexRange.end);

    let beginningDiv = parentNode.displayName + " ";

    if(cursorString !== "") { beginningDiv += cursorString; console.log(parentNode.displayName);}
    //close the node
    return "<" + beginningDiv + " >" + nodeString + "</"+parentNode.displayName+">";
}

function getInbetweenTags(srcString, start, end, cursorIndex)
{
    let betweenBits = srcString.substring(start,end);
    let localString = "";

    let isCursorDiv = cursorIndex >= start && cursorIndex < end;

    let cursorString = isCursorDiv? `id = 'cursor-div' start-index = '${ start }'` : "";

    if(betweenBits != "")
    {
        let tag = betweenBits.trim();
        tag = matchToken[tag];
        localString +='<'+ tag + cursorString + '>' + betweenBits + '</' + tag + '>';
    } 

    return localString;
}

const matchToken = 
{
    "{" : "open_bracket",
    "}" : "close_bracket",
    "import" : "import",
    "from" : "from",
    "export default" : "export",
    "if" : "if",
    "const" : "const",
    "static" : "static",
    "return" : "return"
 
}

function getRandomColor() 
{
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}