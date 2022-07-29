/** cleanup operating systems */
function run() {
  var gr = new GlideRecord('u_cmdb_ci_operating_system');
  gr.query();
  var counter = 0;
  while (gr.next()) {
    try {
      gr.deleteRecord();
      counter++;
    } catch (error) {
      gs.info(error);
    }
  }
  // eslint-disable-next-line no-redeclare
  var gr = new GlideRecord('u_cmdb_operating_system_product_model');
  gr.query();
  // eslint-disable-next-line no-redeclare
  var counter = 0;
  while (gr.next()) {
    try {
      gr.deleteRecord();
      counter++;
    } catch (error) {
      gs.info(error);
    }
  }
  return counter;
}

run();






/*** Parse Jamf payload */
var osUtil = new global.OperatingSystemUtil();
var osNames = {};
var log = [];
// eslint-disable-next-line no-redeclare
function run() {
  var gr = new GlideRecord('x_woph_wp_jamf_int_wp_jamf_data_source');
  gr.addEncodedQuery('sys_import_set=20ea471b1b789d10cb52a64b234bcbf1');
  gr.query();
  var output;
  while (gr.next()) {
    var name = '' + gr.u_os_name;
    var version = '' + gr.u_os_version;
    if (osNames[name]) {
      osNames[name]++;
    } else {
      osNames[name] = 1;
    }
    try {
      if (name && version) {
        output = osUtil.getOrCreateOperatingSystemModel(name, version);
      }
      //log.push(name + ' - ' + version + ' - ' + output);
    } catch (err) {
      gs.error(name + ' - ' + version + ' - ' + err);
    }
  }
  return log;
}
run();
osNames;

/** parse Crowdstrike devices */
// eslint-disable-next-line no-redeclare
var osUtil = new OperatingSystemUtil();
var appleParser = new OperatingSystemAppleParser();
var gr = new GlideRecord('u_crowdstrike_devices');
gr.query();
// eslint-disable-next-line no-redeclare
var log = [];
while (gr.next() || false) {
  //gs.info(JSON.stringify([gr.u_platform_id.toString(), gr.u_os_version.toString(), gr.u_os_build.toString(), gr.u_product_type_desc.toString()]))
  var platformID = gr.u_platform_id.toString();
  var osVersion = gr.u_os_version.toString();
  var osBuild = gr.u_os_build.toString();
  var productType = gr.u_product_type_desc.toString();

  var grOS = osUtil.parseCrowdstrikeOS(platformID, osVersion, osBuild, productType);
  if (grOS) {
    continue;
    // gs.info(JSON.stringify([
    //   gr.u_platform_id.toString(),
    //   gr.u_os_version.toString(),
    //   gr.u_os_build.toString(),
    //   gr.u_product_type_desc.toString(),
    //   grOS.toString()
    // ]));
  } else {
    gs.info(JSON.stringify(
      [platformID, osVersion, osBuild, productType, '* Not Found *']));
  }
}




// eslint-disable-next-line no-redeclare
var grOS = new GlideRecord('u_cmdb_operating_system_product_model');
grOS.query();
count = 0;
while (count < 1000 && grOS.next()) {
  var grCIOS = new GlideRecord('u_cmdb_ci_operating_system');
  grCIOS.addQuery('model_id', grOS.sys_id);
  grCIOS.query();
  if (grCIOS.next()) {
    gs.info(grOS.getDisplayValue() + ' - has CI');
  } else {
    grOS.deleteRecord();
  }
  count++;
}








/*
call OS discovery routines
*/

name = 'windows';
version = '10.0.22000.795';


// eslint-disable-next-line no-redeclare
var osUtil = new global.OperatingSystemUtil();
var type = osUtil.cleanseOperatingSystemType(name); //getOrCreateOperatingSystemModel




var grOSModel = osUtil.getOperatingSystemModel(type, name, version);

//if (!grOSModel) grOSModel = this.createOperatingSystemModel(type, name, version);

//        if (grOSModel) return grOSModel.getUniqueValue();


//return { grOSModel: grOSModel, name: name, version: version, type: type }

grOSModel.query();
while (grOSModel.next()) {
  gs.info(grOSModel.getDisplayValue());
}

grOSModel;










/*
    count distinct operating systems used by comnputers
*/

// eslint-disable-next-line no-redeclare
var gr = new GlideAggregate('u_cmdb_ci_operating_system');
gr.groupBy('model_id');
gr.addAggregate('count');
gr.orderBy('model_id');
//gr.setLimit(100);
//gr.setWorkflow(false);
//gr.autoSysFields(false);
gr.query();

while (gr.next()) {
  gs.info(gr.model_id.display_name.toString() + ' = ' + gr.getAggregate('count'));

}