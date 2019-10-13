import { recursivelyBuild, buildHTMLNode } from "./recursive-tree-builder.mjs";

class PipeText
{
    constructor(div)
    {
        this.div = div;
        let self = this;

        //create lineNums div
        this.lineDiv = document.createElement('lines');
        this.lineDiv.contentEditable = false;
        

        //move initial text to code div
        this.codeDiv = document.createElement('code');
        this.codeDiv.contentEditable = true;
        this.codeDiv.innerHTML = this.div.innerHTML;
        this.div.innerHTML = "";

        this.div.appendChild(this.lineDiv);
        this.div.appendChild(this.codeDiv);

        this.init(self, "javascript").then((p) => console.log(p));

        this.div.addEventListener("input", function(event) 
        {
            console.log(event);            
            
            (async (preSelectionRange) => 
            {
                let beginningOffset = getCaretCharacterOffsetWithin(self.div);

                let start = performance.now();
                /*(self.tree.edit({
                    startIndex: 0,
                    oldEndIndex: 3,
                    newEndIndex: 5,
                    startPosition: {row: 0, column: 0},
                    oldEndPosition: {row: 0, column: 3},
                    newEndPosition: {row: 0, column: 5},
                  });*/

                
                await self.refreshState(self, beginningOffset);

                //let cursorDiv = document.getElementById("cursorDiv");
                //let localOffset = cursorDiv.getAttribute("cursor-offset");

                //let range = document.createRange();
                console.log(beginningOffset);
                //range.setStart(cursorDiv, localOffset);
                //range.setEnd(cursorDiv, localOffset);
                
                //window.getSelection().removeAllRanges();
                //window.getSelection().addRange(range);
                const duration = (performance.now() - start).toFixed(1);
                console.log(`parsed in ${duration} ms`);
            })();

        }, false);
    }

    async init(self, language)
    {
        await TreeSitter.init();

        self.parser = new TreeSitter();

        const url = `pipetext-web/tree-sitter/tree-sitter-${language}.wasm`;

        try { language = await TreeSitter.Language.load(url); } 
        catch (e) { console.error(e); return; }

        console.log(self);

        self.parser.setLanguage(language);
        self.tree = null;

        await self.refreshState(self,0);
        
        console.log("initialized");
    }

    async refreshState(self, beginningOffset)
    {
        await self.parse(self);

        let lineNumbers = await self.refreshCodeTree(self, beginningOffset);

        await self.refreshLineNums(lineNumbers,self);
    }

    async parse(self) { self.tree = self.parser.parse(self.codeDiv.textContent, null); }

    async refreshCodeTree(self, cursorIndex)
    {
        const cursor = self.tree.walk();
        let nodeObject = [];
        let childCount = 0;
    
        let rootnode = recursivelyBuild(cursor, nodeObject, childCount);
        rootnode[0].indexRange.start = 0;

        self.codeDiv.innerHTML = buildHTMLNode(rootnode[0], self.codeDiv.textContent, cursorIndex);

        return rootnode[0].range.end.row
    }

    async refreshLineNums(lines,self)
    {
        self.lineDiv.innerHTML = "";
        for(var i = 1; i <= lines; i++)
        {
            let line = document.createElement('line');
            line.textContent = i.toString();
            self.lineDiv.appendChild(line);
        }
    }
}

var pt = new PipeText(document.getElementById("text-container"));

function getCaretCharacterOffsetWithin(element) {
    var caretOffset = 0;
    var doc = element.ownerDocument || element.document;
    var win = doc.defaultView || doc.parentWindow;
    var sel;
    if (typeof win.getSelection != "undefined") {
        sel = win.getSelection();
        if (sel.rangeCount > 0) {
            var range = win.getSelection().getRangeAt(0);
            var preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
    } else if ( (sel = doc.selection) && sel.type != "Control") {
        var textRange = sel.createRange();
        var preCaretTextRange = doc.body.createTextRange();
        preCaretTextRange.moveToElementText(element);
        preCaretTextRange.setEndPoint("EndToEnd", textRange);
        caretOffset = preCaretTextRange.text.length;
    }
    return caretOffset;
}


function getDiff(oldText, newText, cursor) 
{
    var delta = newText.length - oldText.length;
    var limit = Math.max(0, cursor - delta);
    var end = oldText.length;
    while (end > limit && oldText.charAt(end - 1) == newText.charAt(end + delta - 1)) {
        end -= 1;
    }
    var start = 0;
    var startLimit = cursor - Math.max(0, delta);
    while (start < startLimit && oldText.charAt(start) == newText.charAt(start)) {
        start += 1;
    }
    return [start, end];
}