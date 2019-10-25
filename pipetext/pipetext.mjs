import { buildHTMLNode2 } from "./recursive-tree-builder.mjs";

import { Docstate } from "./ot-core.mjs";

import { input_handler } from "./input.mjs";

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
        //this.codeDiv.contentEditable = true;
        this.codeDiv.style = "white-space: pre;"
        this.codeDiv.innerHTML = this.div.innerHTML;

        this.div.innerHTML = "";

        this.div.appendChild(this.lineDiv);
        this.div.appendChild(this.codeDiv);

        this.lastTextContent = this.codeDiv.textContent;

        this.docState = new Docstate(this.lastTextContent);

        let self = this;

        this.observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
              console.log(mutation);
            });
        });

        this.init(self, "javascript").then((p) => console.log("initialized"));

        self.observer.observe(this.codeDiv, 
        {
            attributes: true,
            subtree : true,
            childList: true,
            characterData: true
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

    async refreshState(self, beginningOffset)
    {
        self.observer.disconnect();

        await self.parse(self);

        let lineNumbers = await self.refreshCodeTree(self, beginningOffset);

        await self.refreshLineNums(lineNumbers,self);

        self.observer.observe(self.codeDiv, 
            {
                attributes: true,
                subtree : true,
                childList: true,
                characterData: true
            });

        //console.log(document.getElementById("cursorDiv"));
    }

    async parse(self) { self.tree = self.parser.parse(self.docState.get_str(), null); }

    async refreshCodeTree(self, cursorIndex)
    {
        const cursor = self.tree.walk();

        self.codeDiv.innerHTML = "";
    
        let rootnode = buildHTMLNode2(cursor, self.docState.get_str(), self);

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