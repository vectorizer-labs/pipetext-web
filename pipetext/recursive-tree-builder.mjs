export function build_node(node, srcString, cursorIndex)
{
    //get the tagName for this node
    //if it has no 
    let tagName = node.isNamed() ? node.type : getTag(node);

    let htmlNode = document.createElement(tagName);

    setHTMLAttributes(htmlNode, node, cursorIndex);
    
    //the node has no children so set the textContent and return
    if(node.childCount == 0)
    { 
        htmlNode.textContent = node.text;
        return htmlNode;
    }

    let children = node.children;

    let last_child = undefined;

    children.forEach(child =>
    {
        let new_child = build_node(child, srcString, cursorIndex);

        if(last_child)
        {
            let new_whitespace = document.createElement("whitespace");

            let start = last_child.endIndex;
            let end = new_child.startIndex;

            setCursorDiv(new_whitespace, cursorIndex, start, end)

            new_whitespace.textContent = srcString.substring(start, end );
            htmlNode.appendChild(new_whitespace);
        }

        htmlNode.appendChild(new_child);

        last_child = new_child;
    });

    return htmlNode;
}

function setHTMLAttributes(htmlNode, node, cursorIndex)
{
    htmlNode.start = node.startPosition;
    htmlNode.end = node.endPosition;

    htmlNode.startIndex = node.startIndex;
    htmlNode.endIndex = node.endIndex;

    htmlNode.setAttribute("id", node.id);

    if(node.childCount == 0) setCursorDiv(htmlNode, cursorIndex, node.startIndex, node.endIndex)
}

function setCursorDiv(htmlNode, cursorIndex, start, end)
{
    if(cursorIndex >= start && cursorIndex < end)
    {
        htmlNode.id = "cursorDiv";
        htmlNode.cursorOffset = cursorIndex-start;
    }
}

function getTag(node)
{
    let betweenBits = node.text;
    let tag = betweenBits.trim();
    tag = matchToken[tag];

    return tag;
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