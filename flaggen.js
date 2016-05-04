// ==UserScript==
// @name        DS_Flaggenscript
// @namespace   de.die-staemme
// @version     0.10/18.03.16
// @description Dieses Script setzt mit einem Klick alle möglichen Flaggen.
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       unsafeWindow
// @match       https://*.die-staemme.de/game.php?*mode=tech*
// @include     https://*.die-staemme.de/game.php?*mode=tech*
// @copyright   2015+, the stabel
// ==/UserScript==


/*
 * V 0.10: Beginn der Implementierung
 */
 
 var $ = typeof unsafeWindow != 'undefined' ? unsafeWindow.$ : window.$;
 
 var flaggenauswahl = {"Rohstoffproduktion":1,"Rekrutierungs-Geschwindigkeit":2,"Angriffsstärke":3,"Verteidigungsstärke":4,"Glück":5,"Reduzierte Münzkosten":6,"Beutekapazität":7};
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
	storageSet("flag",storageGet("flag",0))
	initUI();
	function initUI(){
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
	}
	
	
	function insert_flags(flag){
		var table 	= $("#techs_table");
		var rows 	= $("tr",table).slice(1);
		var row;
		
		//Mögliche Flaggen Auslesen:
		FlagsOverview.selectFlag(event, getPageAttribute("village"));
		setTimeout(function(){current_flags = getFlags();},1000);
		setTimeout(function(){
			for(var i = 0; i<rows.length; i++){
				row	= rows.eq(i);
				insert_flag_in_row(row,flag,current_flags);
			}
		},3000);
		//var flag_table = $("#flags_select_"+getPageAttribute("village")+"_content");
		
		
	}
	function insert_flag_in_row(row,flag,current_flags){
		//id des Dorfes in Spalte rausbekommen...
		
		var village_id 	= row.attr("id").substring(row.attr("id").indexOf("_")+1,row.attr("id").length);
		
		
		for(var tier in current_flags[flag]){
			if(current_flags[flag][tier]>0){	
				FlagsOverview.assignFlag(flag, tier, village_id);
				current_flags[flag][tier]	= current_flags[flag][tier]-1;
				console.log("id: "+village_id+" flag: "+flag+" tier: "+tier+" restliche Flaggen: "+current_flags[flag][tier]);
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
					/*flagname 	= $(this).text();
					flagname	= flagname.substring(0,flagname.indexOf("\n"));*/
					flagname	= i+1;
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