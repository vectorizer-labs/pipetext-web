export function debugNode(cursor, srcString)
{
    if(cursor.currentNode().hasChanges()) console.log(`node : ${cursor.nodeType} , id : ${ cursor.nodeId }`);


    //if the parentNode has children go get them!
    if(cursor.gotoFirstChild())
    {
        debugNode(cursor, srcString)

        while(cursor.gotoNextSibling())
        {
            debugNode(cursor, srcString)
        }

        cursor.gotoParent();
    }
}