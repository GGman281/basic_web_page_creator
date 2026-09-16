// get and fetch working directory
const import_Folder = document.getElementById("folder");
const iframe = document.getElementById("embed");
const elements = [
    "div",
    "p",
    "span",
    "h1",
    "h2",
    "h3",
    "a",
    "img",
    "button",
    "input",
    "textarea",
    "ul",
    "ol",
    "li",
    "table",
    "section",
    "article",
    "header",
    "footer",
    "nav"
];
let parsed_html_files;
let parsed_html;

import_Folder.addEventListener("change", () =>
{
    fetch_Folder()
});

window.onload = function() {
  _init_();
}; 

function _init_()
{
    iframe.srcdoc = "";
    iframe.removeAttribute("srcdoc");
    iframe.src = "default.html";
    const element_select = document.getElementById("elements");
    for(const element of elements)
    {
        const option = document.createElement("option");
        option.value = element;
        option.textContent = element;

        element_select.appendChild(option);
    }
    update_iframe(0.1);
    update_iframe(-0.1);
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

let html_files;
let js_files;
let css_files;
async function fetch_Folder()
{
    html_files = new Array;
    js_files = new Array;
    css_files = new Array;
    parsed_html_files = new Array;
    
    for(const file of import_Folder.files)
    {
        if(file.name.endsWith(".html"))
        {
            html_files.push(file);
        }
        else if(file.name.endsWith(".css"))
        {
            css_files.push(file);
        }
        else if(file.name.endsWith(".js"))
        {
            js_files.push(file);
        }
    }
    
    let html_text;
    if(html_files.length === 0)
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
        for(html_file of html_files)
        {
            html_text = await html_file.text();
            parsed_html_files.push(check_html(html_text))
        }
    }
    
    for(parsed_html_file of parsed_html_files)
    {
        parsed_html = parsed_html_file
        change_html_file_path(js_files, parsed_html.scripts, "src",  "name", "webkitRelativePath");
        change_html_file_path(css_files, parsed_html.querySelectorAll('link[rel="stylesheet"]'), "href", "name", "webkitRelativePath");
    }
    
    parsed_html = parsed_html_files[0];
    
    add_button();
    
    update_element_menu();
    update_iframe();
}

function add_button()
{
    const menu = document.getElementById("choices");
    for(let i = 0; i < parsed_html_files.length; i++)
    {
        const button = document.createElement("button");
        button.innerHTML = html_files[i].name;
        button.onclick = function() {choose_html(i)};
        menu.appendChild(button);
    }
}

function choose_html(index)
{
    selected_element = undefined;
    parsed_html = parsed_html_files[index];
    update_element_menu();
    update_iframe();
}

function change_html_file_path(file_array, array_of_files, property, from_property, to_property)
{    
    if(!file_array)
    {
        return;
    }
    for(file of file_array)
    {
        if(!is_file_connected_property(file.name, array_of_files, property))
        {
            continue;
        }
        for(let i = 0; i < array_of_files.length; i++)
        {
            if(array_of_files[i][property].endsWith(file[from_property]))
            {
                array_of_files[i][property] = file[to_property];
            }
        }
    }
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


let selected_element;
function print_element_menu(from, element_list_node)
{
    for(const element of from.children)
    {
        const li = document.createElement("li");
        li.textContent = element.tagName.toLowerCase();
        
        li.element = element;
        li.addEventListener("click", function()
        {
            if(selected_element)
            {
                selected_element.classList.remove("selected");
            }

            li.classList.add("selected");
            selected_element = li;
        });
        
        li.innerHTML += get_element_connections(element);
        
        element_list_node.appendChild(li);
        if(element.children.length > 0)
        {
            const ul = document.createElement("ul");
            print_element_menu(element, ul);
            element_list_node.appendChild(ul);
        }
    }
}

function get_element_connections(from)
{
    let connections = "";
    if(from.className || from.id)
    {
        connections += " ";
        connections += "<font color='yellow'>[Styles: ";
        connections += from.className + " " + from.id;
        connections += "]</font>";
    }
    if(from.attributes.onclick)
    {
        connections += " ";
        connections += "<font color='orange'>";
        if(from.attributes.onclick.value.length > 0)
        {
            connections += "[on click: ";
            connections += from.attributes.onclick.value;
        }
        else
        {
            connections += "[empty on click";
        }
        connections += "]</font>";
    }
    if(from.attributes.onblur)
    {
        connections += " ";
        connections += "<font color='orange'>";
        if(from.attributes.onblur.value.length > 0)
        {
            connections += "[on blur: ";
            connections += from.attributes.onblur.value;
        }
        else
        {
            connections += "[empty on blur";
        }
        connections += "]</font>";
    }
    return connections;
}

function is_file_connected_property(file_name, array_of_files, property)
{
    if(!file_name)
    {
        return false;
    }
    
    for(const file of array_of_files)
    {
        if(file[property].endsWith(file_name))
        {
            return true;
        }
    }
    return false;
}

let zoom = 1;
const iframe_width = iframe.offsetWidth;
const iframe_height = iframe.offsetHeight;
function update_iframe(scale)
{
    if(scale)
    {
        zoom += scale;
        if(zoom < 0.5)
        {
            zoom = 0.5;
            return;
        }
        const canvas = document.getElementById("canvas");
        canvas.style.width = `${iframe.offsetWidth * zoom}px`;
        canvas.style.height = `${iframe.offsetHeight * zoom}px`;
        iframe.style.transformOrigin = "top left";
        
        iframe.style.transform = `scale(${zoom})`;
        
        document.getElementById("zoom_percentage").innerHTML = (100 * zoom).toFixed(0) + "%"
        return;
    }
    iframe.srcdoc = parsed_html.documentElement.outerHTML;
    iframe.removeAttribute("src");
}



function prompt_name()
{
    let name = prompt("Put file name here: ");
    if(name === null || name.length === 0)
    {
        let repeat = confirm("Warning: input field is empty or user cancelled. \nFile name remain the same.");
        while(!repeat && (name === null || name.length === 0))
        {
            name = prompt("Put file name here: ");
        }
    }
    return name;
}

function add_element_as(level)
{
    if(!selected_element)
    {
        console.error("Please select the element on the right list first")
        return;
    }
    const element_select = document.getElementById("elements");
    const element = parsed_html.createElement(element_select.value);
    if(level == "parent")
    {
        selected_element.element.parentElement.appendChild(element);
    }
    else if(level == "child")
    {
        selected_element.element.appendChild(element);
    }
    
    update_element_menu();
    update_iframe();
}

function export_file(file, blob, extension)
{
    const a = document.createElement("a");
    a.style.display = 'none';        
    const url = window.URL.createObjectURL(blob);
    a.href = url;
    
    let filename = prompt_name();
    if(filename === null || filename.length === 0)
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

function prompt_file_choice(file_array)
{
    let message = "Please choose file: \n";
    for(let i = 0; i < file_array.length; i++)
    {
        message += i + ") " + file_array[i].name + "\n";
    }
    let choice
    do
    {
        choice = prompt(message);    
    }while(choice < 0 || choice > file_array.length - 1);
    return file_array[choice];
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
        change_html_file_path(js_files, parsed_html.scripts, "src", "webkitRelativePath",  "name");
        change_html_file_path(css_files, parsed_html.querySelectorAll('link[rel="stylesheet"]'), "href", "webkitRelativePath", "name");
        
        const blob = new Blob(["<!DOCTYPE HTML>\n" + parsed_html.documentElement.outerHTML], {type: "text/html"});
        let html_file;
        if(html_files.length == 1)
        {
            html_file = html_files[0];
        }
        else
        {
            html_file = prompt_file_choice(html_files);
        }
        export_file(html_file, blob, ".html");
        
        change_html_file_path(css_files, parsed_html.querySelectorAll('link[rel="stylesheet"]'), "href", "name", "webkitRelativePath");
        change_html_file_path(js_files, parsed_html.scripts, "src",  "name", "webkitRelativePath");
        
        update_iframe();
    }
    else if(type === "css")
    { 
        let css_file;
        if(!css_files)
        {
            console.error("Couldn't find css file");
            return;
        }
        if(css_files.length == 1)
        {
            css_file = css_files[0];
        }
        else
        {
            css_file = prompt_file_choice(css_files);
        }
        
        const blob = new Blob([css_file], {type: "text/css"});
        export_file(css_file, blob, ".css");
    }
    else if(type === "js")
    {
        let js_file;
        if(!js_files)
        {
            console.error("Couldn't find js file");
            return;
        }
        if(js_files.length == 1)
        {
            js_file = jsfiles[0];
        }
        else
        {
            js_file = prompt_file_choice(js_files);
        }
        
        
        const blob = new Blob([js_file], {type: "text/javascript"});
        export_file(js_file, blob, ".js");
    }
}

//todo: export all files option