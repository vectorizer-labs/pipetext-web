import { buildHTMLNode2 } from "./recursive-tree-builder.mjs";

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

        const url = `pipetext-web/tree-sitter/tree-sitter-${language}.wasm`;

        try { language = await TreeSitter.Language.load(url); } 
        catch (e) { console.error(e); return; }

        self.parser.setLanguage(language);
        self.tree = null;

        await self.refreshState(self);
        
    }

    async refreshState(self, cursorIndex)
    {
        console.log(cursorIndex);
        var t0 = performance.now();

        await self.parse(self);

        var t1 = performance.now();
        //console.log("Parse took " + (t1 - t0) + " milliseconds.");

        let lineNumbers = await self.refreshCodeTree(self, cursorIndex);

        await self.refreshLineNums(lineNumbers,self);

        var t2 = performance.now();
        //console.log("Rebuild took " + (t2 - t1) + " milliseconds.");

        console.log("Total " + (t2 - t0) + " milliseconds.");

        self.lastTextContent = self.codeDiv.textContent;
    }

    async parse(self) { self.tree = self.parser.parse(self.codeDiv.textContent, self.tree); }

    async debugParse(self) 
    { 

        let sourceLines = self.codeDiv.textContent.split(/(\r\n)|(\r)|(\n)/);

        self.tree = self.parser.parse((index, position) => {
            console.log("Index : " + index);
            console.log("Position : " + position.row + " : " + position.column);
            let parseableString = self.codeDiv.textContent.slice(index);
            console.log(parseableString);
            return parseableString;
          }, self.tree); 

    }

    async refreshCodeTree(self, cursorIndex)
    {
        const cursor = self.tree.walk();

        let rootnode = buildHTMLNode2(cursor, self.codeDiv.textContent, self, cursorIndex);

        self.codeDiv.innerHTML = "";

        self.codeDiv.appendChild(rootnode);

        //console.log(rootnode.getAttribute("endRow"));

        return rootnode.getAttribute("endRow");
    }

    async refreshLineNums(lines,self)
    {
        self.lineDiv.innerHTML = "";
        for(var i = 0; i <= lines; i++)
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