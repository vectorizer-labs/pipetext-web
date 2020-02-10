import { buildNode } from "./recursive-tree-builder4.mjs";

//import { updateNode } from "./recursive-tree-editor.mjs";

import { Docstate } from "./ot-core.mjs";

import { handle_input } from "./input.mjs";

class PipeText
{
    constructor(div)
    {
        this.div = div;
        
        //create lineNums div
        this.lineDiv = document.createElement('lines');
        this.lineDiv.contentEditable = false;
        
        //move initial text to code div
        this.codeDiv = document.createElement('code');
        this.codeDiv.contentEditable = true;
        this.codeDiv.style = "white-space: pre;"
        this.codeDiv.innerHTML = this.div.innerHTML;

        this.div.innerHTML = "";

        this.div.appendChild(this.lineDiv);
        this.div.appendChild(this.codeDiv);

        this.lastTextContent = this.codeDiv.textContent;

        //this.docState = new Docstate(this.lastTextContent);

        //this.init_listener_hacks()

        let self = this;

        //make sure plain text only is pasted
        this.codeDiv.addEventListener("input", function(e) 
        {
            //console.log(e);
            handle_input(self);
        });

        this.init(self, "javascript").then((p) => console.log("initialized"));

    }

    async init(self, language)
    {
        await TreeSitter.init();

        self.parser = new TreeSitter();

        const url = `tree-sitter/tree-sitter-${language}.wasm`;

        try { language = await TreeSitter.Language.load(url); } 
        catch (e) { console.error(e); return; }

        self.parser.setLanguage(language);
        self.tree = null;
        self.last_tree = null;

        await self.initState(self);
    }

    async initState(self, cursorIndex)
    {
        //console.log(cursorIndex);
        var t0 = performance.now(); 

        await self.incremental_parse(self);

        var t1 = performance.now();
        //console.log("Parse took " + (t1 - t0) + " milliseconds.");

        let lineNumbers = self.tree.rootNode.endPosition.row;

        await self.initializeCodeTree(self, cursorIndex);
        await self.refreshLineNums(lineNumbers,self);

        var t2 = performance.now();
        //console.log("Rebuild took " + (t2 - t1) + " milliseconds.");

        console.log("Total " + (t2 - t0) + " milliseconds.");
    }

    async refreshState(self, cursorIndex)
    {
        //console.log(cursorIndex);
        var t0 = performance.now();

        self.lastTextContent = self.codeDiv.textContent;

        await self.incremental_parse(self);

        var t1 = performance.now();
        console.log("Parse took " + (t1 - t0) + " milliseconds.");

        let lineNumbers = self.tree.rootNode.endPosition.row;

        console.log(self.last_tree.getChangedRanges(self.tree));

        await self.refreshCodeTree(self, cursorIndex);

        await self.refreshLineNums(lineNumbers,self);

        var t2 = performance.now();
        console.log("Rebuild took " + (t2 - t1) + " milliseconds.");

        console.log("Total " + (t2 - t0) + " milliseconds.");

        
    }

    async parse(self) { self.tree = self.parser.parse(self.lastTextContent, self.tree); }

    async incremental_parse(self) 
    { 
        if(self.tree) self.last_tree = self.tree; 
        self.tree = self.parser.parse(self.lastTextContent, self.last_tree);
    }

    async initializeCodeTree(self, cursorIndex)
    {
        //4
        let nodeTree = buildNode(self.tree.rootNode, self.lastTextContent, cursorIndex);

        self.codeDiv.innerHTML = "";

        self.codeDiv.appendChild(nodeTree);

        self.lastTextContent = self.codeDiv.textContent;
    }

    async refreshCodeTree(self, cursorIndex)
    {
        //4
        //let nodeTree = updateNode(self.tree.rootNode,self.last_tree.rootNode, self.lastTextContent);

        let nodeTree = buildNode(self.tree.rootNode, self.lastTextContent, cursorIndex);

        self.codeDiv.innerHTML = "";
        self.codeDiv.appendChild(nodeTree);
    }

    async refreshLineNums(lines,self)
    {
        self.lineDiv.innerHTML = "";
        for(var i = 0; i <= lines-1; i++)
        {
            let line = document.createElement('line');
            line.textContent = (i+1).toString();
            self.lineDiv.appendChild(line);
        }
    }
}

function getSelectionRangeWithin(element) {
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    sel = win.getSelection();
    if (sel.rangeCount > 0) 
    {
        var range = win.getSelection().getRangeAt(0);
        var preCaretRange = range.cloneRange();

        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        let startIndex = preCaretRange.toString().length;
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        let endIndex = preCaretRange.toString().length;

        return [startIndex,endIndex];
    }
    return [0,0];
}


var pt = new PipeText(document.getElementById("text-container"));