import { recursivelyBuild, buildHTMLNode } from "./recursive-tree-builder.mjs";

class PipeText
{
    constructor(div)
    {
        this.div = div;
        this.init(this, "javascript").then((p) => console.log(p));
        let self = this;

        this.div.addEventListener("input", function(event) 
        {
            console.log(event);            
            
            (async (preSelectionRange) => 
            {
                let beginningOffset = getCaretCharacterOffsetWithin(self.div);

                
                let start = performance.now();
                /*self.tree.edit({
                    startIndex: 0,
                    oldEndIndex: 3,
                    newEndIndex: 5,
                    startPosition: {row: 0, column: 0},
                    oldEndPosition: {row: 0, column: 3},
                    newEndPosition: {row: 0, column: 5},
                  });*/

                await self.parse(self);
                await self.buildTree(self, beginningOffset);

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

        const url = `./tree-sitter/tree-sitter-${language}.wasm`;

        try { language = await TreeSitter.Language.load(url); } 
        catch (e) { console.error(e); return; }

        self.parser.setLanguage(language);
        self.tree = null;

        await self.parse(self);
        await self.buildTree(self, 0);

        console.log("initialized");
    }

    async parse(self) { self.tree = self.parser.parse(self.div.textContent, null); }

    async buildTree(self, cursorIndex) 
    {
        const cursor = self.tree.walk();
        let nodeObject = [];
        let childCount = 0;
    
        let rootnode = recursivelyBuild(cursor, nodeObject, childCount);
        rootnode[0].indexRange.start = 0;

        console.log(rootnode);

        let codeDiv = document.createElement('code');
        codeDiv.innerHTML = buildHTMLNode(rootnode[0], self.div.textContent, cursorIndex);

        console.log(rootnode[0].range.end.row);
        let linesDiv = buildLineNums(rootnode[0].range.end.row);

        linesDiv.contentEditable = "false";

        self.div.innerHTML = "";
        
        self.div.append(linesDiv);
        self.div.append(codeDiv);
    }
}

var pt = new PipeText(document.getElementById("text-container"));



function buildLineNums(lines)
{
    let lineNumDiv = document.createElement('lines');

    for(var i = 1; i <= lines; i++)
    {
        let line = document.createElement('line');
        line.textContent = i.toString();
        lineNumDiv.append(line);
    }

    return lineNumDiv;
}

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