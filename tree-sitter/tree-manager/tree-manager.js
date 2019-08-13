class TreeManager {


    constructor(string) {
        this.string = string;

        this.init(this).then((p) => console.log("Initialized"));
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

        self.parse(self, self.string, null)
    }

    async parse(self, newString, tree) {
        let start = performance.now();

        const newTree = self.parser.parse(newString + '\n');
        const duration = (performance.now() - start).toFixed(1);
        console.log(`${duration} ms`);
        if (tree) tree.delete();
        tree = newTree;
        self.parseCount++;
        console.log(buildTree(tree));
    }

}

function buildTree(tree) {
    const cursor = tree.walk();
    let nodeObject = {};
    let childCount = 0;

    let name, rootnode = recursivelyBuild(cursor, nodeObject, childCount);

    return rootnode;
}

function recursivelyBuild(cursor, node, childCount) {

    //we enter into this level as the first node on the left
    let firstNode = buildNode(cursor, childCount);
    
    //the first node
    node[firstNode.displayName] = firstNode;
    childCount++;

    if(cursor.gotoFirstChild())
    {
        let childObject = {}
        let childName = "";
        childName , childObject = recursivelyBuild(cursor, childObject, 0);
        node[childName] = childObject;

        cursor.gotoParent();
    }

    if(cursor.gotoNextSibling())
    {  
        let siblingName;
        siblingName, node = recursivelyBuild(cursor, node, childCount);
    }else
    {
        cursor.gotoParent();
    }

    return name, node;
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