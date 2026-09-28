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


/*
css rule:
    rule - name of the rule in css
    description - description of the rule
    accepts - what the rule accepts as valid parameters
        name - displayable name of the property (can be anything)
        type - input type
*/
const css_rules = [
    {rule:"background-color", description: "Changes background colour", accepts:[{name:"Colour", type:"color"}]},
    {rule:"font-size", description: "Changes font size", accepts:[{name:"Font size", type:"number"}, {type:"unit"}]},
    {rule:"font-family", description: "Changes font", accepts:[{name:"Font name", type:"text"}]},
    {rule:"width", description: "Changes width", accepts:[{name:"Amount", type:"number"}, {type:"unit"}]},
    {rule:"height", description: "Changes height", accepts:[{name:"Amount", type:"number"}, {type:"unit"}]},
    {rule:"color", description: "Changes colour of the font", accepts:[{name:"Colour", type:"color"}]},
    {rule:"border", description: "Changes border properties", accepts:[{name:"Width", type:"number"}, {type:"unit"}, {name:"Border type", type:"border_type"}, {name:"Colour", type:"color"}]},
    {rule:"padding", description: "Changes space around an element's content <b>inside<b> the element", accepts:[
        {name:"Top", type:"number"},{type:"unit"}, 
        {name:"Bottom", type:"number"}, {type:"unit"},
        {name:"Left", type:"number"}, {type:"unit"},
        {name:"Right", type:"number"}, {type:"unit"}]},
    {rule:"margin", description: "Changes space around an element's content <b>outside<b> the element", accepts:[
        {name:"Top", type:"number"},{type:"unit"}, 
        {name:"Bottom", type:"number"}, {type:"unit"},
        {name:"Left", type:"number"}, {type:"unit"},
        {name:"Right", type:"number"}, {type:"unit"}]},
    {rule:"transition", description: "Makes a transition between styles smooth within given time span", accepts:[{name:"Time", type:"number"}]}
];
let selected_rule = css_rules[0]; // curently selected rule on the list

function generate_element_list()
{
    // Options for elements list
    const element_select = document.getElementById("elements");
    for(const element of elements)
    {
        const option = document.createElement("option");
        option.value = element;
        option.textContent = element;

        element_select.appendChild(option);
    }
}

function connect_css_rule_select()
{
    const css_rule_select = document.getElementById("css_rules");
    css_rule_select.innerHTML = "";
    // Options for CSS rules
    for(const rule of css_rules)
    {
        const option = document.createElement("option");
        option.value = rule.rule;
        option.textContent = rule.rule;
        option.rule = rule;

        css_rule_select.appendChild(option);
    }
    css_rule_select.onchange = function(event)
    {
        rule_property_update(event);
    }
    
    const css_select = document.getElementById("styles_selection")
    if(css_select)
    {
        css_select.onchange = function(event)
        {
            css_current_selector = event.target.style_selector;
        };
    }
}

function generate_property_field_change()
{
    let rule_control_inner_html = "";
    for(const property of selected_rule.accepts)
    {
        if(property.type === "unit")
        {
            rule_control_inner_html += " units: ";
            const units = ["%", "cap", "ch", "cm", "cqb", "cqh", "cqi", "cqmax", "cqw", "dvb", "dvh", "dvi", "dvw", "em", "ex", "fr", "ic", "in", "lh", "lvb", "lvh", "lvi", "lvw", "mm", "pc", "pt", "px", "q", "rcap", "rch", "rem", "rex", "ric", "rlh", "svb", "svh", "svi", "svw", "vb", "vh", "vi", "vmax", "vmin", "vw"];
            rule_control_inner_html += generate_selection_property_list(units);
        }
        else if(property.type === "border_type")
        {
            rule_control_inner_html += " border type: ";
            const border_styles = ["solid", "dashed", "dotted", "ridge", "double", "groove", "inset", "outset"]
            rule_control_inner_html += generate_selection_property_list(border_styles); 
        }
        else
        {
            rule_control_inner_html += property.name + ": ";
            rule_control_inner_html += "<input type='" + property.type + "' class='css_rule_input_field'/>";
        }
    }
    return rule_control_inner_html;
}

function generate_selection_property_list(array_of_options)
{
    let option_menu_html_text = "<select class='css_rule_input_field'>\n";
    for(const option of array_of_options)
    {
        option_menu_html_text += "<option>" + option + "</option>\n";
    }
    option_menu_html_text += "</select>";
    return option_menu_html_text;
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
            select_element(li, false)
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