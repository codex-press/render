import Handlebars from 'handlebars/runtime';

(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['article_embed'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<"
    + alias4(((helper = (helper = helpers.tagName || (depth0 != null ? depth0.tagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tagName","hash":{},"data":data}) : helper)))
    + " id=\"cp-"
    + alias4(container.lambda(((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.id : stack1), depth0))
    + "\" class=\"article "
    + alias4(((helper = (helper = helpers.classes || (depth0 != null ? depth0.classes : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"classes","hash":{},"data":data}) : helper)))
    + "\">\n  "
    + ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n</"
    + alias4(((helper = (helper = helpers.tagName || (depth0 != null ? depth0.tagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tagName","hash":{},"data":data}) : helper)))
    + ">\n";
},"useData":true});
templates['article_embed_default'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<h3>\n  <a href=\""
    + alias4(((helper = (helper = helpers.url || (depth0 != null ? depth0.url : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"url","hash":{},"data":data}) : helper)))
    + "\">\n    "
    + alias4(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper)))
    + "\n  </a>\n</h3>\n<p class=description>"
    + alias4(((helper = (helper = helpers.description || (depth0 != null ? depth0.description : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"description","hash":{},"data":data}) : helper)))
    + "</p>\n";
},"useData":true});
templates['audio'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "preload=none";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : {}, alias3=helpers.helperMissing, alias4="function";

  return "<div id=cp-"
    + alias1(container.lambda(((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.id : stack1), depth0))
    + " class=\"audio-button icon-audio "
    + alias1(((helper = (helper = helpers.classes || (depth0 != null ? depth0.classes : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"classes","hash":{},"data":data}) : helper)))
    + "\">\n  <audio "
    + ((stack1 = helpers["if"].call(alias2,(depth0 != null ? depth0.javascript : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + " src=\""
    + alias1(((helper = (helper = helpers.sourceUrl || (depth0 != null ? depth0.sourceUrl : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"sourceUrl","hash":{},"data":data}) : helper)))
    + "\" type=\"audio/mp3\"></audio>\n</div>\n";
},"useData":true});
templates['basic'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "id=cp-"
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.id : stack1), depth0));
},"3":function(container,depth0,helpers,partials,data) {
    var helper;

  return " class=\""
    + container.escapeExpression(((helper = (helper = helpers.classes || (depth0 != null ? depth0.classes : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"classes","hash":{},"data":data}) : helper)))
    + "\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<"
    + alias4(((helper = (helper = helpers.tagName || (depth0 != null ? depth0.tagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tagName","hash":{},"data":data}) : helper)))
    + "\n  "
    + ((stack1 = helpers["if"].call(alias1,((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.id : stack1),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n  "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.classes : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\n  "
    + ((stack1 = ((helper = (helper = helpers.children || (depth0 != null ? depth0.children : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"children","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n</"
    + alias4(((helper = (helper = helpers.tagName || (depth0 != null ? depth0.tagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tagName","hash":{},"data":data}) : helper)))
    + ">\n";
},"useData":true});
templates['block'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return " class=\""
    + container.escapeExpression(((helper = (helper = helpers.classes || (depth0 != null ? depth0.classes : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"classes","hash":{},"data":data}) : helper)))
    + "\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<"
    + alias4(((helper = (helper = helpers.tagName || (depth0 != null ? depth0.tagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tagName","hash":{},"data":data}) : helper)))
    + " id=cp-"
    + alias4(container.lambda(((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.id : stack1), depth0))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.classes : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\n  "
    + ((stack1 = ((helper = (helper = helpers.children || (depth0 != null ? depth0.children : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"children","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n</"
    + alias4(((helper = (helper = helpers.tagName || (depth0 != null ? depth0.tagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tagName","hash":{},"data":data}) : helper)))
    + ">\n";
},"useData":true});
templates['graf'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return " class=\""
    + container.escapeExpression(((helper = (helper = helpers.classes || (depth0 != null ? depth0.classes : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"classes","hash":{},"data":data}) : helper)))
    + "\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<"
    + alias4(((helper = (helper = helpers.tagName || (depth0 != null ? depth0.tagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tagName","hash":{},"data":data}) : helper)))
    + " id=cp-"
    + alias4(container.lambda(((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.id : stack1), depth0))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.classes : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\n  "
    + ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n</"
    + alias4(((helper = (helper = helpers.tagName || (depth0 != null ? depth0.tagName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tagName","hash":{},"data":data}) : helper)))
    + ">\n";
},"useData":true});
templates['htmlblock'] = template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return " class=\""
    + container.escapeExpression(((helper = (helper = helpers.classes || (depth0 != null ? depth0.classes : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"classes","hash":{},"data":data}) : helper)))
    + "\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "<div id=cp-"
    + container.escapeExpression(container.lambda(((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.id : stack1), depth0))
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.classes : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\n  "
    + ((stack1 = ((helper = (helper = helpers.content || (depth0 != null ? depth0.content : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"content","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n</div>\n";
},"useData":true});
templates['image'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "loading";
},"3":function(container,depth0,helpers,partials,data) {
    return "      <!-- this comment will be replaced with size info -->\n";
},"5":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <img class=thumb src=\""
    + container.escapeExpression(((helper = (helper = helpers.thumbUrl || (depth0 != null ? depth0.thumbUrl : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"thumbUrl","hash":{},"data":data}) : helper)))
    + "\" draggable=false> \n        <img class=full draggable=false> \n";
},"7":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <img src=\""
    + container.escapeExpression(((helper = (helper = helpers.sourceUrl || (depth0 != null ? depth0.sourceUrl : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"sourceUrl","hash":{},"data":data}) : helper)))
    + "\" draggable=false> \n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : {}, alias3=helpers.helperMissing, alias4="function";

  return "<figure id=cp-"
    + alias1(container.lambda(((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.id : stack1), depth0))
    + "\n  class=\"image "
    + alias1(((helper = (helper = helpers.classes || (depth0 != null ? depth0.classes : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"classes","hash":{},"data":data}) : helper)))
    + " "
    + ((stack1 = helpers["if"].call(alias2,(depth0 != null ? depth0.javascript : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\n\n  <div class=frame>\n\n"
    + ((stack1 = helpers["if"].call(alias2,(depth0 != null ? depth0.javascript : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n    <div class=crop>\n\n"
    + ((stack1 = helpers["if"].call(alias2,(depth0 != null ? depth0.javascript : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + "\n    </div>\n\n  </div>\n\n  "
    + ((stack1 = ((helper = (helper = helpers.children || (depth0 != null ? depth0.children : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"children","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n\n</figure>\n";
},"useData":true});
templates['index_entry_default'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function";

  return "<p><a href=\""
    + container.escapeExpression(((helper = (helper = helpers.url || (depth0 != null ? depth0.url : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"url","hash":{},"data":data}) : helper)))
    + "\">"
    + ((stack1 = ((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"title","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</a></p>\n";
},"useData":true});
templates['video'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "loading";
},"3":function(container,depth0,helpers,partials,data) {
    return "      <!-- this comment will be replaced with size info -->\n";
},"5":function(container,depth0,helpers,partials,data) {
    return "          preload=none\n";
},"7":function(container,depth0,helpers,partials,data) {
    return "          controls preload=auto\n";
},"9":function(container,depth0,helpers,partials,data) {
    return "loop";
},"11":function(container,depth0,helpers,partials,data) {
    var helper;

  return "        <img class=thumb src=\""
    + container.escapeExpression(((helper = (helper = helpers.thumbUrl || (depth0 != null ? depth0.thumbUrl : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"thumbUrl","hash":{},"data":data}) : helper)))
    + "\" draggable=false> \n        <img class=poster draggable=false> \n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=container.escapeExpression, alias2=depth0 != null ? depth0 : {}, alias3=helpers.helperMissing, alias4="function";

  return "<figure id=cp-"
    + alias1(container.lambda(((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.id : stack1), depth0))
    + " \n  class=\"video "
    + alias1(((helper = (helper = helpers.classes || (depth0 != null ? depth0.classes : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"classes","hash":{},"data":data}) : helper)))
    + " "
    + ((stack1 = helpers["if"].call(alias2,(depth0 != null ? depth0.javascript : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\">\n\n  <div class=frame>\n\n"
    + ((stack1 = helpers["if"].call(alias2,(depth0 != null ? depth0.javascript : depth0),{"name":"if","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n    <div class=crop>\n\n      <video src=\""
    + alias1(((helper = (helper = helpers.sourceUrl || (depth0 != null ? depth0.sourceUrl : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"sourceUrl","hash":{},"data":data}) : helper)))
    + "\"\n\n"
    + ((stack1 = helpers["if"].call(alias2,(depth0 != null ? depth0.javascript : depth0),{"name":"if","hash":{},"fn":container.program(5, data, 0),"inverse":container.program(7, data, 0),"data":data})) != null ? stack1 : "")
    + "\n        "
    + ((stack1 = helpers["if"].call(alias2,((stack1 = (depth0 != null ? depth0.attrs : depth0)) != null ? stack1.loop : stack1),{"name":"if","hash":{},"fn":container.program(9, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\n      </video>\n\n"
    + ((stack1 = helpers["if"].call(alias2,(depth0 != null ? depth0.javascript : depth0),{"name":"if","hash":{},"fn":container.program(11, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n    </div>\n\n  </div>\n\n  "
    + ((stack1 = ((helper = (helper = helpers.children || (depth0 != null ? depth0.children : depth0)) != null ? helper : alias3),(typeof helper === alias4 ? helper.call(alias2,{"name":"children","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n\n</figure>\n";
},"useData":true});
})();
