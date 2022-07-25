// Write your scripts here to 
var osUtil = new global.OperatingSystemUtil();
var gr = new GlideRecord('u_crowdstrike_devices');
gr.query();
var log = [];
while (gr.next()) {
    var grOS = osUtil.parseCrowdstrikeOS(gr.u_platform_id, gr.u_os_version, gr.u_os_build, gr.u_product_type_desc);
    if (grOS) {
        gs.info(JSON.stringify([
            gr.u_platform_id.toString(),
            gr.u_os_version.toString(),
            gr.u_os_build.toString(),
            gr.u_product_type_desc.toString(),
            grOS.toString()
        ]));
    } else {
        gs.print(JSON.stringify([
            gr.u_platform_id.toString(),
            gr.u_os_version.toString(),
            gr.u_os_build.toString(),
            gr.u_product_type_desc.toString(),
            '******* Not Found ' + gr.u_os_version
        ]));
    }
}