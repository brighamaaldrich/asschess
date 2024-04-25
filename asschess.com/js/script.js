function changeTabs(e) {
	var con_tab = document.getElementById("con-tab");
	var engine_tab = document.getElementById("engine-tab");
	var con_holder = document.getElementById("con-holder");
	var engine_holder = document.getElementById("engine-holder");
	var connections = document.getElementById("connections");
	var engine_panel = document.getElementById("engine-panel");
	if (e.target.id == "con-tab" && con_tab.classList.contains("un-sel")) {
		con_tab.classList.remove("un-sel");
		engine_tab.classList.add("un-sel");
		con_holder.classList.remove("un-sel");
		engine_holder.classList.add("un-sel");
		connections.classList.remove("hidden-panel");
		engine_panel.classList.add("hidden-panel");
	} else if (
		e.target.id == "engine-tab" &&
		engine_tab.classList.contains("un-sel")
	) {
		engine_tab.classList.remove("un-sel");
		con_tab.classList.add("un-sel");
		engine_holder.classList.remove("un-sel");
		con_holder.classList.add("un-sel");
		engine_panel.classList.remove("hidden-panel");
		connections.classList.add("hidden-panel");
	}
}

var con_tab = document.getElementById("con-tab");
var engine_tab = document.getElementById("engine-tab");
con_tab.addEventListener("click", changeTabs);
engine_tab.addEventListener("click", changeTabs);
