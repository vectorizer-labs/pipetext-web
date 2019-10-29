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

        this.init_listener_hacks()

        let self = this;

        //make sure plain text only is pasted
        this.codeDiv.addEventListener("input", function(e) 
        {
            handle_input(self);
        });

        /*
        this.observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                handle_input(self,mutation);
            });
        });

        this.observer.observe(this.codeDiv, 
            {
                subtree : true,
                childList: true,
                characterData: true
            });
            */
        this.init(self, "javascript").then((p) => console.log("initialized"));

    }

    
    init_listener_hacks()
    {
        //make sure plain text only is pasted
        this.codeDiv.addEventListener("paste", function(e) {
            // cancel paste
            e.preventDefault();
        
            // get text representation of clipboard
            var text = (e.originalEvent || e).clipboardData.getData('text/plain');
        
            // insert text manually
            document.execCommand("insertHTML", false, text);
        });

        //hack to make sure enters register
        this.codeDiv.addEventListener("keydown",function(e) {
            // trap the return key being pressed
            if (e.keyCode == 13) {
                // cancel paste
                e.preventDefault();
              // insert 2 br tags (if only one br tag is inserted the cursor won't go to the next line)
              document.execCommand('insertHTML', false, '\r\n');
              // prevent the default behaviour of return key pressed
              return false;
            }
          });
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
        
    }

    async refreshState(self)
    {

        //self.observer.disconnect();

        var t0 = performance.now();

        await self.parse(self);

        var t1 = performance.now();
        console.log("Parse took " + (t1 - t0) + " milliseconds.");

        let lineNumbers = await self.refreshCodeTree(self);

        await self.refreshLineNums(lineNumbers,self);

        var t2 = performance.now();
        console.log("Rebuild took " + (t2 - t1) + " milliseconds.");

        console.log("Total " + (t2 - t0) + " milliseconds.");

        /*
        self.observer.observe(self.codeDiv, 
        {
            subtree : true,
            childList: true,
            characterData: true
        });*/

        self.lastTextContent = self.codeDiv.textContent;

        //console.log(document.getElementById("cursorDiv"));
    }

    async parse(self) { self.tree = self.parser.parse(self.codeDiv.textContent, self.tree); }

    async refreshCodeTree(self)
    {
        const cursor = self.tree.walk();

        let rootnode = buildHTMLNode2(cursor, self.codeDiv.textContent, self);

        self.codeDiv.innerHTML = "";

        self.codeDiv.appendChild(rootnode);

        console.log(rootnode.getAttribute("endRow"));

        return rootnode.getAttribute("endRow");
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