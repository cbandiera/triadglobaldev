var osParser = new OperatingSystemParser();
var gr = new GlideRecord('u_tenable_integration');
gr.addEncodedQuery('sys_import_set=7aef0b261bc99590cb52a64b234bcb57');
gr.query();
var log = [];
var count = 0;
while (gr.next()) {
    var os_text = gr.u_operating_system;
    name = os_text.toUpperCase();
    var osTypePattern = /\b(WINDOWS|MAC|MACOS|IOS|UBUNTU|LINUX|UNIX|ANDROID)/ig;
    var osTypeMatch = osTypePattern.exec(name);
    if (osTypeMatch) {
        var osTypeFound = osTypeMatch[1].toUpperCase();
        gs.info(osTypeMatch + ' - ' + os_text);
    } else {
        var parsed = osParser.cleanseOperatingSystemType(os_text);
        var objVersion =
            log.push(parsed + ' - ' + os_text);
        count++;
        if (count > 100) {
            break;
        }
    }
}
gs.info(log);

// // Write your scripts here to 
// var osUtil = new global.OperatingSystemUtil();
// var gr = new GlideRecord('u_crowdstrike_devices');
// gr.query();
// var log = [];
// while (gr.next()) {
//     var grOS = osUtil.parseCrowdstrikeOS(gr.u_platform_id, gr.u_os_version, gr.u_os_build, gr.u_product_type_desc);
//     if (grOS) {
//         gs.info(JSON.stringify([
//             gr.u_platform_id.toString(),
//             gr.u_os_version.toString(),
//             gr.u_os_build.toString(),
//             gr.u_product_type_desc.toString(),
//             grOS.toString()
//         ]));
//     } else {
//         gs.print(JSON.stringify([
//             gr.u_platform_id.toString(),
//             gr.u_os_version.toString(),
//             gr.u_os_build.toString(),
//             gr.u_product_type_desc.toString(),
//             '******* Not Found ' + gr.u_os_version
//         ]));
//     }
// }