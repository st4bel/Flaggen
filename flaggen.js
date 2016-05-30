// ==UserScript==
// @name        DS_Flaggenscript
// @namespace   de.die-staemme
// @version     0.2
// @description Dieses Script setzt mit einem Klick alle möglichen Flaggen.
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       unsafeWindow
// @match       https://*.die-staemme.de/game.php?*mode=tech*
// @include     https://*.die-staemme.de/game.php?*mode=tech*
// @copyright   2015+, the stabel
// ==/UserScript==


/*
 * V 0.1: Beginn der Implementierung
 * V 0.2: Verlegung der Optionen in "extra" Fenster
 */

 var $ = typeof unsafeWindow != 'undefined' ? unsafeWindow.$ : window.$;

 var flaggenauswahl = {"Rohstoffproduktion":1,"Rekrutierungs-Geschwindigkeit":2,"Angriffsstärke":3,"Verteidigungsstärke":4,"Glück":5,"Einwohnerzahl":6,"Reduzierte Münzkosten":7,"Beutekapazität":8};
 var current_flags;
$(function(){

	var storage = localStorage;
    var storagePrefix="Flaggen_";
    //Speicherfunktionen
    function storageGet(key,defaultValue) {
        var value= storage.getItem(storagePrefix+key);
        return (value === undefined || value === null) ? defaultValue : value;
    }
    function storageSet(key,val) {
        storage.setItem(storagePrefix+key,val);
    }
    function glstorageGet(key,defaultValue){
        var value= storage.getItem("dskalation_"+key);
        return (value === undefined || value === null) ? defaultValue : value;
    }
    function glstorageSet(key,val) {
        storage.setItem("dskalation_"+key,val);
    }
	storageSet("flag",storageGet("flag",0));
    storageSet("asc_desc",storageGet("asc_desc","asc"));
    glstorageSet("groups",glstorageGet("groups",JSON.stringify({0:"alle"})));

    var mode 	= $(".selected",$(".modemenu"));
	if($("a",mode).eq(0).text().indexOf("Forschung")!=-1){
        //Prüf Routine starten
		initUI();
	}
	/*function initUI(){
		var table = $("#techs_table");
		var cell_flag = $("th",table).eq(-1);

		var select_flag = $("<select>")
		.append($("<option>").text("Auswählen").attr("value","0"))
		.attr("id","insertflag_select")
        .change(function(){
            storageSet("flag", $("option:selected",select_flag).val());
            console.log(storageGet("flag"));
			if($("option:selected",select_flag).val()==0){
				button_insert.attr("disabled","disabled")
			}else{
				button_insert.removeAttr("disabled")
			}
        });

		for(var name in flaggenauswahl){
			select_flag.append($("<option>").text(name).attr("value",flaggenauswahl[name]));
		}
		var button_insert	= $("<button>")
		.text("Einfügen")
        .click(function(){
            insert_flags($("option:selected",select_flag).val());

        });
		if($("option:selected",select_flag).val()==0){
			button_insert.attr("disabled","disabled")

		}
		var button_remove	= $("<button>")
		.text("Andere Löschen")
		.click(function(){

        });
		cell_flag.append(select_flag).append(button_insert).append(button_remove);
	}*/
    function initUI(){
        //Erstellen des Einstellungs-Fensters
        var command_data_form   = $("#command-data-form");
        var contentContainer    = $("#contentContainer");
        var settingsRow         = $("<tr>").prependTo(contentContainer);
        var settingsCell        = $("<td>").appendTo(settingsRow);

        var settingsTable       = $("<table>")
        .attr("class","content-border")
        .attr("width","100%")
        .appendTo(settingsCell)
        .append($("<h3>").text("DS Flaggenscript"));

        $("<tr>")
        .append($("<th>").text("Einfach"))
        .append($("<th>").text("Abläufe"))
        .appendTo(settingsTable);
        $("<tr>")
        .append($("<td>").attr("id","flag_select"))
        .append($("<td>").attr("id","flag_run"))
        .appendTo(settingsTable);




        var button_update_groups = $("<button>")
        .appendTo(settingsTable)
        .click(function(){
            getGroup();
        })
        .text("reload groups");


        var select_flag = $("<select>")
		.append($("<option>").text("Auswählen").attr("value","0"))
		.attr("id","insertflag_select")
        .change(function(){
            storageSet("flag", $("option:selected",select_flag).val());
            console.log(storageGet("flag"));
			if($("option:selected",select_flag).val()==0){
				button_insert.attr("disabled","disabled")
			}else{
				button_insert.removeAttr("disabled")
			}
        });
        var select_asc_desc = $("<select>")
        .append($("<option>").text("kleinste zuerst").attr("value","asc"))
        .append($("<option>").text("größte zuerst").attr("value","desc"))
        .attr("id","asc_desc_select")
        .change(function(){
            storageSet("asc_desc",$("option:selected",select_asc_desc).val());
            console.log(storageGet("asc_desc"));
        });

        var input_flag_lvl_border = $("<input>")
        .attr("type","text")
        .attr("size",2)
        .val("9")
        .on("input",function(){
            if(parseInt($(this).val())>0){
                //TODO do something
            }else if($(this).val()!=""){
                $(this).val("");
            }
        });

        var select_group = $("<select>")
        //.append($("<option>").text("Aktuelle").val("-1"))
        .attr("id","group_select")
        .change(function(){

        });
        var st_groups = JSON.parse(glstorageGet("groups"));


            //prüfe welche aktuelle gruppe
            var group_div = $("div.vis_item",$("#paged_view_content")).eq(0);
            var current_group_name = $("strong",group_div).eq(0).text();
            var current_group_id;
            current_group_name = current_group_name.substring(1,current_group_name.length-2);
            console.log("aktuelle Gruppe: "+current_group_name)
            console.log(JSON.stringify(st_groups))
            var vorhanden = false;
            for(var id in st_groups){
                $("<option>").appendTo(select_group).val(id).text(st_groups[id]);
                if(st_groups[id]==current_group_name){
                    current_group_id = id;
                    vorhanden = true;
                    console.log("mkay")
                }
            }
            if(!vorhanden){
                getGroup();
                setTimeout(function(){
                    //neuladen..
                    document.location.href = document.location.search;
                    console.log("neuladen")
                },500);
            }



        for(var name in flaggenauswahl){
			select_flag.append($("<option>").text(name).attr("value",flaggenauswahl[name]));
		}
		var button_insert	= $("<button>")
		.text("Einfügen")
        .click(function(){
            insert_flags($("option:selected",select_flag).val(),$("option:selected",select_asc_desc).val(),input_flag_lvl_border.val());

        });
        var button_add_order  = $("<button>")
        .text("Auftrag übertragen")
        .click(function(){
            var order = {};
            order.flag      = $("option:selected",select_flag).val();
            order.ascdesc   = $("option:selected",select_asc_desc).val();
            order.bound     = input_flag_lvl_border.val();
            order.group     = $("option:selected",select_group).val();
            addOrder(order);
        });
		if($("option:selected",select_flag).val()==0){
			button_insert.attr("disabled","disabled")

		}
		var button_remove	= $("<button>")
		.text("Andere Löschen")
		.click(function(){

        });

        //$("#flag_select").append(select_flag).append(button_insert).append(button_remove).append(input_flag_lvl_border);

        $("<table>")
        .appendTo($("#flag_select"))
        .attr("id","flag_select_table");

        $("<tr>").appendTo($("#flag_select_table"))
        .append($("<th>").text("Flagge"))
        .append($("<th>").text("asc/desc").attr("title","Zuerst die kleinsten Flaggen benutzen, oder die größten Flaggen?"))
        .append($("<th>").text("Grenzstufe").attr("title","Je nach asc/desc bis einschließlich folgende Stufe verwenden."))
        .append($("<th>").text("Gruppe"))
        .append($("<th>").text("Weitere Aktionen"));

        $("<tr>").appendTo($("#flag_select_table"))
        .append($("<td>").append(select_flag))
        .append($("<td>").append(select_asc_desc))
        .append($("<td>").append(input_flag_lvl_border))
        .append($("<td>").append(select_group))
        .append($("<td>").append(button_insert));


        $("<table>")
        .appendTo($("#flag_run"))
        .attr("id","flag_order_table");

        $("<tr>").appendTo($("#flag_order_table"))
        .append($("<th>").text("Flagge"))
        .append($("<th>").text("asc/desc"))
        .append($("<th>").text("Grenzstufe"))
        .append($("<th>").text("Gruppe"))
        .append($("<th>").text("Weitere Aktionen"));

        function addOrder(order){
            var table   = $("#flag_order_table");
            var tr      = $("<tr>").appendTo(table);

            $("<td>").appendTo(tr).append($("<span>").text(order.flag));
        }



        $('option[value="'+current_group_id+'"]',$("#group_select")).eq(0).prop('selected', true);

        function addRowtoSelectFlags(obj1,obj2){
            $("<tr>")
            .append(obj1)
            .append(obj2)
            .appendTo($("#flag_select_table"));
        }
    }
    function getGroup(){
        var groups = {};
        villageDock.open(event);
        setTimeout(function(){
            $("option",$("#group_id")).each(function(){
                if($(this).text()!=""){
                    groups[$(this).val()] = $(this).text();
                }
            });
            villageDock.close(event);
            glstorageSet("groups",JSON.stringify(groups));
        },100);
    }
	function insert_flags(flag,asc_desc,border){
		var table 	= $("#techs_table");
		var rows 	= $("tr",table).slice(1);
		var row;

		//Mögliche Flaggen Auslesen:
		FlagsOverview.selectFlag(event, getPageAttribute("village"));
		setTimeout(function(){
            current_flags = getFlags();
            console.log(JSON.stringify(current_flags))
        },1000);

		setTimeout(function(){
			for(var i = 0; i<rows.length; i++){
				row	= rows.eq(i);
				insert_flag_in_row(row,flag,current_flags,asc_desc,border);
			}
		},3000);
		//var flag_table = $("#flags_select_"+getPageAttribute("village")+"_content");


	}
	function insert_flag_in_row(row,flag,current_flags,asc_desc,border){
		//id des Dorfes in Spalte rausbekommen...
		var village_id 	= row.attr("id").substring(row.attr("id").indexOf("_")+1,row.attr("id").length);
		for(var tier in current_flags[flag]){
            //Verarbeitung: Aufsteigend/Absteigend und Grenzlevel der Flaggen
            if(asc_desc=="asc"){
                var flag_lvl = tier;
                if(flag_lvl>border){
                    console.log("Grenze erreicht!");
                    return;
                }
            }else{
                var flag_lvl = 10-tier;
                if(flag_lvl<border){
                    console.log("Grenze erreicht!");
                    return;
                }
            }
            console.log("Flaggen: "+current_flags[flag][flag_lvl]+" flag_lvl: "+flag_lvl);
			if(current_flags[flag][flag_lvl]>0){
				FlagsOverview.assignFlag(flag, flag_lvl, village_id);
				current_flags[flag][flag_lvl]	= current_flags[flag][flag_lvl]-1;
				console.log("id: "+village_id+" flag: "+flag+" tier: "+flag_lvl+" restliche Flaggen: "+current_flags[flag][flag_lvl]);
				return;
			}
		}
		console.log("keine Flaggen übrig");
	}
	/*function getFlags(){
		FlagsOverview.selectFlag(event, getPageAttribute("village"));
		setTimeout(var flags = readFlags,1000);
		$("#closelink_flags_select_"+getPageAttribute("village")).click();

	}*/
	function getFlags(){

		var table 	= $("#flags_select_"+getPageAttribute("village")+"_content");
		var rows 	= $("tr",table).slice(1);
		var row;
		var flagname;
		var flags = {};
		for(var i = 0; i<rows.length; i++){
			row	= rows[i];

			$("td",row).each(function(j){
				//erste Spalte enthält flaggenname
				if(j==0){
                    for(var name in flaggenauswahl){
                        if($(this).text().indexOf(name)>-1){
                            flagname = flaggenauswahl[name];
                        }
                        //flagname = $(this).text()==name?flaggenauswahl[name]:flagname;
                    }
					flags[flagname]={};
				}else{
					flags[flagname][j]=parseInt($("a",$(this)).eq(0).text())>0?parseInt($("a",$(this)).eq(0).text()):0;
				}

			});
		}
		$("#closelink_flags_select_"+getPageAttribute("village")).click();
		return flags;
	}
	function getPageAttribute(attribute){
        //gibt den Screen zurück, also z.B. von* /game.php?*&screen=report*
        //wenn auf confirm-Seite, dann gibt er "confirm" anstatt "place" zurück
        //return: String
        var params = document.location.search;
        var value = params.substring(params.indexOf(attribute+"=")+attribute.length+1,params.indexOf("&",params.indexOf(attribute+"=")) != -1 ? params.indexOf("&",params.indexOf(attribute+"=")) : params.length);
        return params.indexOf(attribute+"=")!=-1 ? value : "0";
    }
});
