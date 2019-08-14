class TreeManager {


    constructor(string) {
        this.string = string;
    }

    async init(self) {
        await TreeSitter.init();

        self.parser = new TreeSitter();

        await self.handleLanguageChange(self, "javascript");
    }

    async handleLanguageChange(self, newLanguageName) {
        var language;

        const url = `./tree-sitter/tree-sitter-${newLanguageName}.wasm`
        try {
            language = await TreeSitter.Language.load(url);
        } catch (e) {
            console.error(e);
            return
        }

        self.parser.setLanguage(language);
        self.tree = null;
    }

    parse(newString) {
        let start = performance.now();

        this.tree = this.parser.parse(newString + '\n', this.tree);
        const duration = (performance.now() - start).toFixed(1);
        console.log(`parsed in ${duration} ms`);
        this.parseCount++;
    }

    buildTree() {
        const cursor = this.tree.walk();
        let nodeObject = [];
        let childCount = 0;
    
        let name, rootnode = recursivelyBuild(cursor, nodeObject, childCount);
    
        return rootnode;
    }

}



function recursivelyBuild(cursor, node, childCount) {

    //we enter into this level as the first node on the left
    let firstNode = buildNode(cursor, childCount);
    
    //the first node
    

    if(cursor.gotoFirstChild())
    {
        firstNode.children = [];
        firstNode.children = recursivelyBuild(cursor, firstNode.children, 0);

        cursor.gotoParent();
    }

    node.push(firstNode);
    childCount++;

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

    const start = cursor.startPosition;
    const end = cursor.endPosition;
    const id = cursor.nodeId;

    let fieldName = cursor.currentFieldName();
    if (!fieldName) {
        fieldName = '';
    }

    if(displayName == undefined) displayName = childCount.toString();

    return { 
        displayName: displayName, 
        fieldName: fieldName, 
        range: { start: start, end: end }, 
        indexRange : { start : cursor.startIndex, end : cursor.endIndex },
        id: id 
    };
}

function buildHTMLNode(node)
{


    let nodeString ="";

}
