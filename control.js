// get and fetch working directory
const import_Folder = document.getElementById("folder");
const iframe = document.getElementById("embed");

let parsed_html;

import_Folder.addEventListener("change", () =>
{
    fetch_Folder()
});

window.onload = function() {
  _init_();
}; 

async function _init_()
{
    iframe.srcdoc = "";
    iframe.removeAttribute("srcdoc");
    iframe.src = "default.html";
}

function check_html(html_text)
{
    if(!html_text)
    {
        html_text = "<!DOCTYPE HTML>\n";
    }
    
    // check for <!DOCTYPE HTML>
    if(!html_text.toLowerCase().startsWith("<!doctype html>"))
    {
        alert("Error: doctype is not specified");
        html_text = "<!DOCTYPE HTML>\n" + html_text;
    }
    
    const parser = new DOMParser();
    const document = parser.parseFromString(html_text, "text/html");
    return document;
}

let html_file;
let js_file;
let css_file;
async function fetch_Folder()
{
    html_file = undefined;
    js_file = undefined;
    css_file = undefined;
    let duplicates = false;
    
    for(const file of import_Folder.files)
    {
        if(file.name.endsWith(".html"))
        {
            if(html_file)
            {
                duplicates = true;
            }
            html_file = file;
        }
        else if(file.name.endsWith(".css"))
        {
            if(css_file)
            {
                duplicates = true;
            }
            css_file = file;
        }
        else if(file.name.endsWith(".js"))
        {
            if(js_file)
            {
                duplicates = true;
            }
            js_file = file;
        }
    }
    
    if(duplicates)
    {
        alert("Warning! Too much files of type .js, .html or .css. Result may be undefined. \nPlease make sure there is exactly one of each");
        return;
    }
    
    let html_text;
    if(!html_file)
    {
        html_text = 
        "<!DOCTYPE HTML>\n" +
        "<html>\n" +        
        "   <head>\n" +        
        "   </head>\n" +        
        "   <body>\n" +        
        "       Empty project. Brand new beginning :)" +        
        "   </body>\n" +        
        "</html>\n";
    }
    else
    {
        html_text = await html_file.text();
    }
    parsed_html = check_html(html_text);
    
    if(js_file)
    {
        // check if javascript file is connected
        if(is_js_in_html(js_file.name))
        {
            fix_displayable_html_scripts();
        }
        else
        {
            console.log("Script is not connected");
        }
    }
    
    
    if(css_file)
    {
        // check if stylesheet file is connected
        if(is_css_in_html(css_file.name))
        {
            fix_displayable_html_stylesheet();
        }
        else
        {
            console.log("Script is not connected");
        }
    }
    
    update_element_menu();
    update_iframe();
}

function update_element_menu()
{
    let element_list_node = document.getElementById("element_list");
    element_list_node.innerHTML = "";
    
    const head_li = document.createElement("li");
    head_li.textContent = "html"
    element_list_node.appendChild(head_li);
    
    const head_ul = document.createElement("ul");
    element_list_node.appendChild(head_ul);
    print_element_menu(parsed_html.head, head_ul);
    
    
    const body_li = document.createElement("li");
    body_li.textContent = "body"
    element_list_node.appendChild(body_li);
    
    const body_ul = document.createElement("ul");
    element_list_node.appendChild(body_ul);
    print_element_menu(parsed_html.body, body_ul);
    
    
}

function print_element_menu(from, element_list_node)
{
    for(const element of from.children)
    {
        const li = document.createElement("li");
        li.textContent = element.tagName.toLowerCase();
        element_list_node.appendChild(li);
        if(element.children.length > 0)
        {
            const ul = document.createElement("ul");
            print_element_menu(element, ul);
            element_list_node.appendChild(ul);
        }
    }
}

function fix_displayable_html_scripts()
{
    if(!js_file)
    {
        return;
    }
    const scripts = parsed_html.scripts;
    for(let i = 0; i < scripts.length; i++)
    {
        if(scripts[i].src.endsWith(js_file.name))
        {
            parsed_html.scripts[i].src = js_file.webkitRelativePath;
        }
    }
    
}

function clean_script_path()
{
    if(!js_file)
    {
        return;
    }
    
    const scripts = parsed_html.scripts;
    for(let i = 0; i < scripts.length; i++)
    {
        if(scripts[i].src.endsWith(js_file.webkitRelativePath))
        {
            parsed_html.scripts[i].src = js_file.name;
        }
    }
    
}

function clean_stylesheet_path()
{
    if(!css_file)
    {
        return;
    }
    
    const stylesheets = parsed_html.querySelectorAll('link[rel="stylesheet"]');
    if(stylesheets.length > 0)
    {
        for(let i = 0; i < stylesheets.length; i++)
        {
            if(stylesheets[i].href.endsWith(css_file.webkitRelativePath))
            {
                stylesheets[i].href = css_file.name;
            }
        }
    }
}

function is_js_in_html(js_file_name)
{
    if(!js_file_name)
    {
        return;
    }
    const scripts = parsed_html.scripts;
    if(scripts.length > 0)
    {
        for(const script of scripts)
        {
            if(script.src.endsWith(js_file_name) )
            {
                return true;
            }
        }
    }
    return false;
}

function fix_displayable_html_stylesheet()
{
    if(!css_file)
    {
        return;
    }
    const stylesheets = parsed_html.querySelectorAll('link[rel="stylesheet"]');
    if(stylesheets.length > 0)
    {
        for(let i = 0; i < stylesheets.length; i++)
        {
            if(stylesheets[i].href.endsWith(css_file.name))
            {
                stylesheets[i].href = css_file.webkitRelativePath;
            }
        }
    }
}

function is_css_in_html(css_file_name)
{
    if(!css_file_name)
    {
        return;
    }
    const stylesheets = parsed_html.querySelectorAll('link[rel="stylesheet"]');
    if(stylesheets.length > 0)
    {
        for(const stylesheet of stylesheets)
        {
            if(stylesheet.href.endsWith(css_file_name) )
            {
                return true;
            }
        }
    }
    return false;
}

function update_iframe()
{
    iframe.srcdoc = parsed_html.documentElement.outerHTML;
    iframe.removeAttribute("src");
}

function prompt_name()
{
    let name = prompt("Put file name here: ");
    if(name === null || name.length === 0)
    {
        let repeat = confirm("Warning: input field is empty or user cancelled. \nConfirm to repeat the process");
        while(repeat && (name === null || name.length === 0))
        {
            name = prompt("Put file name here: ");
        }
    }
    return name;
}

function export_file(file, blob, extension)
{
    var a = window.document.createElement("a");
    a.style.display = 'none';        
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    
    let filename = prompt_name();
    if((filename === null || filename.length === 0)) 
    {
        a.download = file?.name || "index" + extension;
    }
    else
    {
        a.download = filename + extension;
    } 
    
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function download(type)
{
    if(!parsed_html)
    {
        console.error("Error: html file is empty. Make sure to choose directory with html file");
        return;
    }
    
    
    if(type === "html")
    {
       
        
        clean_script_path();
        clean_stylesheet_path();
        
        const blob = new Blob(["<!DOCTYPE HTML>\n" + parsed_html.documentElement.outerHTML], {type: "text/html"});
        fix_displayable_html_scripts();
        export_file(html_file, blob, ".html");
    }
    else if(type === "css")
    { 
        if(!css_file)
        {
            console.error("Couldn't find css file");
            return;
        }
        
        const blob =new Blob([css_file], {type: "text/css"});
        export_file(css_file, blob, ".css");
    }
    else if(type === "js")
    {
        if(!js_file)
        {
            console.error("Couldn't find js file");
            return;
        }
        
        const blob = new Blob([js_file], {type: "text/javascript"});
        export_file(js_file, blob, ".js");
    }
}