export function update_changed_nodes(node, html_node)
{
    node.children.map((child) => { if(child.hasChanges()) print_node(child); update_changed_nodes(child, html_node); }); 
}

export function recursive_debug(node)
{
    let parent = { type : node.type, id : node.id };
    parent.children = [];

    node.children.map((child, index) => 
    { 
        parent.children.push(recursive_debug(child));
    });

    return parent;
}



//this function compares two arrays
function get_delta(arr1, arr2)
{
    let result = [];

    //for each value of the first array
    arr1.forEach((val, index) => 
    {
        //is it inside the second array?
        if(!arr2.some(x => !val.equals(x))) result.push(val);
    });

    return result;
}

function print_node(node)
{
    console.log(`node : ${node.type} , id : ${ node.id }`);
}