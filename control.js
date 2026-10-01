// get and fetch working directory
const import_Folder = document.getElementById("folder");
const iframe = document.getElementById("embed");


let parsed_html_files; // html files in directory
let parsed_html; // parsed html file using DOMparser
let rule_property_window; // used for storing style window state
let css_current_selector; // selected id/style of selected element



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
    //TODO: fix bottom scrollbar not showing unless zooming was used
    update_iframe(0.1);
    update_iframe(-0.1);
    
    generate_element_list();
    connect_css_rule_select();
    rule_property_update();
    rule_property_window = document.getElementById("css_control").innerHTML;
    document.getElementById("css_control").style.display = "none";
    
}

function choose_style()
{
    const rule_control = document.getElementById("css_control");
    if(!selected_element)
    {
        return;
    }
    let id = selected_element.element.id;
    let classes = selected_element.element.classList;
    if(!id && classes.length === 0)
    {
        if(!rule_property_window)
        {
            rule_property_window = rule_control.innerHTML;
        }
        rule_control.innerHTML = "No classes/id is assigned to selected element. <br />" + 
        "Please choose a type and provide a name. <br />" + 
        "<input type='text' id='new_style_name' /> <br />" +
        "Type: <br />" +
        "<input type='radio' id='new_id_style' name='style_type' value='id'/>Id <br />"+ 
        "<input type='radio' id='new_class_style' name='style_type' value='class'/>Class<br />" + 
        "<button onclick='set_new_style()'>Set</button>";
    }
    else if((id && classes.length == 0) || (classes.length == 1 && !id)) // only id or only one style
    {
        rule_control.innerHTML = rule_property_window;
        connect_css_rule_select()
        if(id)
        {
            css_current_selector = "#" + id;
        }
        else
        {
            css_current_selector = "." + classes[0];
        }
        document.getElementById("styles_selection").outerHTML = "";
        document.getElementById("styles_selection_part").innerHTML = "";
    }
    else
    {
        rule_control.innerHTML = rule_property_window;
        connect_css_rule_select()
        const css_select = document.getElementById("styles_selection");
        document.getElementById("styles_selection_part").innerHTML = "Choose which style to edit: ";
        
        
        for(const element_class of classes)
        {
            const option = document.createElement("option");
            option.style_selector = "." + element_class;
            option.textContent = "." + element_class;
            
            css_select.appendChild(option);
        }
        
        if(id)
        {
            const option = document.createElement("Option");
            option.style_selector = "#" + id;
            option.textContent = "#" + id;
            
            css_select.appendChild(option);
        }
        
        css_current_selector = document.getElementById("styles_selection").selectedOptions[0].style_selector;
    }
}

function set_new_style()
{
    const name = document.getElementById("new_style_name").value;
    if(name.length === 0)
    {
        alert("Please provide a name for the style");
        return;
    }
    if(document.getElementById("new_id_style").checked)
    {
        selected_element.element.id = name;
    }
    else if(document.getElementById("new_class_style").checked)
    {
        selected_element.element.classList.add(name);
    }
    
    update_element_menu();
    update_iframe();
}

function rule_property_update(event)
{   
    const rule_control = document.getElementById("css_rule_control");
    if(!event)
    {
        rule_control.innerHTML = selected_rule.description + "<br />" + generate_property_field_change()
        return;
    }
    selected_rule = event.target.selectedOptions[0].rule;
    rule_control.innerHTML = selected_rule.description + "<br />" + generate_property_field_change();
}

async function set_style()
{
    const input_fields = document.getElementsByClassName("css_rule_input_field");
    const rule = document.getElementById("css_rules");
    let connected_css;
    let rule_property = "";
    let css_error = false;
    for(const field of input_fields)
    {
        if(field.classList.contains("css_empty"))
        {
            field.classList.remove("css_empty");
        }
        
        if(field.nodeName == "SELECT")
        {
            rule_property += field.selectedOptions[0].value + " ";
        }
        else
        {
            if(field.value.length === 0)
            {
                css_error = true;
                field.classList.add("css_empty")
            }
            rule_property += field.value;
        }
    }
    
    if(css_error)
    {
        alert("Please fill every field");
        return;
    }
    
    
    if(!css_files)
    {
        alert("Placeholder error. No css file found");
        return;
    }
    else
    {
        connected_css = get_connected_css_files()
    }
    
    let updated_stylesheet_text = "";
    let rule_found = false;
    for(const css_file of connected_css)
    {
        let css_file_text = await css_file.text()
        const stylesheet = new CSSStyleSheet();
        await stylesheet.replace(css_file_text);
        
        for(const rule of stylesheet.cssRules)
        {
            if(rule.selectorText == css_current_selector)
            {
                rule.style.setProperty(selected_rule.rule, rule_property);
                rule_found = true;
            }
            updated_stylesheet_text += rule.cssText + "\n";
        }
    }
    if(!rule_found)
    {
        updated_stylesheet_text = "";
        let css_file_text = await connected_css[0].text()
        const stylesheet = new CSSStyleSheet();
        await stylesheet.replace(css_file_text);
        stylesheet.insertRule(css_current_selector + " { " + selected_rule.rule + ": " + rule_property + "}")
        for(const rule of stylesheet.cssRules)
        {
            updated_stylesheet_text += rule.cssText + "\n";
        }
    }
    
    let preview_style = parsed_html.head.querySelector("#preview");
    if(!preview_style)
    {
        preview_style = parsed_html.createElement("style");
        preview_style.id = "preview";
        parsed_html.head.appendChild(preview_style);
    }

    preview_style.textContent = updated_stylesheet_text;

    update_iframe();
}

function get_connected_css_files()
{
    const links = parsed_html.head.querySelectorAll("link");
    let connected_css_names = new Array();
    for(const link of links)
    {
        if(link.href.endsWith(".css"))
        {
            connected_css_names.push(link.href);
        }
    }
    
    let connected_css_files = new Array();
    
    for(const connected_css_name of connected_css_names)
    {
        for(const css_file of css_files)
        {
            if(connected_css_name.endsWith(css_file.webkitRelativePath))
            {
                connected_css_files.push(css_file);
            }
        }
    }
    return connected_css_files;
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
        parsed_html_files.push(check_html(html_text))
    }
    else
    {
        for(const html_file of html_files)
        {
            html_text = await html_file.text();
            parsed_html_files.push(check_html(html_text))
        }
    }
    
    for(const parsed_html_file of parsed_html_files)
    {
        parsed_html = parsed_html_file;
        change_html_file_path(js_files, parsed_html.scripts, "src",  "name", "webkitRelativePath");
        change_html_file_path(css_files, parsed_html.querySelectorAll('link[rel="stylesheet"]'), "href", "name", "webkitRelativePath");
    }
    
    parsed_html = parsed_html_files[0];
    
    document.getElementById("css_control").style.display = "";
    add_buttons();
    update_element_menu();
    update_iframe();
}

function add_buttons()
{
    const menu = document.getElementById("choices");
    menu.innerHTML = "";
    if(html_files.length === 0)
    {
        const button = document.createElement("button");
        button.innerHTML = "index.html";
        button.onclick = function() {choose_html(i)};
        menu.appendChild(button);
        return;
    }
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
    for(const file of file_array)
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
    body_li.element = parsed_html.body;
    body_li.addEventListener("click", function()
    {
        select_element(body_li, true)
    });
    element_list_node.appendChild(body_li);
    
    const body_ul = document.createElement("ul");
    element_list_node.appendChild(body_ul);
    print_element_menu(parsed_html.body, body_ul);
    
}

function select_element(li, current_level_button_disabled)
{
    if(selected_element)
    {
        selected_element.classList.remove("selected");
    }

    document.getElementById("add_as_current_button").disabled = current_level_button_disabled;
    li.classList.add("selected");
    selected_element = li;
    choose_style();
}

function get_element_connections(from)
{
    let connections = "";
    if(from.className || from.id)
    {
        connections += " ";
        connections += "<font color='yellow'>[Styles: ";
        if(from.classList.length > 0)
        {
            for(const _class of from.classList)
            {
                connections += " ." + _class;
            }
        }
        if(from.id)
        {
            connections += " #" + from.id;
        }
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
